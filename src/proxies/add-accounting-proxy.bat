@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module Accounting --apiName eleonsoft --source=accounting --target=accounting --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

