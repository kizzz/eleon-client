/**
 * OpenTelemetry helper for initializing traces, metrics, and logs.
 * 
 * @example
 * // Initialize with all exporters
 * initializeTelemetry({
 *   serviceName: 'my-app',
 *   serviceVersion: '1.0.0',
 *   traceExporter: {
 *     enabled: true,
 *     url: 'http://localhost:4318/v1/traces',
 *   },
 *   metricExporter: {
 *     enabled: true,
 *     url: 'http://localhost:4318/v1/metrics',
 *   },
 *   logExporter: {
 *     enabled: true,
 *     url: 'http://localhost:4318/v1/logs',
 *     useBatch: true,
 *     captureConsole: true, // Intercept console.log/info/warn/error/debug
 *   },
 * });
 * 
 * // Now all console.log calls are automatically sent to the log exporter
 * console.log('User logged in', { userId: '123' });
 * console.error('API call failed', new Error('Network error'));
 * 
 * // Or use the logger directly for more control
 * const logger = getLogger('my-component');
 * logger?.emit({
 *   severityNumber: SeverityNumber.INFO,
 *   severityText: 'INFO',
 *   body: 'Application started',
 *   attributes: { userId: '123' }
 * });
 */

import {
	diag,
	DiagConsoleLogger,
	DiagLogLevel,
	metrics,
	trace,
} from '@opentelemetry/api';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import type { Instrumentation } from '@opentelemetry/instrumentation';
import {
	DocumentLoadInstrumentation,
	type DocumentLoadInstrumentationConfig,
} from '@opentelemetry/instrumentation-document-load';
import {
	FetchInstrumentation,
	type FetchInstrumentationConfig,
} from '@opentelemetry/instrumentation-fetch';
import {
	XMLHttpRequestInstrumentation,
	type XMLHttpRequestInstrumentationConfig,
} from '@opentelemetry/instrumentation-xml-http-request';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
	BatchSpanProcessor,
	type SpanProcessor,
	ConsoleSpanExporter,
	SimpleSpanProcessor,
	type SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
	MeterProvider,
	PeriodicExportingMetricReader,
	type PushMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import {
	LoggerProvider,
	BatchLogRecordProcessor,
	SimpleLogRecordProcessor,
	type LogRecordProcessor,
	ConsoleLogRecordExporter,
} from '@opentelemetry/sdk-logs';
import type { LogRecordExporter } from '@opentelemetry/sdk-logs';


type BatchOptions = ConstructorParameters<typeof BatchSpanProcessor>[1];
type OtelResource = ReturnType<typeof resourceFromAttributes>;

type AttributeValue = string | number | boolean;

export interface TraceExporterOptions {
	enabled?: boolean;
	url?: string;
	headers?: Record<string, string>;
	concurrencyLimit?: number;
	useBatch?: boolean;
	batchOptions?: Partial<BatchOptions>;
	useConsoleFallback?: boolean;
	exporterFactory?: () => SpanExporter;
}

export interface MetricExporterOptions {
	enabled?: boolean;
	url?: string;
	headers?: Record<string, string>;
	exportIntervalMillis?: number;
	exportTimeoutMillis?: number;
	exporterFactory?: () => PushMetricExporter;
}

export interface LogExporterOptions {
	enabled?: boolean;
	url?: string;
	headers?: Record<string, string>;
	useBatch?: boolean;
	batchOptions?: Partial<BatchOptions>;
	useConsoleFallback?: boolean;
	exporterFactory?: () => LogRecordExporter;
	captureConsole?: boolean | {
		log?: boolean;
		info?: boolean;
		warn?: boolean;
		error?: boolean;
		debug?: boolean;
	};
}

export interface TelemetryInstrumentationsOptions {
	documentLoad?: boolean | DocumentLoadInstrumentationConfig;
	fetch?: boolean | FetchInstrumentationConfig;
	xmlHttpRequest?: boolean | XMLHttpRequestInstrumentationConfig;
}

export interface TelemetryOptions {
	enabled?: boolean;
	serviceName?: string;
	serviceVersion?: string;
	serviceInstanceId?: string;
	environment?: string;
	resourceAttributes?: Record<string, AttributeValue>;
	traceExporter?: TraceExporterOptions;
	metricExporter?: MetricExporterOptions;
	logExporter?: LogExporterOptions;
	instrumentations?: TelemetryInstrumentationsOptions;
	diagnosticsLogLevel?: DiagLogLevel;
}

