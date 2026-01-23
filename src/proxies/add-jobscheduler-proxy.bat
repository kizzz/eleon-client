@echo off
rem Generate JobScheduler proxy directly into the job-scheduler module app (src/modules/job-scheduler/src/app/proxy)
nx generate @eleoncore/ng.schematics:proxy-add --module JobScheduler --apiName eleonsoft --source=job-scheduler --target=job-scheduler --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose

