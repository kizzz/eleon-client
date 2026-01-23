import { IModuleSettingService, Setting, IApplicationConfigurationManager } from '@eleon/contracts.lib'


export class ModuleSettingService extends IModuleSettingService {
    protected applicationSettings: Map<string, Setting> = new Map();
    protected moduleSettings: Map<string, Map<string, Setting>> = new Map();

    constructor(
        appConfigService: IApplicationConfigurationManager
    ) {
        super();
        console.log("Settings service initialized");

        const appSettingsArr: Setting[] = appConfigService.getAppConfig()?.['clientApplication']?.properties || [];
        const modules = appConfigService.getAppConfig()?.['modules'] || [];

        // Store application settings
        for (const s of appSettingsArr) {
            this.applicationSettings.set(s.key, s);
        }

        // Store module settings under their module "level"
        for (const mod of modules) {
            const level = mod.name;
            const modSettingsArr: Setting[] = mod.properties || [];

            const modMap = new Map<string, Setting>();
            for (const s of modSettingsArr) {
                modMap.set(s.key, { ...s, level });
            }

            this.moduleSettings.set(level, modMap);
        }
    }

    getAllApplicationSettings(): Setting[] {
        return Array.from(this.applicationSettings.values());
    }

    getAllModuleSettings(): Record<string, Setting[]> {
        const result: Record<string, Setting[]> = {};
        this.moduleSettings.forEach((map, level) => {
            result[level] = Array.from(map.values());
        });
        return result;
    }

    getSettingsByLevel(level: string): Setting[] {
        if (!level) throw new Error("Level must be defined");

        if (level === 'application') {
            return this.getAllApplicationSettings();
        }

        return Array.from(this.moduleSettings.get(level)?.values() || []);
    }

    getSettingByKey(level: string, key: string): Setting | undefined {
        if (level === 'application') {
            return this.applicationSettings.get(key);
        }

        return this.moduleSettings.get(level)?.get(key);
    }
}
