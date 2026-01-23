@echo off
rem Generate Auditor proxy directly into the auditor module app (src/modules/auditor/src/app/proxy)
nx generate @eleoncore/ng.schematics:proxy-add --module Auditor --apiName eleonsoft --source=audit --target=audit --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose