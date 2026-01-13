import { IApplicationConfigurationManager, IAssetLoaderService } from '@eleon/contracts.lib';

const getSelfDomain = () => {
  {
    return window.location.protocol + '//' + window.location.host;
  }
};

export class AssetLoaderService extends IAssetLoaderService {
  constructor(
    private config: IApplicationConfigurationManager
  ) {
    super();
  }

  override addModuleHeadAssetWithId(moduleName: string, path: string, assetId: string) {
    const modules = this.config.getAppConfig()['modules'];
    const module = modules.find(t => t.name == moduleName);
    if (module) {
      if (module.url.startsWith("/")) {
        this.addHeadCssWithId(`${getSelfDomain()}${module.url}/${path}`, assetId);
      }
      else {
        this.addHeadCssWithId(`${module.url}/${path}`, assetId);
      }
    }
  }
  override addHeadCss(url: string): void {
    if (document.querySelector(`link[href="${url}"]`)) { 
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  override addHeadScript(url: string): void {
    // Check if the script is already added by comparing URLs
    const existingScripts = document.querySelectorAll('script[src]');
    for (const script of Array.from(existingScripts)) {
      if ((script as HTMLScriptElement).src === url) {
        console.log(`Script with URL ${url} is already present.`);
        return;
      }
    }
  
    // Create and append the <script> element
    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.async = false; // Set to true if you want it to load asynchronously
  
    script.onload = () => {
      console.log(`Script ${url} loaded successfully.`);
    };
  
    script.onerror = () => {
      console.error(`Failed to load script ${url}.`);
    };
  
    document.head.appendChild(script);
  }
  

  override addHeadCssWithId(url: string, id: string): void {
    // Check if a <link> element with the given ID exists
    if (document.getElementById(id)) {
      console.log(`CSS with ID ${id} is already added.`);
      return;
    }

    // Check if any existing <link> element has the same URL
    const existingLinks = document.querySelectorAll('link[rel="stylesheet"]');
    existingLinks.forEach((link) => {
      if (link.getAttribute('href') === url) {
        console.log(`CSS file ${url} is already added.`);
        return;
      }
    });

    // If not found, add the CSS file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.id = id;

    document.head.appendChild(link);
    console.log(`CSS ${url} added successfully.`);
  }

}
