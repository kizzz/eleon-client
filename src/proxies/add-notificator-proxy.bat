@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module Notificator --apiName eleonsoft --source=notification --target=notification --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

