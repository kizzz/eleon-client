import { IApplicationConfigurationManager, IAuthManager } from '@eleon/contracts.lib'
import { getLogger, initializeTelemetry, startBrowserMetricsCollection } from '../helpers'
import { DiagLogLevel } from '@opentelemetry/api'
import { SeverityNumber } from '@opentelemetry/api-logs';
import { ITelemetryService } from '@eleon/contracts.lib'

export const TELEMETRY_PATH = '/auth/telemetry';
export const TELEMETRY_SESSION_ID = crypto.randomUUID();

export class TelemetryService implements ITelemetryService {
  private initialized = false;
  protected telemetryHelper: ConfigureTelemetryHelperService;

  constructor(
    private config: IApplicationConfigurationManager,
    private authService: IAuthManager)
  {
    this.telemetryHelper = new ConfigureTelemetryHelperService(
      config,
      () => {
      const user = this.authService.getUser();
      const token = this.authService.getAccessToken();
      return {
        userId: user?.userId || '',
        userName: user?.userName || '',
        accessToken: token || ''
      };
    });
  }

  public initialize(): void {
    if (this.initialized) {
      return;
    }

    this.authService.authorized$.subscribe(auth => {
      if (auth) {
        this.telemetryHelper.configureTelemetry();
      }
    });
    
    this.authService.onTokenRefreshed$.subscribe(_ => {
      this.telemetryHelper.configureTelemetry();
    });

    this.config.configUpdate$.subscribe(_ => {
      this.telemetryHelper.configureTelemetry();
    });

    this.initialized = true;
  }
}

export class ConfigureTelemetryHelperService {
  constructor(
    private appConfig: IApplicationConfigurationManager,
    private userAccessor: () => { userId: string, userName: string, accessToken: string }) {
  }

  public configureTelemetry(){
    const config = this.appConfig.getAppConfig();

    const appName = 'ClientApp-' + (config?.applicationName || 'Undefined');

    const user = this.userAccessor();

    const enableTelemetry = (config?.extraProperties?.['Telemetry'] as any)?.enabledOnClient;
    if (!enableTelemetry) {
      console.log(`Telemetry is disabled for ${appName}`);
      return;
    }

    console.log(`Starting telemetry for ${appName}...`);
    initializeTelemetry({
      serviceName: appName,
      environment: 'production',
      traceExporter: {
        url: `${TELEMETRY_PATH}/v1/traces`,
        useBatch: true,
        headers: this.getHeaders(),
      },
      metricExporter: {
        enabled: true,
        url: `${TELEMETRY_PATH}/v1/metrics`,
        headers: this.getHeaders(),
        exportIntervalMillis: 60_000, 
        exportTimeoutMillis: 60_000
      },
      logExporter: {
        enabled: true,
        url: `${TELEMETRY_PATH}/v1/logs`,
        headers: this.getHeaders(),
        useBatch: true, // Use batch processor for better performance
        useConsoleFallback: false, // Set to true to log to console if no URL provided
        batchOptions: {
          maxQueueSize: 2048,
          scheduledDelayMillis: 60000,
          exportTimeoutMillis: 60000,
          maxExportBatchSize: 512,
        },
        captureConsole: {
          log: true,
          info: true,
          warn: false,
          error: true,
          debug: false,
        },
      },
      resourceAttributes: {
        'client.user.id': user?.userId || '',
        'client.user.name': user?.userName || '',
        'client.session.id': TELEMETRY_SESSION_ID,
      },
      instrumentations: {
        fetch: {
          propagateTraceHeaderCorsUrls: [/^https:\/\/api\.example\.com/],
        },
        xmlHttpRequest: true,
        documentLoad: true,
      },
      diagnosticsLogLevel: DiagLogLevel.ALL,
    });
    console.log(`Telemetry initialized for ${appName}`);

    // Start collecting browser performance metrics
    startBrowserMetricsCollection();

    const logger = getLogger('TelemetryService');
    logger.emit({
      severityNumber: SeverityNumber.INFO,
      body: `Telemetry initialized for ${appName}`,
    });
  }

  public validateApiBasePath(apiBase: string): string {
    if (!apiBase) return '';
    if (apiBase.endsWith('/')) {
      return apiBase.slice(0, -1);
    }
    return apiBase;
  }

  public getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    const token = this.userAccessor()?.accessToken; // this.authService.getAccessToken();
    if (token){
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers;
  }
}
