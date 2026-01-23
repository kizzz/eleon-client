@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module LanguageManagement --apiName eleonsoft --source=language-management --target=language-management --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

