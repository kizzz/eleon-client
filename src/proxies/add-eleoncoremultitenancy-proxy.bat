@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module EleoncoreMultiTenancy --apiName eleonsoft --source=tenant-management --target=tenant-management --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

