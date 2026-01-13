export async function getRemoteInfo(remoteUrl: string) {
    // const container = await loadRemoteContainer(remoteUrl);
  
    const pluginName = await extractPluginName(remoteUrl);
    const exposes = await extractExposes(remoteUrl);
    const defaultLoadLevel = await extractPluginLoadLevel(remoteUrl) ?? "2";
  
    return {
      pluginName,
      exposes,
      defaultLoadLevel,
    };
  }
  
  async function extractPluginLoadLevel(remoteUrl: string): Promise<string | null> {
    // Normalize URL by stripping any filename like remoteEntry.mjs or remoteEntry.js
    const strippedUrl = remoteUrl.replace(/\/[^\/]+\.(mjs|js)$/, '');
  
    // Ensure trailing slash before appending the settings file
    const baseUrl = strippedUrl.endsWith('/') ? strippedUrl : `${strippedUrl}/`;
  
    // Construct the full path to the settings file
    const settingsUrl = `${baseUrl}assets/eleoncore-module-settings.json`;
  
    try {
      const res = await fetch(settingsUrl);
      if (!res.ok) {
        throw new Error(`Failed to fetch ${settingsUrl}: ${res.statusText}`);
      }
  
      const settings = await res.json();
      return settings.defaultLoadLevel ?? null;
    } catch (error) {
      console.error(`Error loading plugin settings from ${settingsUrl}:`, error);
      return null;
    }
  }

  async function extractExposes(remoteUrl: string): Promise<string[]> {
    const containerUrl = resolveContainerUrl(remoteUrl);
    const res = await fetch(containerUrl);
    const text = await res.text();
  
    const moduleMapMatch = text.match(/var moduleMap = \{([\s\S]*?)\};/);
    const exposes = moduleMapMatch
      ? [...moduleMapMatch[1].matchAll(/["'](.+?)["']\s*:/g)].map((m) => m[1])
      : [];
  
    return exposes;
  }
  
  async function extractPluginName(remoteUrl: string): Promise<string> {
    const containerUrl = resolveContainerUrl(remoteUrl);
    const res = await fetch(containerUrl);
    const text = await res.text();
  
    const nameMatch =
      text.match(/var\s+uniqueName\s*=\s*["'](.+?)["']/) ||
      text.match(/__webpack_require__\.I\[\s*["'](.+?)["']\s*\]/);
  
    return nameMatch?.[1] ?? "default";
  }
  
  async function loadRemoteContainer(remoteUrl: string) {
    const containerUrl = resolveContainerUrl(remoteUrl);
    return await loadModule(containerUrl);
  }
  
  function resolveContainerUrl(remoteUrl: string) {
		if (remoteUrl?.startsWith('/')){
			return resolveRemoteUrl(remoteUrl);
		}

    return '/proxy/request?url=' + resolveRemoteUrl(remoteUrl);
  }

	function resolveRemoteUrl(remoteUrl: string) {
		return remoteUrl.endsWith(".mjs") || remoteUrl.endsWith(".js")
      ? remoteUrl
      : `${remoteUrl}${remoteUrl.endsWith("/") ? "" : "/"}remoteEntry.mjs`
	}
  
  function loadModule(url: string) {
    return import(/* webpackIgnore: true */ url);
  }
  