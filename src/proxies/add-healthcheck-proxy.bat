@echo off
rem Generate HealthCheck proxy directly into the health-check app (src/modules/health-check/src/app/proxy)
nx generate @eleoncore/ng.schematics:proxy-add --module HealthCheck --apiName eleonsoft --source=health-check --target=health-check --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

