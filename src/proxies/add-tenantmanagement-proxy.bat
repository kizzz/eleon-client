nx generate @eleoncore/ng.schematics:proxy-add --module TenantManagement --apiName eleonsoft --source=tenant-management-proxy --target=tenant-management-proxy --entry-point "./" --service-type application --url=https://localhost:5005 --base-url='' --no-interactive --verbose && nx run tenant-management-proxy:generate-barrels