export interface TelemetryInitResult {
	tracerProvider: WebTracerProvider;
	meterProvider?: MeterProvider;
	loggerProvider?: LoggerProvider;
	forceFlush: () => Promise<void>;
	shutdown: () => Promise<void>;
}

interface TelemetryState {
	options: TelemetryOptions;
	result: TelemetryInitResult;
}

const DEFAULT_BATCH_OPTIONS: BatchOptions = {
	maxQueueSize: 2048,
	scheduledDelayMillis: 5000,
	exportTimeoutMillis: 30000,
	maxExportBatchSize: 512,
};

const DEFAULT_TRACE_EXPORTER: TraceExporterOptions = {
	enabled: true,
	url: undefined,
	headers: {},
	concurrencyLimit: undefined,
	useBatch: true,
	batchOptions: { ...DEFAULT_BATCH_OPTIONS },
	useConsoleFallback: true,
	exporterFactory: undefined,
};

const DEFAULT_METRIC_EXPORTER: MetricExporterOptions = {
	enabled: false,
	url: undefined,
	headers: {},
	exportIntervalMillis: 60000,
	exportTimeoutMillis: 30000,
	exporterFactory: undefined,
};

const DEFAULT_LOG_EXPORTER: LogExporterOptions = {
	enabled: false,
	url: undefined,
	headers: {},
	useBatch: true,
	batchOptions: { ...DEFAULT_BATCH_OPTIONS },
	useConsoleFallback: false,
	exporterFactory: undefined,
	captureConsole: {
		log: false,
		info: false,
		warn: false,
		error: false,
		debug: false,
	},
};

let telemetryState: TelemetryState | undefined;

let initializing = false;

export function initializeTelemetry(
	options?: TelemetryOptions,
): TelemetryInitResult | undefined {
  if (initializing) {
    return telemetryState?.result;
  }

  initializing = true;

	try{
    if (telemetryState) {
      telemetryState.result.forceFlush();
      // telemetryState.result.shutdown();
      telemetryState = undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    const resolved = resolveTelemetryOptions(options);

    if (!resolved.enabled) {
      return undefined;
    }

    if (resolved.diagnosticsLogLevel !== undefined) {
      diag.setLogger(new DiagConsoleLogger(), resolved.diagnosticsLogLevel);
    }

    const resource = createResource(resolved);

    const spanProcessors: SpanProcessor[] = [];

    const spanExporter = createSpanExporter(resolved.traceExporter);

    if (spanExporter) {
      const spanProcessor: SpanProcessor = resolved.traceExporter.useBatch
        ? new BatchSpanProcessor(spanExporter, resolved.traceExporter.batchOptions)
        : new SimpleSpanProcessor(spanExporter);

      spanProcessors.push(spanProcessor);
    }

    const tracerProvider = new WebTracerProvider({ resource, spanProcessors });
    

    tracerProvider.register({
      contextManager: new ZoneContextManager(),
      propagator: new W3CTraceContextPropagator(),
    });

    const instrumentations = createInstrumentations(resolved.instrumentations);

    if (instrumentations.length > 0) {
      registerInstrumentations({ instrumentations });
    }

    let meterProvider: MeterProvider | undefined;
    const metricExporter = createMetricExporter(resolved.metricExporter);

    if (metricExporter) {
      const reader = new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: resolved.metricExporter.exportIntervalMillis,
        exportTimeoutMillis: resolved.metricExporter.exportTimeoutMillis,
      });

      meterProvider = new MeterProvider({ resource, readers: [reader] });
      
      metrics.setGlobalMeterProvider(meterProvider);
    }

    let loggerProvider: LoggerProvider | undefined;
    const logExporter = createLogExporter(resolved.logExporter);

    if (logExporter) {
      const logProcessor: LogRecordProcessor = resolved.logExporter.useBatch
        ? new BatchLogRecordProcessor(logExporter, resolved.logExporter.batchOptions)
        : new SimpleLogRecordProcessor(logExporter);

      loggerProvider = new LoggerProvider({ 
        resource,
        processors: [logProcessor]
      });

      // Intercept console methods if configured
      if (Object.values(resolved.logExporter.captureConsole).some(v => v)) {
        const config = { log: false, info: false, warn: false, error: false, debug: false };

        if (typeof resolved.logExporter.captureConsole === 'boolean') {
          config.log = resolved.logExporter.captureConsole;
          config.info = resolved.logExporter.captureConsole;
          config.warn = resolved.logExporter.captureConsole;
          config.error = resolved.logExporter.captureConsole;
          config.debug = resolved.logExporter.captureConsole;
        }
        else{
          config.log = resolved.logExporter.captureConsole.log ?? false;
          config.info = resolved.logExporter.captureConsole.info ?? false;
          config.warn = resolved.logExporter.captureConsole.warn ?? false;
          config.error = resolved.logExporter.captureConsole.error ?? false;
          config.debug = resolved.logExporter.captureConsole.debug ?? false;
        }

        setupConsoleInterception(loggerProvider, config);
      }
    }

    const forceFlush = async () => {
      await Promise.all([
        tracerProvider.forceFlush(),
        meterProvider?.forceFlush() ?? Promise.resolve(),
        loggerProvider?.forceFlush() ?? Promise.resolve(),
      ]);
    };

    const shutdown = async () => {
      await Promise.all([
        tracerProvider.shutdown(),
        meterProvider?.shutdown() ?? Promise.resolve(),
        loggerProvider?.shutdown() ?? Promise.resolve(),
      ]);
      telemetryState = undefined;
    };

    const result: TelemetryInitResult = {
      tracerProvider,
      meterProvider,
      loggerProvider,
      forceFlush,
      shutdown,
    };

    telemetryState = { options: resolved, result };

    return result;
  }
  finally{
    initializing = false;
  }
}

