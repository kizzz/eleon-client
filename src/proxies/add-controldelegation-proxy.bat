@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module ControlDelegation --apiName eleonsoft --source=control-delegation --target=control-delegation --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

