import { IApplicationConfigurationManager, ApplicationLocalizationDto } from '@eleon/contracts.lib';
import { Localization, LocalizationSchema, IDynamicLocalizationService, ILocalizationService } from '@eleon/contracts.lib'; // Adjust path to your model


export class DynamicLocalizationService extends IDynamicLocalizationService {
  constructor(
    private localizationService: ILocalizationService,
    private configStateService: IApplicationConfigurationManager
  ) {
    super();
  }

  getCulture(): string {
    return (
      this.localizationService.currentLang ??
      this.configStateService.getAppConfig()?.localization?.currentCulture?.cultureName ??
      'en'
    );
  }

  async addLocalizationBySchema(
    schema: LocalizationSchema,
    urlFactory: (culture: string) => string
  ): Promise<void> {
    const culture = this.getCulture();
    const url = urlFactory(culture);

    try{
      if (schema === LocalizationSchema.Ec) {
        try{
          const result: Localization = await (await fetch(url)).json();
          await this.localizationService.addLocalization([result]);
        }
        catch (error) {
          console.error('Error fetching localization:', error);
        }
      } else {
        const result = await this.getLocalizationByUrl(url);
        this.localizationService.addLocalization(
          [
            {
              culture,
              resources: Object.entries(result).map(([resourceName, resource]) => ({
                resourceName,
                texts: resource.texts,
              })),
            },
          ]
        );
      }
    }
    catch (err) {
      console.error('Error adding localization:', err);
    }
  }

  private async getLocalizationByUrl(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch localization from ${url}: ${response.statusText}`);
    }

    const result: ApplicationLocalizationDto = await response.json();
    return result.resources;
  }
}