export function isTelemetryInitialized(): boolean {
	return telemetryState !== undefined;
}

export function getTelemetryOptions(): TelemetryOptions | undefined {
	return telemetryState?.options;
}

export function getTracer(name: string, version?: string) {
	return trace.getTracer(name, version);
}

export function getLogger(name: string, version?: string) {
	return telemetryState?.result.loggerProvider?.getLogger(name, version);
}

function resolveTelemetryOptions(
	options?: TelemetryOptions,
): TelemetryOptions {
	const traceExporter = resolveTraceExporterOptions(options?.traceExporter);
	const metricExporter = resolveMetricExporterOptions(options?.metricExporter);
	const logExporter = resolveLogExporterOptions(options?.logExporter);
	const instrumentations = resolveInstrumentations(options?.instrumentations);

	return {
		enabled: options?.enabled ?? true,
		serviceName: options?.serviceName ?? 'eleonsoft-client',
		serviceVersion: options?.serviceVersion ?? 'unknown',
		serviceInstanceId: options?.serviceInstanceId,
		environment: options?.environment ?? 'browser',
			resourceAttributes: {
				...(options?.resourceAttributes ?? {}),
			},
		traceExporter,
		metricExporter,
		logExporter,
		instrumentations,
		diagnosticsLogLevel: options?.diagnosticsLogLevel,
	};
}

function resolveTraceExporterOptions(
	options?: TraceExporterOptions,
): TraceExporterOptions {
	return {
		...DEFAULT_TRACE_EXPORTER,
		...options,
		headers: {
			...DEFAULT_TRACE_EXPORTER.headers,
			...options?.headers,
		},
		useBatch: options?.useBatch ?? DEFAULT_TRACE_EXPORTER.useBatch,
		useConsoleFallback:
			options?.useConsoleFallback ?? DEFAULT_TRACE_EXPORTER.useConsoleFallback,
		batchOptions: {
			...DEFAULT_TRACE_EXPORTER.batchOptions,
			...options?.batchOptions,
		},
	};
}

function resolveMetricExporterOptions(
	options?: MetricExporterOptions,
): MetricExporterOptions {
	return {
		...DEFAULT_METRIC_EXPORTER,
		...options,
		headers: {
			...DEFAULT_METRIC_EXPORTER.headers,
			...options?.headers,
		},
		exportIntervalMillis:
			options?.exportIntervalMillis ?? DEFAULT_METRIC_EXPORTER.exportIntervalMillis,
		exportTimeoutMillis:
			options?.exportTimeoutMillis ?? DEFAULT_METRIC_EXPORTER.exportTimeoutMillis,
	};
}

