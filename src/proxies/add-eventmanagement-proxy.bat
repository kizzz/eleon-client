@echo off
rem Generate EventManagement proxy directly into the system-queue module app (src/modules/system-queue/src/app/proxy)
nx generate @eleoncore/ng.schematics:proxy-add --module EventManagement --apiName eleonsoft --source=system-queue --target=system-queue --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

