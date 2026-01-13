import { CommonOrganizationUnitDto } from '@eleon/identity-querying.lib';

export class OrganizationUnitSelectionEvent {
  constructor(
    public selectedAll: boolean,
    public selectedOrgUnit: CommonOrganizationUnitDto,
    public selecting: boolean,
    public readonly: boolean = false,
    public selectedOrgUnits: CommonOrganizationUnitDto[] = null,
    public selectionFinished: boolean = false
  ) {}
}
