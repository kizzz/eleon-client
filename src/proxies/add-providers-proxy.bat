@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module Providers --apiName eleonsoft --source=providers --target=providers --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

