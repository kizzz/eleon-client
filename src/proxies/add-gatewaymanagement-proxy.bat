@echo off
rem Generate GatewayManagement proxy directly into the gateway module app (src/modules/gateway/src/app/proxy)
nx generate @eleoncore/ng.schematics:proxy-add --module GatewayManagement --apiName eleoncore --source=gateway --target=gateway --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

