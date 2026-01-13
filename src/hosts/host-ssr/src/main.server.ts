/// <reference types="node" />
import { bootstrapEleoncore } from '@eleon/angular-hosting.lib';
import { config } from './app/app.config.server';

const hardcodedSettings = {
  "localization": {
    "values": {

    },
    "resources": {

    },
    "languages": [
      {
        "cultureName": "en",
        "uiCultureName": "en",
        "displayName": "English",
        "twoLetterISOLanguageName": "en",
        "flagIcon": null
      },
      {
        "cultureName": "sk",
        "uiCultureName": "sk",
        "displayName": "Slovak",
        "twoLetterISOLanguageName": "sk",
        "flagIcon": null
      },
      {
        "cultureName": "ar",
        "uiCultureName": "ar",
        "displayName": "العربية",
        "twoLetterISOLanguageName": "ar",
        "flagIcon": null
      },
      {
        "cultureName": "cs",
        "uiCultureName": "cs",
        "displayName": "Čeština",
        "twoLetterISOLanguageName": "cs",
        "flagIcon": null
      },
      {
        "cultureName": "he",
        "uiCultureName": "he",
        "displayName": "עִבְרִית",
        "twoLetterISOLanguageName": "he",
        "flagIcon": null
      },
      {
        "cultureName": "sl",
        "uiCultureName": "sl",
        "displayName": "Slovenščina",
        "twoLetterISOLanguageName": "sl",
        "flagIcon": null
      },
      {
        "cultureName": "hi",
        "uiCultureName": "hi",
        "displayName": "Hindi",
        "twoLetterISOLanguageName": "hi",
        "flagIcon": null
      },
      {
        "cultureName": "pt-BR",
        "uiCultureName": "pt-BR",
        "displayName": "Português",
        "twoLetterISOLanguageName": "pt",
        "flagIcon": null
      },
      {
        "cultureName": "zh-Hant",
        "uiCultureName": "zh-Hant",
        "displayName": "繁體中文",
        "twoLetterISOLanguageName": "zh",
        "flagIcon": null
      },
      {
        "cultureName": "zh-Hans",
        "uiCultureName": "zh-Hans",
        "displayName": "简体中文",
        "twoLetterISOLanguageName": "zh",
        "flagIcon": null
      },
      {
        "cultureName": "fr",
        "uiCultureName": "fr",
        "displayName": "Français",
        "twoLetterISOLanguageName": "fr",
        "flagIcon": null
      },
      {
        "cultureName": "ru",
        "uiCultureName": "ru",
        "displayName": "Русский",
        "twoLetterISOLanguageName": "ru",
        "flagIcon": null
      },
      {
        "cultureName": "fi",
        "uiCultureName": "fi",
        "displayName": "Finnish",
        "twoLetterISOLanguageName": "fi",
        "flagIcon": null
      },
      {
        "cultureName": "tr",
        "uiCultureName": "tr",
        "displayName": "Türkçe",
        "twoLetterISOLanguageName": "tr",
        "flagIcon": null
      },
      {
        "cultureName": "it",
        "uiCultureName": "it",
        "displayName": "Italiano",
        "twoLetterISOLanguageName": "it",
        "flagIcon": null
      }
    ],
    "currentCulture": {
      "displayName": "English",
      "englishName": "English",
      "threeLetterIsoLanguageName": "eng",
      "twoLetterIsoLanguageName": "en",
      "isRightToLeft": false,
      "cultureName": "en",
      "name": "en",
      "nativeName": "English",
      "dateTimeFormat": {
        "calendarAlgorithmType": "SolarCalendar",
        "dateTimeFormatLong": "dddd, MMMM d, yyyy",
        "shortDatePattern": "M/d/yyyy",
        "fullDateTimePattern": "dddd, MMMM d, yyyy h:mm:ss tt",
        "dateSeparator": "/",
        "shortTimePattern": "h:mm tt",
        "longTimePattern": "h:mm:ss tt"
      }
    },
    "defaultResourceName": "VPortal",
    "languagesMap": {
      "bootstrap-datepicker": [
        {
          "name": "zh-Hans",
          "value": "zh-CN"
        },
        {
          "name": "zh-Hant",
          "value": "zh-TW"
        }
      ],
      "moment": [
        {
          "name": "zh-Hans",
          "value": "zh-cn"
        },
        {
          "name": "zh-Hant",
          "value": "zh-tw"
        },
        {
          "name": "de-DE",
          "value": "de"
        }
      ]
    },
    "languageFilesMap": {
      "bootstrap-datepicker": [
        {
          "name": "zh-Hans",
          "value": "zh-CN"
        },
        {
          "name": "zh-Hant",
          "value": "zh-TW"
        }
      ],
      "moment": [
        {
          "name": "zh-Hans",
          "value": "zh-cn"
        },
        {
          "name": "zh-Hant",
          "value": "zh-tw"
        },
        {
          "name": "de-DE",
          "value": "de"
        }
      ],
      "jquery.timeago": [
        {
          "name": "zh-Hans",
          "value": "zh-CN"
        },
        {
          "name": "zh-Hant",
          "value": "zh-TW"
        }
      ],
      "jquery-validation": [
        {
          "name": "zh-Hans",
          "value": "zh"
        },
        {
          "name": "zh-Hant",
          "value": "zh_TW"
        }
      ]
    }
  },
  "auth": {
    "grantedPolicies": {
      "NotDriver": true
    }
  },
  "currentUser": {
    "isAuthenticated": false,
    "id": null,
    "tenantId": null,
    "impersonatorUserId": null,
    "impersonatorTenantId": null,
    "impersonatorUserName": null,
    "impersonatorTenantName": null,
    "userName": null,
    "name": null,
    "surName": null,
    "email": null,
    "emailVerified": false,
    "phoneNumber": null,
    "phoneNumberVerified": false,
    "roles": []
  },
  "features": {
    "values": {
      "SettingManagement.Enable": "true",
      "SettingManagement.AllowChangingEmailSettings": "false",
      "Google.Maps.Key": "",
      "Google.Drive.Key": "",
      "Google.Optimization.Key": ""
    }
  },
  "currentTenant": {
    "id": null,
    "name": null,
    "isAvailable": false
  },
  "extraProperties": {
    "IsRoot": true,
    "IsDefault": true
  },
  "production": false,
  "applicationName": "ssrtestadmin",
  "applicationPath": "/apps/ssrtestadmin",
  "corePath": "",
  "authPath": "/auth",
  "frameworkType": "CustomAngular",
  "styleType": "None",
  "clientApplicationType": "Portal",
  "clientApplication": {
    "id": "c34a5689-49c5-112f-ad62-3a19ffab0734",
    "name": "ssrtestadmin",
    "path": "/apps/ssrtestadmin",
    "source": "http://localhost:4200",
    "isEnabled": true,
    "isDefault": false,
    "headString": null,
    "icon": "fa-regular fa-newspaper",
    "frameworkType": 3,
    "styleType": 0,
    "clientApplicationType": 1,
    "errorHandlingLevel": 0,
    "useDedicatedDatabase": false,
    "isSystem": false,
    "isAuthenticationRequired": false,
    "properties": []
  },
  "modules": [
    {
      "id": "da26cfaa-6b14-d2ab-9a8d-3a19ffab323a",
      "url": "/modules/layout",
      "name": "primeng-layout_Module",
      "pluginName": "primeng-layout",
      "parentId": null,
      "loadLevel": "RootModule",
      "orderIndex": 0,
      "expose": "./Module",
      "properties": [],
      "clientApplicationEntityId": "c34a5689-49c5-112f-ad62-3a19ffab0734"
    },
    {
      "id": "da26cfaa-6b14-d2ab-9a8d-3a19ffab323a",
      "url": "/modules/layout",
      "name": "primeng-layout_Module",
      "pluginName": "primeng-layout",
      "parentId": null,
      "loadLevel": "RootModule",
      "orderIndex": 0,
      "expose": "./Module",
      "properties": [],
      "clientApplicationEntityId": "c34a5689-49c5-112f-ad62-3a19ffab0734"
    },
    {
      "id": "f34e2409-be49-5b3f-262e-3a19ffab6587",
      "url": "/modules/administration",
      "name": "administration_Administration",
      "pluginName": "administration",
      "parentId": "da26cfaa-6b14-d2ab-9a8d-3a19ffab323a",
      "loadLevel": "SubModule",
      "orderIndex": 0,
      "expose": "./Administration",
      "properties": [],
      "clientApplicationEntityId": "c34a5689-49c5-112f-ad62-3a19ffab0734"
    }
  ],
  "oAuthConfig": {
    "clientId": "VPortal_App",
    "responseType": "code",
    "scope": "openid profile offline_access VPortal",
    "useSilentRefresh": false
  },
  "webPush": {
    "publicKey": null
  }
};

export default bootstrapEleoncore({
    providers: config.providers,
    applicationConfiguration: hardcodedSettings as any,
    basePath: '/apps/ssrtestadmin/'
})
