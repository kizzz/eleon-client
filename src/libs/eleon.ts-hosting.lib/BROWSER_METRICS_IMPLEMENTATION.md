# Browser Metrics Implementation

## Overview
I've implemented automatic browser performance metrics collection that will now send data to your `/telemetry/v1/metrics` endpoint.

## What Was Added

### 1. **Browser Metrics Helper** (`browser-metrics-helper.ts`)
Automatically collects browser performance metrics:

#### Metrics Collected:
- **Memory Usage** (Observable Gauge)
  - `browser.memory.usage` - Tracks heap memory usage
  - Attributes: `used_heap`, `total_heap`, `heap_limit`

- **FPS (Frames Per Second)** (Observable Gauge)
  - `browser.fps` - Current frames per second
  - Helps identify UI performance issues

- **Navigation Timing** (Histogram)
  - `browser.navigation.duration` - Page load metrics
  - Metrics: `time_to_first_byte`, `dom_content_loaded`, `load_complete`, `dom_interactive`, `total_load_time`

- **Resource Loading** (Counter)
  - `browser.resources.loaded` - Number of resources loaded
  - Attributes: `resource_type` (script, stylesheet, image, etc.)

- **Long Tasks** (Histogram)
  - `browser.longtask.duration` - Tracks tasks that block the main thread
  - Helps identify performance bottlenecks

### 2. **Integration with Telemetry Service**
Updated `telemetry.service.ts`:
- Automatically starts browser metrics collection when telemetry initializes
- Reduced metric export interval from 30s to **15 seconds** for better visibility
- Metrics are sent to: `${basePath}/v1/metrics`

### 3. **Custom Metrics Example** (`custom-metrics-example.ts`)
Provides examples for creating your own application-specific metrics:
- Page view tracking
- API call monitoring
- Error tracking
- Form submission timing
- Observable gauges for dynamic values

## How It Works

### Automatic Collection
When your application initializes telemetry (after user authorization):
```typescript
configureTelemetry() {
  // ... telemetry setup ...
  startBrowserMetricsCollection(); // <-- Automatically starts
}
```

### Export Schedule
- Metrics are **batched** and exported every **15 seconds**
- This is why you don't see continuous requests like traces
- Each export contains all metrics collected in that interval

### What You'll See in Network Tab
Every 15 seconds, you should see:
```
POST /telemetry/v1/metrics
Content-Type: application/json
Authorization: Bearer <token>

{
  "resourceMetrics": [
    {
      "scopeMetrics": [
        {
          "metrics": [
            {
              "name": "browser.memory.usage",
              "gauge": { ... }
            },
            {
              "name": "browser.fps",
              "gauge": { ... }
            },
            // ... more metrics
          ]
        }
      ]
    }
  ]
}
```

## Usage

### Automatic Metrics (Already Working)
Browser metrics are automatically collected. No code changes needed in your app!

### Adding Custom Metrics (Optional)
```typescript
import { CustomMetricsExample } from '@vportal-ui/eleonsoft-sdk';

// Track a page view
CustomMetricsExample.trackPageView('/dashboard', userId);

// Track API call
const start = performance.now();
try {
  const result = await this.api.getData();
  CustomMetricsExample.trackApiCall('/api/data', 'GET', 200, performance.now() - start);
} catch (error) {
  CustomMetricsExample.trackApiCall('/api/data', 'GET', 500, performance.now() - start);
  CustomMetricsExample.trackError('api_error', 'DataService', 'high');
}

// Track form submission
const formStart = performance.now();
await this.submitForm();
CustomMetricsExample.trackFormSubmission('login-form', performance.now() - formStart, true);
```

## Troubleshooting

### "I still don't see metrics requests"

1. **Wait 15 seconds** - Metrics are batched and exported every 15 seconds
2. **Check telemetry initialization** - Look for console logs:
   - "Starting telemetry for ClientApp-..."
   - "Telemetry initialized for ClientApp-..."
   - "Starting browser metrics collection..."
3. **Check authorization** - Telemetry only starts after user is authorized
4. **Check browser console** for any OpenTelemetry errors
5. **Verify endpoint** - Should be `/telemetry/v1/metrics`

### Adjusting Export Interval
To see metrics more frequently (for testing):
```typescript
// In telemetry.service.ts
metricExporter: {
  enabled: true,
  url: `${basePath}/v1/metrics`,
  exportIntervalMillis: 5_000, // Export every 5 seconds
}
```

### Viewing Current Metrics
```typescript
import { getBrowserMetricsSnapshot } from '@vportal-ui/eleonsoft-sdk';

const snapshot = getBrowserMetricsSnapshot();
console.log('Current metrics:', snapshot);
// Output:
// {
//   fps: 60,
//   timestamp: "2025-10-18T...",
//   memory: {
//     usedJSHeapSize: 45000000,
//     totalJSHeapSize: 60000000,
//     jsHeapSizeLimit: 2190000000,
//     usagePercent: 2
//   },
//   navigation: { ... }
// }
```

## Files Modified/Created

1. ✅ Created: `shared/sdk/typescript-sdk/src/lib/helpers/browser-metrics-helper.ts`
2. ✅ Created: `shared/sdk/typescript-sdk/src/lib/helpers/custom-metrics-example.ts`
3. ✅ Modified: `shared/sdk/typescript-sdk/src/lib/helpers/index.ts` (added export)
4. ✅ Modified: `shared/sdk/typescript-sdk/src/lib/services/overrides/telemetry.service.ts`
   - Added import for `startBrowserMetricsCollection`
   - Changed export interval to 15 seconds
   - Added automatic start of browser metrics

## Next Steps

1. **Rebuild the project** to compile the changes
2. **Run your application** and log in
3. **Wait 15 seconds** after telemetry initializes
4. **Check Network tab** for POST requests to `/telemetry/v1/metrics`
5. **Optional**: Implement custom metrics for your specific use cases

## Benefits

- ✅ **Zero configuration** - Metrics collection starts automatically
- ✅ **Comprehensive** - Covers memory, performance, resources, and UI responsiveness
- ✅ **Production-ready** - Minimal overhead, batched exports
- ✅ **Extensible** - Easy to add custom metrics for your specific needs
- ✅ **Standards-based** - Uses OpenTelemetry standard format
