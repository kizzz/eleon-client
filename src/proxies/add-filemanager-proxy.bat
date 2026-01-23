@echo off
nx generate @eleoncore/ng.schematics:proxy-add --module FileManager --apiName eleonsoft --source=digital-archive --target=digital-archive --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose
