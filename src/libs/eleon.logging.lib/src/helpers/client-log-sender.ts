import { CreateSystemLogDto, SystemLogLevel, SystemLogService } from '@eleon/system-services.lib';
import { ErrorHandlingLevel, IAuthManager } from '@eleon/contracts.lib';
import { IApplicationConfigurationManager } from '@eleon/contracts.lib';
import { ClientLogService } from './client-log.service'
import { finalize } from 'rxjs'


export class ClientLogSenderService {
  sendLogEntry(logEntry: string): void {
    // Implement actual log sending logic here, e.g., send to server or external logging service
    // For demonstration, we'll just print it to the console
    console.log('Sending log entry:', logEntry);
  }
}


export function sendSystemLogs(appConfig: IApplicationConfigurationManager, authService: IAuthManager, clientLogService: ClientLogService, sysLogService: SystemLogService){
  let sendingInProgress = false;
  let logQueue: CreateSystemLogDto[] = [];
  const MAX_QUEUE_SIZE = 5;
  
  const sendBatch = () => {
    if (logQueue.length > 0 && !sendingInProgress) {
      sendingInProgress = true;
      if (authService.isAuthenticated()){
        sysLogService.writeMany([...logQueue])
        .pipe(finalize(() => sendingInProgress = false))
        .subscribe(() => {
          // Log sent successfully
        });
        logQueue = [];
      }
    }
  };

  // Set up interval to send logs every 10 seconds
  setInterval(() => {
    sendBatch();
  }, 10000); // 10 seconds

  const addLogToQueue = (sysLog: CreateSystemLogDto) => {
    logQueue.push(sysLog);
    
    // If queue exceeds max size, remove the oldest element
    if (logQueue.length > MAX_QUEUE_SIZE) {
      logQueue.shift(); // Remove the oldest (first) element
    }
  };
  
  const convertObjectValuesToStrings = (obj: Record<string, unknown> | null | undefined): Record<string, string> => {
    if (!obj || typeof obj !== 'object') {
      return {};
    }
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return result;
  };

  const convertLevel = (level: ErrorHandlingLevel) => {
    switch (level) {
      case ErrorHandlingLevel.Debug:
        return SystemLogLevel.Info;
      case ErrorHandlingLevel.Error:
        return SystemLogLevel.Info;
      case ErrorHandlingLevel.Critical:
        return SystemLogLevel.Warning;
      default:
        return SystemLogLevel.Info
    }
  };

  clientLogService.subscribe((log) => {
    const config = appConfig.getAppConfig();
    const logsEnabled = (config?.extraProperties?.['Logging'] as Record<string, unknown>)?.sendLogsFromUI;
    const minLevel = Number((config?.extraProperties?.['Logging'] as Record<string, unknown>)?.minimumLogLevel) || 2;
    if (logsEnabled && log.level >= minLevel && (log.count || 0) <= 1) {
      addLogToQueue({
        message: log.message,
        logLevel: convertLevel(log.level),
        applicationName: "ClientApp-" + (config?.applicationName || 'Undefined'),
        extraProperties: convertObjectValuesToStrings(log.context)
      });
    }
  });
}
