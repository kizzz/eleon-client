@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module DynamicDashboard --apiName eleonsoft --source=dynamic-dashboard --target=dynamic-dashboard --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

