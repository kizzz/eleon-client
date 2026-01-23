/**
 * Browser Performance Metrics Helper
 * 
 * Automatically collects and reports browser performance metrics including:
 * - Memory usage (heap size, used heap)
 * - Navigation timing (page load, DOM content loaded, etc.)
 * - Resource timing (number of resources loaded)
 * - Long tasks (performance issues)
 * - Frame rate (FPS)
 * 
 * @example
 * // Start collecting metrics after telemetry is initialized
 * startBrowserMetricsCollection();
 * 
 * // Stop collecting metrics
 * stopBrowserMetricsCollection();
 */

import { metrics } from '@opentelemetry/api';
import type { Counter, Histogram, ObservableGauge } from '@opentelemetry/api';

const METER_NAME = 'browser-performance';
const COLLECTION_INTERVAL = 10000; // Collect metrics every 10 seconds

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

interface BrowserMetrics {
  memoryGauge?: ObservableGauge;
  navigationHistogram?: Histogram;
  resourceCounter?: Counter;
  longTaskHistogram?: Histogram;
  fpsGauge?: ObservableGauge;
}

let metricsInterval: number | undefined;
let performanceObserver: PerformanceObserver | undefined;
let browserMetrics: BrowserMetrics = {};
let lastFrameTime = performance.now();
let frameCount = 0;
let currentFPS = 0;

/**
 * Check if Performance API with memory is available
 */
function hasMemoryInfo(): boolean {
  return 'memory' in performance && typeof (performance as PerformanceWithMemory).memory === 'object';
}

/**
 * Check if PerformanceObserver is available
 */
function hasPerformanceObserver(): boolean {
  return typeof PerformanceObserver !== 'undefined';
}

/**
 * Initialize browser metrics instruments
 */
function initializeMetrics(): void {
  const meter = metrics.getMeter(METER_NAME, '1.0.0');

  // Memory usage gauge (if available)
  if (hasMemoryInfo()) {
    browserMetrics.memoryGauge = meter.createObservableGauge('browser.memory.usage', {
      description: 'Browser memory usage in bytes',
      unit: 'bytes',
    });

    browserMetrics.memoryGauge.addCallback((observableResult) => {
      const memory = (performance as PerformanceWithMemory).memory;
      if (memory) {
        observableResult.observe(memory.usedJSHeapSize, {
          type: 'used_heap',
        });
        observableResult.observe(memory.totalJSHeapSize, {
          type: 'total_heap',
        });
        observableResult.observe(memory.jsHeapSizeLimit, {
          type: 'heap_limit',
        });
      }
    });
  }

  // FPS gauge
  browserMetrics.fpsGauge = meter.createObservableGauge('browser.fps', {
    description: 'Current frames per second',
    unit: 'fps',
  });

  browserMetrics.fpsGauge.addCallback((observableResult) => {
    observableResult.observe(currentFPS);
  });

  // Navigation timing histogram
  browserMetrics.navigationHistogram = meter.createHistogram('browser.navigation.duration', {
    description: 'Navigation timing metrics',
    unit: 'ms',
  });

  // Resource counter
  browserMetrics.resourceCounter = meter.createCounter('browser.resources.loaded', {
    description: 'Number of resources loaded',
    unit: 'resources',
  });

  // Long task histogram
  browserMetrics.longTaskHistogram = meter.createHistogram('browser.longtask.duration', {
    description: 'Duration of long tasks',
    unit: 'ms',
  });
}

/**
 * Collect navigation timing metrics
 */
function collectNavigationMetrics(): void {
  if (!browserMetrics.navigationHistogram) return;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!navigation) return;

  const histogram = browserMetrics.navigationHistogram;

  // Time to first byte
  const ttfb = navigation.responseStart - navigation.requestStart;
  histogram.record(ttfb, { metric: 'time_to_first_byte' });

  // DOM Content Loaded
  const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
  histogram.record(domContentLoaded, { metric: 'dom_content_loaded' });

  // Page Load Complete
  const loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
  histogram.record(loadComplete, { metric: 'load_complete' });

  // DOM Interactive
  const domInteractive = navigation.domInteractive - navigation.fetchStart;
  histogram.record(domInteractive, { metric: 'dom_interactive' });

  // Total page load time
  const totalLoadTime = navigation.loadEventEnd - navigation.fetchStart;
  histogram.record(totalLoadTime, { metric: 'total_load_time' });
}

