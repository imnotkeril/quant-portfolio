/**
 * API request and response interceptors
 * Additional interceptors for specific functionality
 */
import { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import apiClient from './client';

/**
 * Request ID generator for tracking requests
 */
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Request timing interface
 */
interface RequestTiming {
  requestId: string;
  startTime: number;
  url: string;
  method: string;
}

/**
 * Active requests tracker
 */
class RequestTracker {
  private activeRequests: Map<string, RequestTiming> = new Map();
  private requestCallbacks: Array<(count: number) => void> = [];

  public addRequest(requestId: string, timing: RequestTiming): void {
    this.activeRequests.set(requestId, timing);
    this.notifyCallbacks();
  }

  public removeRequest(requestId: string): RequestTiming | undefined {
    const timing = this.activeRequests.get(requestId);
    this.activeRequests.delete(requestId);
    this.notifyCallbacks();
    return timing;
  }

  public getActiveRequestsCount(): number {
    return this.activeRequests.size;
  }

  public isRequestActive(requestId: string): boolean {
    return this.activeRequests.has(requestId);
  }

  public onRequestCountChange(callback: (count: number) => void): () => void {
    this.requestCallbacks.push(callback);
    return () => {
      const index = this.requestCallbacks.indexOf(callback);
      if (index > -1) {
        this.requestCallbacks.splice(index, 1);
      }
    };
  }

  private notifyCallbacks(): void {
    const count = this.activeRequests.size;
    this.requestCallbacks.forEach(callback => callback(count));
  }

  public clear(): void {
    this.activeRequests.clear();
    this.notifyCallbacks();
  }
}

// Create global request tracker
export const requestTracker = new RequestTracker();

/**
 * Performance monitoring interceptor
 */
export const setupPerformanceInterceptor = () => {
  const performanceData: Array<{
    url: string;
    method: string;
    duration: number;
    status: number;
    timestamp: number;
  }> = [];

  // Request interceptor for performance monitoring
  apiClient.getInstance().interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const requestId = generateRequestId();
    config.metadata = {
      startTime: Date.now(),
      requestId,
      performanceStart: performance.now(),
    };

    // Track active request
    requestTracker.addRequest(requestId, {
      requestId,
      startTime: Date.now(),
      url: config.url || '',
      method: config.method || 'GET',
    });

    return config;
  });

  // Response interceptor for performance monitoring
  apiClient.getInstance().interceptors.response.use(
    (response: AxiosResponse) => {
      const { requestId, performanceStart } = response.config.metadata || {};

      if (requestId && performanceStart) {
        const duration = performance.now() - performanceStart;

        // Remove from active requests
        requestTracker.removeRequest(requestId);

        // Store performance data
        performanceData.push({
          url: response.config.url || '',
          method: response.config.method || 'GET',
          duration,
          status: response.status,
          timestamp: Date.now(),
        });

        // Log slow requests in development
        if (typeof window !== 'undefined' && (window as any).__DEV__ && duration > 1000) {
          console.warn(`🐌 Slow API Request: ${response.config.method?.toUpperCase()} ${response.config.url} took ${duration.toFixed(2)}ms`);
        }
      }

      return response;
    },
    (error: AxiosError) => {
      const { requestId, performanceStart } = error.config?.metadata || {};

      if (requestId) {
        // Remove from active requests
        requestTracker.removeRequest(requestId);

        if (performanceStart) {
          const duration = performance.now() - performanceStart;

          // Store performance data for failed requests too
          performanceData.push({
            url: error.config?.url || '',
            method: error.config?.method || 'GET',
            duration,
            status: error.response?.status || 0,
            timestamp: Date.now(),
          });
        }
      }

      return Promise.reject(error);
    }
  );

  // Return function to get performance data
  return {
    getPerformanceData: () => [...performanceData],
    clearPerformanceData: () => performanceData.splice(0, performanceData.length),
    getAverageResponseTime: () => {
      if (performanceData.length === 0) return 0;
      const total = performanceData.reduce((sum, data) => sum + data.duration, 0);
      return total / performanceData.length;
    },
    getSlowRequests: (threshold = 1000) => {
      return performanceData.filter(data => data.duration > threshold);
    },
  };
};

/**
 * Retry interceptor for failed requests
 */
export const setupRetryInterceptor = (maxRetries = 3, retryDelay = 1000) => {
  const shouldRetry = (error: AxiosError): boolean => {
    // Don't retry if no response (network error)
    if (!error.response) return true;

    // Don't retry client errors (4xx)
    if (error.response.status >= 400 && error.response.status < 500) return false;

    // Retry server errors (5xx)
    if (error.response.status >= 500) return true;

    return false;
  };

  const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  apiClient.getInstance().interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const config = error.config as InternalAxiosRequestConfig & { retryCount?: number };

      // Initialize retry count
      if (!config.retryCount) {
        config.retryCount = 0;
      }

      // Check if we should retry
      if (config.retryCount < maxRetries && shouldRetry(error)) {
        config.retryCount++;

        // Calculate delay with exponential backoff
        const delayTime = retryDelay * Math.pow(2, config.retryCount - 1);

        if (typeof window !== 'undefined' && (window as any).__DEV__) {
          console.log(`🔄 Retrying request (${config.retryCount}/${maxRetries}): ${config.method?.toUpperCase()} ${config.url} after ${delayTime}ms`);
        }

        // Wait before retrying
        await delay(delayTime);

        // Retry the request
        return apiClient.getInstance()(config);
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Cache interceptor for GET requests
 */
export const setupCacheInterceptor = (cacheDuration = 5 * 60 * 1000) => { // 5 minutes default
  const cache = new Map<string, { data: any; timestamp: number }>();

  const getCacheKey = (config: InternalAxiosRequestConfig): string => {
    const { method, url, params } = config;
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  };

  const isExpired = (timestamp: number): boolean => {
    return Date.now() - timestamp > cacheDuration;
  };

  // Request interceptor for cache
  apiClient.getInstance().interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Only cache GET requests
    if (config.method?.toLowerCase() !== 'get') {
      return config;
    }

    const cacheKey = getCacheKey(config);
    const cached = cache.get(cacheKey);

    if (cached && !isExpired(cached.timestamp)) {
      // Return cached response
      config.adapter = () => {
        return Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {},
        });
      };
    }

    return config;
  });

  // Response interceptor for cache
  apiClient.getInstance().interceptors.response.use((response: AxiosResponse) => {
    // Only cache successful GET requests
    if (response.config.method?.toLowerCase() === 'get' && response.status === 200) {
      const cacheKey = getCacheKey(response.config);
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    return response;
  });

  return {
    clearCache: () => cache.clear(),
    getCacheSize: () => cache.size,
    getCacheKeys: () => Array.from(cache.keys()),
    removeCacheKey: (key: string) => cache.delete(key),
  };
};

/**
 * Request deduplication interceptor
 */
export const setupDeduplicationInterceptor = () => {
  const pendingRequests = new Map<string, Promise<AxiosResponse>>();

  const getRequestKey = (config: InternalAxiosRequestConfig): string => {
    const { method, url, params, data } = config;
    return `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
  };

  apiClient.getInstance().interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const requestKey = getRequestKey(config);

    // Check if the same request is already pending
    if (pendingRequests.has(requestKey)) {
      // Return the pending request
      config.adapter = () => pendingRequests.get(requestKey)!;
    } else {
      // Store the request promise
      const requestPromise = apiClient.getInstance()(config);
      pendingRequests.set(requestKey, requestPromise);

      // Clean up when request completes
      requestPromise.finally(() => {
        pendingRequests.delete(requestKey);
      });
    }

    return config;
  });

  return {
    getPendingRequestsCount: () => pendingRequests.size,
    clearPendingRequests: () => pendingRequests.clear(),
  };
};

/**
 * Setup all interceptors
 */
export const setupAllInterceptors = () => {
  const performance = setupPerformanceInterceptor();
  const cache = setupCacheInterceptor();
  const deduplication = setupDeduplicationInterceptor();

  // Setup retry interceptor with default settings
  setupRetryInterceptor();

  return {
    performance,
    cache,
    deduplication,
    requestTracker,
  };
};

export default {
  setupPerformanceInterceptor,
  setupRetryInterceptor,
  setupCacheInterceptor,
  setupDeduplicationInterceptor,
  setupAllInterceptors,
  requestTracker,
};