@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module IdentityQuerying --apiName eleonauth --source=eleon.identity-querying.lib --target=eleon.identity-querying.lib --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

