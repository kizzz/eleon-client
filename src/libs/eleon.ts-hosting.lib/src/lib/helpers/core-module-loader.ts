import { EleoncoreError, IApplicationConfigurationManager } from '@eleon/contracts.lib';
import { ApplicationModuleDto, ErrorHandlingLevel } from '@eleon/application-configuration-proxy';
import { IModuleLoaderManager } from '@eleon/contracts.lib';

declare global {
  interface Window {
    environment?: {
      eleoncoreErrors: EleoncoreError[];
    };
    __eleoncoreErrorHandlingInitialized?: boolean;
    __eleoncoreErrorSubscribers?: ((error: EleoncoreError) => void)[];
    moduleLoader: IModuleLoaderManager;
    applicationConfiguration: IApplicationConfigurationManager;
    addEleoncoreError?: (error: string | EleoncoreError) => void;
    setEleoncoreErrorLevel?: (level: ErrorHandlingLevel) => void;
  }
}


if (typeof window !== "undefined" && !window['getUserToken']) {
  window['getUserToken'] = () => null;
}

const getSelfDomain = () => {
  return window.location.protocol + '//' + window.location.host;
};

async function fetchModuleSettings(url: string): Promise<Record<string, any>> {
  try {
    const cleanedUrl = url ? url.replace(/\/$/, '') + '/assets/eleoncore-module-settings.json' : 'assets/eleoncore-module-settings.json';
    const response = await fetch(cleanedUrl);
    if (!response.ok) throw new Error(`Failed to fetch settings from ${url}`);
    const parsed = await response.json();

    const settings: Record<string, any> = parsed?.moduleSettings ?? {};
    if (parsed?.remoteDependencies?.length) {
      settings['RemoteDependencies'] = {
        key: 'RemoteDependencies',
        type: 'array',
        value: JSON.stringify(parsed.remoteDependencies)
      };
    }

    return settings;
  } catch (e) {
    console.warn(`Could not load settings for module ${url}`, e);
    return {};
  }
}

export async function getModulesWithSettings(inputModules: ApplicationModuleDto[]): Promise<ApplicationModuleDto[]> {
  const allModules: Record<string, any> = {};
  const orderedModules: any[] = [];
  const queue = [...inputModules];

  while (queue.length > 0) {
    const module = queue.shift();
    if (allModules[module.url]) continue;

    const settings = await fetchModuleSettings(module.url);

    // Merge settings into module.properties
    const mergedProps: Record<string, any> = { ...settings };
    if (Array.isArray(module.properties)) {
      for (const prop of module.properties) {
        mergedProps[prop.key] = prop;
      }
    }
    module.properties = Object.values(mergedProps);
    allModules[module.url] = module;
    orderedModules.push(module);

    try {
      const depsRaw = mergedProps['RemoteDependencies']?.value ?? '[]';
      const dependencies = JSON.parse(depsRaw);
      for (const dep of dependencies) {
        if (!allModules[dep.url]) {
          queue.push({ url: dep.url, expose: dep.expose, properties: [], orderIndex: 1 });
        }
      }
    } catch (e) {
      console.warn(`Invalid dependency config in ${module.name}`, e);
    }
  }

  return orderedModules;
}


export function computeRemoteDefinitions(modules: any[]): Record<string, string> {
  const domain = getSelfDomain();
  return modules.reduce((acc, module) => {
    const modulePath = module.url.startsWith("/") ? `${domain}${module.url}` : module.url;
    acc[module.url] = modulePath;
    return acc;
  }, {} as Record<string, string>);
}
