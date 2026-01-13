
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IApplicationConfigurationManager } from '@eleon/angular-sdk.lib';
import { FeaturesService } from '@eleon/tenant-management-proxy';
import {
  FeatureDto,
  FeatureGroupDto,
  UpdateFeatureDto,
} from '@eleon/tenant-management-proxy';
import { finalize } from "rxjs";
import { PageStateService } from "@eleon/primeng-ui.lib";
import { ConfirmationService } from "primeng/api";

import { ILocalizationService } from '@eleon/angular-sdk.lib';
enum ValueTypes {
  ToggleStringValueType = "ToggleStringValueType",
  FreeTextStringValueType = "FreeTextStringValueType",
  SelectionStringValueType = "SelectionStringValueType",
}

@Component({
  standalone: false,
  selector: "app-tenant-feature-settings-dialog",
  templateUrl: "./tenant-feature-settings-dialog.component.html",
  styleUrl: "./tenant-feature-settings-dialog.component.scss",
})
export class TenantFeatureSettingsDialogComponent {
  @Input()
  public showDialog: boolean = false;
  @Output()
  public showDialogChange = new EventEmitter<boolean>();

  providerKey: string;
  providerName: string = "T";

  selectedGroupDisplayName: string;

  selectedGroup: FeatureGroupDto;
  groups: Pick<FeatureGroupDto, "name" | "displayName">[] = [];

  features: {
    [group: string]: Array<
      FeatureDto & { style?: { [key: string]: number }; initialValue: any }
    >;
  };

  loading = false;
  valueTypes = ValueTypes;

  modalBusy = false;

  constructor(
    protected service: FeaturesService,
    protected configState: IApplicationConfigurationManager,
    protected confirmationService: ConfirmationService,
    public state: PageStateService,
    public localizationService: ILocalizationService
  ) {}

  onDialogVisibleChange(visible: boolean): void {
    this.showDialog = visible;
    this.showDialogChange.emit(visible);
  }

  public show(tenant: string): void {
    this.showDialog = true;
    this.showDialogChange.emit(true);
    this.providerKey = tenant;
    this.getFeatures();
  }

  public cancel(): void {
    this.showDialog = false;
    this.showDialogChange.emit(false);
  }

  getFeatures() {
    this.service.get(this.providerName, this.providerKey).subscribe((res) => {
      if (!res.groups?.length) return;
      this.groups = res.groups.map(({ name, displayName }) => ({
        name,
        displayName,
      }));
      this.selectedGroupDisplayName = this.groups[0].displayName;
      this.features = res.groups.reduce(
        (acc, val) => ({
          ...acc,
          [val.name]: mapFeatures(
            val.features,
            document.body.dir
          ),
        }),
        {}
      );
    });
  }

  save() {
    if (this.modalBusy) return;

    const changedFeatures = [] as UpdateFeatureDto[];

    Object.keys(this.features).forEach((key) => {
      this.features[key].forEach((feature) => {
        if (feature.value !== feature.initialValue)
          changedFeatures.push({
            name: feature.name,
            value: `${feature.value}`,
          });
      });
    });

    if (!changedFeatures.length) {
      this.cancel();
      return;
    }

    this.modalBusy = true;
    this.loading = true;
    this.service
      .update(this.providerName, this.providerKey, {
        features: changedFeatures,
      })
      .pipe(finalize(() => ((this.modalBusy = false), (this.loading = false))))
      .subscribe(() => {
        this.cancel();

        if (!this.providerKey) {
          // to refresh host's features
          this.configState.refreshAppState().subscribe();
        }
      });
  }

  resetToDefault() {
    this.confirmationService.
    confirm({
      message: this.localizationService.instant("AbpFeatureManagement::AreYouSureToResetToDefault"),
      header: this.localizationService.instant("TenantManagement::Warning"),
      icon: "pi pi-exclamation-triangle text-warning",
      accept: () => {
        this.service
        .delete(this.providerName, this.providerKey)
        .subscribe(() => {
          // this.toasterService.success(
          //   "AbpFeatureManagement::ResetedToDefault"
          // );
          this.cancel();
          if (!this.providerKey) {
            // to refresh host's features
            this.configState.refreshAppState().subscribe();
          }
        });
      },
      reject: () => {
        return;
      },
      acceptLabel: this.localizationService.instant("Infrastructure::Yes"),
      rejectLabel: this.localizationService.instant("Infrastructure::No"),
      acceptButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-info",
      acceptIcon: "pi pi-check",
      rejectButtonStyleClass: "p-button-md p-button-raised p-button-text p-button-danger",
      rejectIcon: "pi pi-times",
    },
  );
  }

  onCheckboxClick(val: boolean, feature: FeatureDto) {
    if (val) {
      this.checkToggleAncestors(feature);
    } else {
      this.uncheckToggleDescendants(feature);
    }
  }

  private uncheckToggleDescendants(feature: FeatureDto) {
    this.findAllDescendantsOfByType(
      feature,
      ValueTypes.ToggleStringValueType
    ).forEach((node) => this.setFeatureValue(node, false));
  }

  private checkToggleAncestors(feature: FeatureDto) {
    this.findAllAncestorsOfByType(
      feature,
      ValueTypes.ToggleStringValueType
    ).forEach((node) => this.setFeatureValue(node, true));
  }

  private findAllAncestorsOfByType(feature: FeatureDto, type: ValueTypes) {
    let parent = this.findParentByType(feature, type);
    const ancestors = [];
    while (parent) {
      ancestors.push(parent);
      parent = this.findParentByType(parent, type);
    }
    return ancestors;
  }

  private findAllDescendantsOfByType(feature: FeatureDto, type: ValueTypes) {
    const descendants = [];
    const queue = [feature];

    while (queue.length) {
      const node = queue.pop();
      const newDescendants = this.findChildrenByType(node, type);
      descendants.push(...newDescendants);
      queue.push(...newDescendants);
    }

    return descendants;
  }

  private findParentByType(feature: FeatureDto, type: ValueTypes) {
    return this.getCurrentGroup().find(
      (f) => f.valueType.name === type && f.name === feature.parentName
    );
  }

  private findChildrenByType(feature: FeatureDto, type: ValueTypes) {
    return this.getCurrentGroup().filter(
      (f) => f.valueType.name === type && f.parentName === feature.name
    );
  }

  private getCurrentGroup() {
    return this.features[this.selectedGroupDisplayName] ?? [];
  }

  private setFeatureValue(feature: FeatureDto, val: boolean) {
    feature.value = val as any;
  }
}

function mapFeatures(features: FeatureDto[], dir: string) {
  const margin = `margin-${dir === "rtl" ? "right" : "left"}.px`;

  return features.map((feature) => {
    const value =
      feature.valueType?.name === ValueTypes.ToggleStringValueType
        ? (feature.value || "").toLowerCase() === "true"
        : feature.value;

    return {
      ...feature,
      value,
      initialValue: value,
      style: { [margin]: feature.depth * 20 },
    };
  });
}
