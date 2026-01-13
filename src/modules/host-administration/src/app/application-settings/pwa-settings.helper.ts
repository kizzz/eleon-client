

export const defaultPwaSetting = {
    "name": "<APP_NAME>",
    "short_name": "<APP_NAME>",
    "theme_color": "#1976d2",
    "background_color": "#fafafa",
    "display": "standalone",
    "scope": "<APP_BASE_URL>",
    "start_url": "<APP_BASE_URL>",
    "icons": [
        {
            "src": "/resources/pwa/logo_72x72.png",
            "sizes": "72x72",
            "type": "image/png",
            "purpose": "maskable any"
        },
        {
            "src": "/resources/pwa/logo_96x96.png",
            "sizes": "96x96",
            "type": "image/png",
            "purpose": "maskable any"
        },
        {
            "src": "/resources/pwa/logo_128x128.png",
            "sizes": "128x128",
            "type": "image/png",
            "purpose": "maskable any"
        },
        {
            "src": "/resources/pwa/logo_144x144.png",
            "sizes": "144x144",
            "type": "image/png",
            "purpose": "maskable any"
        },
        {
            "src": "/resources/pwa/logo_152x152.png",
            "sizes": "152x152",
            "type": "image/png",
            "purpose": "maskable any"
        },
        {
            "src": "/resources/pwa/logo_192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable any"
        },
        {
            "src": "/resources/pwa/logo_384x384.png",
            "sizes": "384x384",
            "type": "image/png",
            "purpose": "maskable any"
        },
        {
            "src": "/resources/pwa/logo_512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable any"
        }
    ]
};

export function getDefaultPwaSetting(appName: string, baseUrl: string) {
    const setting =  structuredClone(defaultPwaSetting);
    setting['name'] = appName;
    setting['short_name'] = appName;
    setting['scope'] = baseUrl;
    setting['start_url'] = baseUrl; 
    return JSON.stringify(setting, null, 3);
}

type Icon = {
    src: string;
    sizes: string;
    type: string;
    purpose: string;
};

type PwaSetting = {
    name: string;
    short_name: string;
    theme_color: string;
    background_color: string;
    display: string;
    scope: string;
    start_url: string;
    icons: Icon[];
};

function isHexColor(value: string): boolean {
    return /^#([0-9A-F]{3}){1,2}$/i.test(value);
}

function isValidSize(size: string): boolean {
    return /^\d+x\d+$/.test(size);
}

export function validatePwaSettingJson(jsonStr: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    let setting: any;

    // Step 1: Parse JSON
    try {
        setting = JSON.parse(jsonStr);
    } catch (err) {
        return {
            valid: false,
            errors: ['Invalid JSON format']
        };
    }

    // Step 2: Define validation helpers
    const isHexColor = (value: string): boolean => /^#([0-9A-F]{3}){1,2}$/i.test(value);
    const isValidSize = (value: string): boolean => /^\d+x\d+$/.test(value);

    // Step 3: Validate required string fields
    const requiredStrings = ['name', 'short_name', 'scope', 'start_url'];
    for (const field of requiredStrings) {
        if (typeof setting[field] !== 'string' || setting[field].trim() === '') {
            errors.push(`Missing or invalid '${field}'`);
        }
    }

    // Step 4: Validate colors
    if (!isHexColor(setting.theme_color)) {
        errors.push("Invalid 'theme_color'");
    }
    if (!isHexColor(setting.background_color)) {
        errors.push("Invalid 'background_color'");
    }

    // Step 5: Validate display
    const allowedDisplays = ['fullscreen', 'standalone', 'minimal-ui', 'browser'];
    if (!allowedDisplays.includes(setting.display)) {
        errors.push(`Invalid 'display', expected one of: ${allowedDisplays.join(', ')}`);
    }

    // Step 6: Validate icons array
    if (!Array.isArray(setting.icons) || setting.icons.length === 0) {
        errors.push("Missing or empty 'icons' array");
    } else {
        setting.icons.forEach((icon: any, index: number) => {
            if (typeof icon.src !== 'string') errors.push(`Icon ${index}: invalid 'src'`);
            if (!isValidSize(icon.sizes)) errors.push(`Icon ${index}: invalid 'sizes'`);
            if (typeof icon.type !== 'string') errors.push(`Icon ${index}: invalid 'type'`);
            if (typeof icon.purpose !== 'string') errors.push(`Icon ${index}: invalid 'purpose'`);
        });
    }

    // Final result
    return {
        valid: errors.length === 0,
        errors
    };
}
