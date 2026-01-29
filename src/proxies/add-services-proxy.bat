@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module Services --apiName eleonsoft --source=services --target=services --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

