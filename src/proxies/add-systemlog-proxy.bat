@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module SystemLog --apiName eleonsoft --source=system-log --target=system-log --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

