@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module SitesManagement --apiName eleoncore --source=host-administration --target=host-administration --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

