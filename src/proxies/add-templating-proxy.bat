@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module Templating --apiName eleonsoft --source=templating --target=templating --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

