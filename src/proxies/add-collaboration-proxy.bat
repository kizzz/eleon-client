@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module Collaboration --apiName eleonsoft --source=shared-chat --target=shared-chat --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

