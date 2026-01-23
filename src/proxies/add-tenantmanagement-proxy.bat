@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module TenantManagement --apiName eleonsoft --source=administration --target=administration --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

