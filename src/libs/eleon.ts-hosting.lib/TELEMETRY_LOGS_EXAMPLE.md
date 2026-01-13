# OpenTelemetry Logs Example

This document demonstrates how to use the OpenTelemetry log exporter in the TypeScript SDK.

## Configuration

Initialize telemetry with log exporter enabled:

```typescript
import { initializeTelemetry, getLogger } from '@eleon/ts-hosting.lib';
import { SeverityNumber } from '@opentelemetry/api-logs';

// Initialize telemetry with all three signals: traces, metrics, and logs
initializeTelemetry({
  serviceName: 'my-angular-app',
  serviceVersion: '1.0.0',
  environment: 'production',
  
  // Trace exporter configuration
  traceExporter: {
    enabled: true,
    url: 'http://localhost:4318/v1/traces',
    useBatch: true,
  },
  
  // Metric exporter configuration
  metricExporter: {
    enabled: true,
    url: 'http://localhost:4318/v1/metrics',
    exportIntervalMillis: 60000,
  },
  
  // Log exporter configuration (NEW!)
  logExporter: {
    enabled: true,
    url: 'http://localhost:4318/v1/logs',
    useBatch: true, // Use batch processor for better performance
    useConsoleFallback: false, // Set to true to log to console if no URL provided
    captureConsole: true, // NEW! Intercept console.log/info/warn/error/debug calls
    batchOptions: {
      maxQueueSize: 2048,
      scheduledDelayMillis: 5000,
      exportTimeoutMillis: 30000,
      maxExportBatchSize: 512,
    },
  },
});
```

## Console Interception (NEW!)

The most powerful feature is automatic console interception. Once enabled, all your existing `console.log()`, `console.info()`, `console.warn()`, `console.error()`, and `console.debug()` calls are automatically captured and sent to OpenTelemetry!

### Enable All Console Methods

```typescript
logExporter: {
  enabled: true,
  url: 'http://localhost:4318/v1/logs',
  captureConsole: true, // Captures all console methods
}
```

### Selective Console Interception

You can choose which console methods to intercept:

```typescript
logExporter: {
  enabled: true,
  url: 'http://localhost:4318/v1/logs',
  captureConsole: {
    log: true,   // Capture console.log()
    info: true,  // Capture console.info()
    warn: true,  // Capture console.warn()
    error: true, // Capture console.error()
    debug: false, // Don't capture console.debug()
  },
}
```

### How It Works

Once configured, your existing console calls are automatically intercepted:

```typescript
// These all get sent to OpenTelemetry automatically!
console.log('User logged in successfully', { userId: '12345' });
console.info('Cache warmed up');
console.warn('API response slow', { duration: 5000 });
console.error('Failed to fetch data', new Error('Network timeout'));
console.debug('Component rendered', { props: {...} });
```

The interceptor:
- ✅ Still outputs to the browser console (original behavior preserved)
- ✅ Automatically extracts error information (message, stack, type)
- ✅ Converts objects to JSON strings
- ✅ Maps console methods to appropriate severity levels
- ✅ Adds metadata attributes

### Restoring Original Console

If needed, you can restore the original console methods:

```typescript
import { restoreConsole } from '@eleon/ts-hosting.lib';

// Restore original console behavior
restoreConsole();
```

## Using the Logger

After initialization, you can get a logger instance and emit log records:

```typescript
import { getLogger } from '@eleon/ts-hosting.lib';
import { SeverityNumber } from '@opentelemetry/api-logs';

// Get a logger for your component/module
const logger = getLogger('my-component', '1.0.0');

// Emit log records
logger?.emit({
  severityNumber: SeverityNumber.INFO,
  severityText: 'INFO',
  body: 'User logged in successfully',
  attributes: {
    userId: '12345',
    username: 'john.doe',
    timestamp: Date.now(),
  },
});

// Error logging
logger?.emit({
  severityNumber: SeverityNumber.ERROR,
  severityText: 'ERROR',
  body: 'Failed to fetch data',
  attributes: {
    error: error.message,
    stack: error.stack,
    endpoint: '/api/users',
  },
});

// Debug logging
logger?.emit({
  severityNumber: SeverityNumber.DEBUG,
  severityText: 'DEBUG',
  body: 'Cache hit for user data',
  attributes: {
    cacheKey: 'user:12345',
    hitRate: 0.95,
  },
});
```

## Severity Levels

Available severity levels from `@opentelemetry/api-logs`:

- `SeverityNumber.TRACE` - Detailed trace information
- `SeverityNumber.DEBUG` - Debug information
- `SeverityNumber.INFO` - Informational messages
- `SeverityNumber.WARN` - Warning messages
- `SeverityNumber.ERROR` - Error messages
- `SeverityNumber.FATAL` - Fatal error messages

## Console Fallback

If you want to use console logging when no OTLP endpoint is configured:

```typescript
logExporter: {
  enabled: true,
  url: undefined, // No OTLP endpoint
  useConsoleFallback: true, // Will use ConsoleLogRecordExporter
},
```

## Batch vs Simple Processor

- **Batch Processor** (recommended for production): Buffers log records and exports them in batches
  - Better performance
  - Configurable batch size and interval
  - Set `useBatch: true`

- **Simple Processor**: Exports each log record immediately
  - Useful for development/debugging
  - No buffering
  - Set `useBatch: false`

## Integration with Traces and Metrics

All three telemetry signals share the same resource configuration and are initialized together:

```typescript
const telemetry = initializeTelemetry({
  serviceName: 'my-app',
  resourceAttributes: {
    'service.namespace': 'production',
    'deployment.environment': 'k8s',
  },
  traceExporter: { enabled: true, url: 'http://otel-collector:4318/v1/traces' },
  metricExporter: { enabled: true, url: 'http://otel-collector:4318/v1/metrics' },
  logExporter: { enabled: true, url: 'http://otel-collector:4318/v1/logs' },
});

// Force flush all signals
await telemetry.forceFlush();

// Shutdown all signals
await telemetry.shutdown();
```

## Best Practices

1. **Initialize once** at application startup
2. **Use structured attributes** instead of string interpolation in the body
3. **Choose appropriate severity levels** for your log messages
4. **Use batch processor** in production for better performance
5. **Include context** like user ID, request ID, etc. in attributes
6. **Flush before shutdown** to ensure all logs are exported

## Example in Angular Component

```typescript
import { Component, OnInit } from '@angular/core';
import { getLogger } from '@eleon/ts-hosting.lib';
import { SeverityNumber } from '@opentelemetry/api-logs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
  private logger = getLogger('UserProfileComponent', '1.0.0');

  ngOnInit(): void {
    this.logger?.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: 'INFO',
      body: 'Component initialized',
      attributes: {
        component: 'UserProfileComponent',
      },
    });
  }

  loadUserData(userId: string): void {
    try {
      // Load user data...
      this.logger?.emit({
        severityNumber: SeverityNumber.DEBUG,
        severityText: 'DEBUG',
        body: 'Loading user data',
        attributes: { userId },
      });
    } catch (error) {
      this.logger?.emit({
        severityNumber: SeverityNumber.ERROR,
        severityText: 'ERROR',
        body: 'Failed to load user data',
        attributes: {
          userId,
          error: (error as Error).message,
        },
      });
    }
  }
}
```
