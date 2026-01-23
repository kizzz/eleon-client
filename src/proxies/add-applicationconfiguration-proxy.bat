nx generate @eleoncore/ng.schematics:proxy-add --module ApplicationConfiguration --apiName eleonauth --source=eleon.app-config.lib --target=eleon.app-config.lib --entry-point "./" --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose && nx run application-configuration-proxy:generate-barrels