function resolveLogExporterOptions(
	options?: LogExporterOptions,
): LogExporterOptions {
	const captureConsole = options?.captureConsole;
	const resolvedCaptureConsole = typeof captureConsole === 'boolean'
		? {
			log: captureConsole,
			info: captureConsole,
			warn: captureConsole,
			error: captureConsole,
			debug: captureConsole,
		}
		: {
			log: captureConsole?.log ?? false,
			info: captureConsole?.info ?? false,
			warn: captureConsole?.warn ?? false,
			error: captureConsole?.error ?? false,
			debug: captureConsole?.debug ?? false,
		};

	return {
		...DEFAULT_LOG_EXPORTER,
		...options,
		headers: {
			...DEFAULT_LOG_EXPORTER.headers,
			...options?.headers,
		},
		useBatch: options?.useBatch ?? DEFAULT_LOG_EXPORTER.useBatch,
		useConsoleFallback:
			options?.useConsoleFallback ?? DEFAULT_LOG_EXPORTER.useConsoleFallback,
		batchOptions: {
			...DEFAULT_LOG_EXPORTER.batchOptions,
			...options?.batchOptions,
		},
		captureConsole: resolvedCaptureConsole,
	};
}

function resolveInstrumentations(
	options?: TelemetryInstrumentationsOptions,
): TelemetryInstrumentationsOptions {
	return {
		documentLoad: normalizeInstrumentationOption(options?.documentLoad),
		fetch: normalizeInstrumentationOption(options?.fetch),
		xmlHttpRequest: normalizeInstrumentationOption(options?.xmlHttpRequest),
	};
}

function normalizeInstrumentationOption<T>(
	option: boolean | T | undefined,
): false | T | undefined {
	if (option === false) {
		return false;
	}

	if (option === true || option === undefined) {
		return undefined;
	}

	return option;
}

