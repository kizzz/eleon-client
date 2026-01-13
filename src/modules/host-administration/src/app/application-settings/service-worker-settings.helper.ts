
export const defaultSwConfig = {
    "$schema": "./node_modules/@angular/service-worker/config/schema.json",
    "index": "/index.html",
    "assetGroups": [
      {
        "name": "app",
        "installMode": "prefetch",
        "resources": {
          "files": [
            "/favicon.ico",
            "/index.html",
            "/manifest.webmanifest",
            "/*.css",
            "/*.js"
          ]
        }
      },
      {
        "name": "assets",
        "installMode": "lazy",
        "updateMode": "prefetch",
        "resources": {
          "files": [
            "./assets/**",
            "/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)"
          ]
        }
      }
    ]
  };
  
  export function getDefaultSwConfig(): string {
    return JSON.stringify(defaultSwConfig, null, 2);
  }
  
  export function validateSwConfigJson(jsonStr: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    let config: any;
  
    try {
      config = JSON.parse(jsonStr);
    } catch (err) {
      return {
        valid: false,
        errors: ['Invalid JSON format']
      };
    }
  
    if (!Array.isArray(config.assetGroups)) {
      errors.push("Missing or invalid 'assetGroups' array");
    }
  
    return {
      valid: errors.length === 0,
      errors
    };
  }
  