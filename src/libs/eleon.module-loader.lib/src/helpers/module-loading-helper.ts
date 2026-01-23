import { ActivatedRouteSnapshot, ChildActivationEnd, NavigationEnd, Route, Router, ROUTES, Routes } from "@angular/router";
import { loadRemoteModule } from "@nx/angular/mf";
import { ENVIRONMENT_INITIALIZER, Type } from '@angular/core';
import { computeRemoteDefinitions } from '@eleon/common-services.lib';
import { FOR_INITIALIZATION, IModuleLoadingObservableService } from '@eleon/angular-sdk.lib';
import { filter } from "rxjs";
import { SignInComponent } from './signin.component'
import { ErrorEmptyComponent } from './error-empty-component'

export function isNgModule(moduleType: Type<any>): boolean {
    return moduleType.hasOwnProperty('ɵmod');
}

/**
 * Finds the deepest activated route snapshot in the route tree.
 */
export function findDeepestChild(snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    while (snapshot.firstChild) {
        snapshot = snapshot.firstChild;
    }
    return snapshot;
}

/**
 * Finds the closest ancestor route with a root module.
 */
export function findAncestorWithRootModule(snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot | null {
    let current = snapshot;
    while (current.parent) {
        current = current.parent;
        if (current.routeConfig?.data?.['isRouteForModuleLoading'] === true) {
            return current;
        }
    }
    return null;
}

/**
 * Converts module definitions into route configurations.
 */
export function convertModulesToRoutes(modules: any[], moduleLoading: IModuleLoadingObservableService, isRoot: boolean = false): Routes {
    return modules.map((module) => ({
        path: isRoot ? '**' : '',
        loadChildren: async () => {
            let moduleRoutes = [];
            let appConfigRoutes = [];
            moduleLoading.modulesLoadingSubject.next(true);
            try {
                let loadedModule = null;
                if (module.moduleType) {
                    loadedModule = { [(module as any).moduleType.name]: (module as any).moduleType };
                }
                else {
                    loadedModule = await loadRemoteModule(module?.url ?? '', module.expose);
                }

                moduleRoutes = Object.values(loadedModule)
                    .filter(isNgModule)
                    .map((module: any): Route => ({
                        path: '',
                        loadChildren: () => module,
                    }));
                appConfigRoutes = Object.values(loadedModule)
                    .filter((m: any) => !isNgModule(m))
                    .flatMap(((appConfig: any) => {
                        if (!appConfig.providers) {
                            return [];
                        }
                        const routes = appConfig.providers
                            .map(p => p?.ɵproviders?.find(t => t.provide == ROUTES))
                            .find(p => p);

                        const bootstrapComponent = appConfig.providers
                            .find(p => p?.provide == 'INITIALIZATION_COMPONENT')
                            ?.useValue;

                        if (bootstrapComponent) {
                            return [{
                                path: '',
                                component: bootstrapComponent,
                                loadChildren: () => {
                                    return routes?.useValue ?? [];
                                },
                            }];
                        }

                        return routes?.useValue ?? [];
                    }));
            }
            catch (err) {
                window['addEleoncoreError'](err);
            }
            finally {
                moduleLoading.modulesLoadingSubject.next(false);
                moduleLoading.moduleLoadedSubject.next({
                    name: module.name,
                });
            }
            return [...moduleRoutes, ...appConfigRoutes];
        },
        data: { isRouteForModuleLoading: isRoot },
    }));
}

export function extractProvidersFromLoadedModule(loadedModule: any): any[] {
    const collected: any[] = [];

    Object.values(loadedModule)
        .filter(isNgModule)
        .forEach((ngModule: any) => {
            const forRootResult = ngModule?.['ɵinj']?.providers?.filter(p => p.provide === FOR_INITIALIZATION)?.map(p => p.useValue);
            if (forRootResult) collected.push(...forRootResult);
        });

    Object.values(loadedModule)
        .filter((m: any) => !isNgModule(m))
        .forEach((item: any) => {
            const forRootResult = item?.providers?.filter(p => p.provide === FOR_INITIALIZATION)?.map(p => p.useValue);
            if (forRootResult) collected.push(...forRootResult);
        });

    return collected;
}

const defaultRoutes = [
  {
    path: 'signin-oidc',
    component: SignInComponent,
  },
  {
    path: 'empty-error',
    component: ErrorEmptyComponent,
  },
];

/**
 * Adds routes dynamically based on the modules provided.
 */
export function addRoutes(modules: any[], router: Router, moduleLoading: IModuleLoadingObservableService): void {
    const moduleRoutes = convertModulesToRoutes(modules, moduleLoading, true);
    router.resetConfig([...router.config, ...defaultRoutes, ...moduleRoutes]);
}

/**
 * Listens for navigation events to dynamically modify routes.
 */
export function activateSubModules(enabledSubmodules: any[], router: Router, moduleLoading: IModuleLoadingObservableService): void {
    let routeConfigurationCompleted = false;
    router.events
        .pipe(filter((event) => event instanceof ChildActivationEnd))
        .subscribe((event) => {
            if (event instanceof ChildActivationEnd && !routeConfigurationCompleted && !router.url.startsWith('/signin-oidc')) {
                modifyChildRoutes(enabledSubmodules, router, moduleLoading);
                routeConfigurationCompleted = true;
                document.getElementById("splash-screen")?.classList?.add("hidden");
            }
        });
}

/**
 * Modifies child routes dynamically based on enabled submodules.
 */
export function modifyChildRoutes(enabledSubmodules: any[], router: Router, moduleLoading: IModuleLoadingObservableService): void {
    const newChildRoutes = convertModulesToRoutes(enabledSubmodules, moduleLoading, false);
    const currentRoute = findDeepestChild(router.routerState.snapshot.root);
    const rootModuleRoute = findAncestorWithRootModule(currentRoute);

    if (!currentRoute?.routeConfig) {
        console.error('Parent route not found or has no routeConfig');
        return;
    }

    if (!currentRoute?.routeConfig?.data?.routeForLoadingSubmodules) {
        console.error("Parent route has no routeForLoadingSubmodules flag. Modules won't' be loaded")
        return;
    }

    if (rootModuleRoute?.routeConfig) {
        rootModuleRoute.routeConfig.path = '';
    }

    currentRoute.routeConfig.children = [...(currentRoute.routeConfig.children || []), ...newChildRoutes];
    router.resetConfig(router.config);
    router.navigateByUrl(router.url);
}



export async function logAngularRemoteModulesProvidersUse() {
    if (window['remoteModulesPreloaded']) {
        if (window['remoteModulesProvidersUsed']) {
            // console.log("Remote modules' providers were used!")
            return;
        }
        window['addEleoncoreError'](
            "Modules were loaded via loadRemoteModules,"
            + " but remote module providers weren't passed to bootstrapApplication(). "
            + "Please, make sure to pass them to let the modules load."
        );
    }
}

export function getBaseProviders(): any[] {
    return [
        {
            provide: ENVIRONMENT_INITIALIZER,
            useFactory: () => () => {
                window['remoteModulesProvidersUsed'] = true;
            },
            multi: true,
        },
    ];
}

export function getRemoteDefinitionsFromConfig(config: { modules: any[] }) {
    return computeRemoteDefinitions(config.modules);
}

export function addBootstrapModuleToConfig(bootstrapModule: Type<any>, config: { modules: any[] }) {
    const moduleType = bootstrapModule;
    if (!moduleType) return;

    config.modules.push({
        name: 'LocalSubModule',
        moduleType,
        parentId: '__local__',
        url: '',
    } as any);
}

export async function loadModuleAndExtractProviders(module: any): Promise<any[]> {
    try {
        let loaded: any;
        if ((module as any).moduleType) {
            loaded = { [(module as any).moduleType.name]: (module as any).moduleType };
        } else {
            loaded = await loadRemoteModule(module.url, module.expose);
        }
        return extractProvidersFromLoadedModule(loaded);
    } catch (err) {
        window['addEleoncoreError']?.(`Failed to load ${module.name}: ${err.message}`);
        return [];
    }
}

export async function loadRootModules(modules: any[], loadedModules: Set<string>): Promise<any[][]> {
    const results: any[][] = [];
    for (const module of modules) {
        if (module.loadLevel !== 'RootModule' || loadedModules.has(module.url)) continue;

        const providers = await loadModuleAndExtractProviders(module);
        if (!(module as any).moduleType) {
            loadedModules.add(module.url);
        }
        results.push(providers);
    }
    return results;
}

export async function loadNonRootModules(modules: any[], loadedModules: Set<string>): Promise<any[][]> {
    const promises = modules.map(async (module) => {
        if (module.loadLevel === 'RootModule' || loadedModules.has(module.url)) return [];

        const providers = await loadModuleAndExtractProviders(module);
        loadedModules.add(module.url);
        return providers;
    });
    return await Promise.all(promises);
}