function createResource(options: TelemetryOptions): OtelResource {
	const attributes: Record<string, AttributeValue> = {
		[SemanticResourceAttributes.SERVICE_NAME]: options.serviceName,
		[SemanticResourceAttributes.SERVICE_VERSION]: options.serviceVersion,
		[SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: options.environment,
		...options.resourceAttributes,
	};

	if (options.serviceInstanceId) {
		attributes[SemanticResourceAttributes.SERVICE_INSTANCE_ID] =
			options.serviceInstanceId;
	}

	return resourceFromAttributes(attributes);
}

function createSpanExporter(
	options: TraceExporterOptions,
): SpanExporter | null {
	if (!options.enabled) {
		return null;
	}

	if (options.exporterFactory) {
		return options.exporterFactory();
	}

	if (options.url) {
		return new OTLPTraceExporter({
			url: options.url,
			headers: options.headers,
			concurrencyLimit: options.concurrencyLimit,
		});
	}

	if (options.useConsoleFallback) {
		return new ConsoleSpanExporter();
	}

	return null;
}

function createMetricExporter(
	options: MetricExporterOptions,
): PushMetricExporter | null {
	if (!options.enabled) {
		return null;
	}

	if (options.exporterFactory) {
		return options.exporterFactory();
	}

	if (options.url) {
		return new OTLPMetricExporter({
			url: options.url,
			headers: options.headers,
		});
	}

	return null;
}

function createLogExporter(
	options: LogExporterOptions,
): LogRecordExporter | null {
	if (!options.enabled) {
		return null;
	}

	if (options.exporterFactory) {
		return options.exporterFactory();
	}

	if (options.url) {
		return new OTLPLogExporter({
			url: options.url,
			headers: options.headers,
		});
	}

	if (options.useConsoleFallback) {
		return new ConsoleLogRecordExporter();
	}

	return null;
}

function createInstrumentations(
	options: TelemetryInstrumentationsOptions,
): Instrumentation[] {
	const instrumentations: Instrumentation[] = [];

	if (options.documentLoad !== false) {
    if (typeof options.documentLoad === 'boolean' || options.documentLoad === undefined) {
      instrumentations.push(new DocumentLoadInstrumentation());
    } else {
		  instrumentations.push(new DocumentLoadInstrumentation(options.documentLoad));
    }
	}

	if (options.fetch !== false) {
    if (typeof options.fetch === 'boolean' || options.fetch === undefined) {
      instrumentations.push(new FetchInstrumentation());
    } else {
      instrumentations.push(new FetchInstrumentation(options.fetch));
    }
	}

	if (options.xmlHttpRequest !== false) {
    if (typeof options.xmlHttpRequest === 'boolean' || options.xmlHttpRequest === undefined) {
      instrumentations.push(new XMLHttpRequestInstrumentation());
    } else {
      instrumentations.push(new XMLHttpRequestInstrumentation(options.xmlHttpRequest));
    }
	}

	return instrumentations;
}

// Store original console methods
const originalConsoleMethods = {
	log: console.log,
	info: console.info,
	warn: console.warn,
	error: console.error,
	debug: console.debug,
};

function setupConsoleInterception(
	loggerProvider: LoggerProvider,
	captureConfig: {
		log: boolean;
		info: boolean;
		warn: boolean;
		error: boolean;
		debug: boolean;
	}
): void {
	const logger = loggerProvider.getLogger('console');

	if (captureConfig.log) {
		console.log = function(...args: unknown[]) {
			originalConsoleMethods.log.apply(console, args);
			logger.emit({
				severityNumber: SeverityNumber.INFO,
				severityText: 'INFO',
				body: formatConsoleArgs(args),
				attributes: { 
					'console.method': 'log',
					...extractConsoleAttributes(args),
				},
			});
		};
	}

	if (captureConfig.info) {
		console.info = function(...args: unknown[]) {
			originalConsoleMethods.info.apply(console, args);
			logger.emit({
				severityNumber: SeverityNumber.INFO,
				severityText: 'INFO',
				body: formatConsoleArgs(args),
				attributes: { 
					'console.method': 'info',
					...extractConsoleAttributes(args),
				},
			});
		};
	}

	if (captureConfig.warn) {
		console.warn = function(...args: unknown[]) {
			originalConsoleMethods.warn.apply(console, args);
			logger.emit({
				severityNumber: SeverityNumber.WARN,
				severityText: 'WARN',
				body: formatConsoleArgs(args),
				attributes: { 
					'console.method': 'warn',
					...extractConsoleAttributes(args),
				},
			});
		};
	}

	if (captureConfig.error) {
		console.error = function(...args: unknown[]) {
			originalConsoleMethods.error.apply(console, args);
			logger.emit({
				severityNumber: SeverityNumber.ERROR,
				severityText: 'ERROR',
				body: formatConsoleArgs(args),
				attributes: { 
					'console.method': 'error',
					...extractConsoleAttributes(args),
				},
			});
		};
	}

	if (captureConfig.debug) {
		console.debug = function(...args: unknown[]) {
			originalConsoleMethods.debug.apply(console, args);
			logger.emit({
				severityNumber: SeverityNumber.DEBUG,
				severityText: 'DEBUG',
				body: formatConsoleArgs(args),
				attributes: { 
					'console.method': 'debug',
					...extractConsoleAttributes(args),
				},
			});
		};
	}
}

function formatConsoleArgs(args: unknown[]): string {
	return args.map(arg => {
		if (typeof arg === 'string') {
			return arg;
		}
		if (arg instanceof Error) {
			return arg.message;
		}
		try {
			return JSON.stringify(arg);
		} catch {
			return String(arg);
		}
	}).join(' ');
}

function extractConsoleAttributes(args: unknown[]): Record<string, AttributeValue> {
	const attributes: Record<string, AttributeValue> = {};
	
	// Extract error information if present
	const errorArg = args.find(arg => arg instanceof Error) as Error | undefined;
	if (errorArg) {
		attributes['error.message'] = errorArg.message;
		if (errorArg.stack) {
			attributes['error.stack'] = errorArg.stack;
		}
		if (errorArg.name) {
			attributes['error.type'] = errorArg.name;
		}
	}

	// Check if arguments contain objects (excluding Error)
	const hasObjects = args.some(arg => 
		arg !== null && 
		typeof arg === 'object' && 
		!(arg instanceof Error)
	);
	
	if (hasObjects) {
		attributes['console.has_objects'] = true;
	}

	return attributes;
}

export function restoreConsole(): void {
	console.log = originalConsoleMethods.log;
	console.info = originalConsoleMethods.info;
	console.warn = originalConsoleMethods.warn;
	console.error = originalConsoleMethods.error;
	console.debug = originalConsoleMethods.debug;
}
