@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module SystemServices --apiName eleonauth --source=eleon.system-services.lib --target=eleon.system-services.lib --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

