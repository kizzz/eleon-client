@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module BackgroundJobs --apiName eleonsoft --source=background-job --target=background-job --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