/**
 * Collect resource timing metrics
 */
function collectResourceMetrics(): void {
  if (!browserMetrics.resourceCounter) return;

  const resources = performance.getEntriesByType('resource');
  const resourceTypes: Record<string, number> = {};

  resources.forEach((resource) => {
    const type = (resource as PerformanceResourceTiming).initiatorType || 'unknown';
    resourceTypes[type] = (resourceTypes[type] || 0) + 1;
  });

  // Record counts by resource type
  Object.entries(resourceTypes).forEach(([type, count]) => {
    if (browserMetrics.resourceCounter) {
      browserMetrics.resourceCounter.add(count, { resource_type: type });
    }
  });
}

/**
 * Setup performance observer for long tasks
 */
function setupPerformanceObserver(): void {
  if (!hasPerformanceObserver() || !browserMetrics.longTaskHistogram) return;

  try {
    performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'longtask' && browserMetrics.longTaskHistogram) {
          browserMetrics.longTaskHistogram.record(entry.duration, {
            task_type: 'long_task',
          });
        }
      }
    });

    performanceObserver.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    console.warn('Failed to setup PerformanceObserver for long tasks:', error);
  }
}

/**
 * Calculate FPS using requestAnimationFrame
 */
function measureFPS(): void {
  const now = performance.now();
  frameCount++;

  // Calculate FPS every second
  if (now >= lastFrameTime + 1000) {
    currentFPS = Math.round((frameCount * 1000) / (now - lastFrameTime));
    frameCount = 0;
    lastFrameTime = now;
  }

  requestAnimationFrame(measureFPS);
}

/**
 * Start collecting browser performance metrics
 * Call this after telemetry has been initialized
 */
export function startBrowserMetricsCollection(): void {
  if (metricsInterval) {
    console.warn('Browser metrics collection is already running');
    return;
  }

  if (typeof window === 'undefined') {
    console.warn('Browser metrics can only be collected in a browser environment');
    return;
  }

  console.log('Starting browser metrics collection...');

  // Initialize metrics instruments
  initializeMetrics();

  // Collect navigation metrics once after page load
  if (document.readyState === 'complete') {
    collectNavigationMetrics();
  } else {
    window.addEventListener('load', () => {
      setTimeout(collectNavigationMetrics, 0);
    });
  }

  // Setup performance observer for long tasks
  setupPerformanceObserver();

  // Start FPS measurement
  requestAnimationFrame(measureFPS);

  // Collect resource metrics periodically
  metricsInterval = window.setInterval(() => {
    collectResourceMetrics();
  }, COLLECTION_INTERVAL);

  console.log('Browser metrics collection started successfully');
}

/**
 * Stop collecting browser performance metrics
 */
export function stopBrowserMetricsCollection(): void {
  if (metricsInterval) {
    clearInterval(metricsInterval);
    metricsInterval = undefined;
  }

  if (performanceObserver) {
    performanceObserver.disconnect();
    performanceObserver = undefined;
  }

  browserMetrics = {};
  console.log('Browser metrics collection stopped');
}

/**
 * Get current browser metrics snapshot
 */
export function getBrowserMetricsSnapshot(): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {
    fps: currentFPS,
    timestamp: new Date().toISOString(),
  };

  if (hasMemoryInfo()) {
    const memory = (performance as PerformanceWithMemory).memory;
    snapshot.memory = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercent: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100),
    };
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    snapshot.navigation = {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      domInteractive: navigation.domInteractive - navigation.fetchStart,
    };
  }

  return snapshot;
}
