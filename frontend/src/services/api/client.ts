/**
 * API client configuration
 * Axios-based HTTP client with request/response interceptors
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_TIMEOUT, API_ERROR_CODES } from '../../constants/api';
import { ApiResponse, ApiError } from '../../types/common';

// Extend AxiosRequestConfig to include metadata
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
      requestId?: string;
      performanceStart?: number;
      retryCount?: number;
    };
  }
}

/**
 * Custom error class for API errors
 */
class ApiClientError extends Error {
  public status?: number;
  public code?: string;
  public details?: Record<string, any>;

  constructor(message: string, status?: number, code?: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * API Client class
 */
class ApiClient {
  private instance: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token if available
        if (this.authToken) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: new Date().getTime() };

        // Log request in development
        if (typeof window !== 'undefined' && (window as any).__DEV__) {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calculate request duration
        const duration = new Date().getTime() - (response.config.metadata?.startTime || 0);

        // Log response in development
        if (typeof window !== 'undefined' && (window as any).__DEV__) {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            duration: `${duration}ms`,
            data: response.data,
          });
        }

        return response;
      },
      (error: AxiosError) => {
        const duration = error.config?.metadata?.startTime
          ? new Date().getTime() - error.config.metadata.startTime
          : 0;

        // Log error in development
        if (typeof window !== 'undefined' && (window as any).__DEV__) {
          console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            duration: `${duration}ms`,
            message: error.message,
            data: error.response?.data,
          });
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle API errors and convert to standardized format
   */
  private handleError(error: AxiosError): ApiClientError {
    const { response, message } = error;

    if (response) {
      // Server responded with error status
      const status = response.status;
      const data = response.data as any;

      // Добавить логирование для отладки
      console.error('API Error Response:', {
        status,
        url: response.config?.url,
        method: response.config?.method,
        data
      });

      let errorMessage = 'An error occurred';
      let code: string | undefined;
      let details: Record<string, any> | undefined;

      if (data) {
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.detail) {
          errorMessage = data.detail;
        }

        code = data.code;
        details = data.details || data;
      }

      // Handle specific status codes
      switch (status) {
        case API_ERROR_CODES.UNAUTHORIZED:
          errorMessage = 'Authentication required';
          this.handleUnauthorized();
          break;
        case API_ERROR_CODES.FORBIDDEN:
          errorMessage = 'Access forbidden';
          break;
        case API_ERROR_CODES.NOT_FOUND:
          errorMessage = 'Resource not found';
          break;
        case API_ERROR_CODES.SERVER_ERROR:
          errorMessage = 'Internal server error';
          break;
      }

      return new ApiClientError(errorMessage, status, code, details);
    } else if (error.request) {
      // Network error
      return new ApiClientError('Network error - please check your connection', 0, 'NETWORK_ERROR');
    } else {
      // Request setup error
      return new ApiClientError(message || 'Request configuration error', 0, 'REQUEST_ERROR');
    }
  }

  /**
   * Handle unauthorized responses
   */
  private handleUnauthorized(): void {
    // Clear auth token
    this.authToken = null;

    // Clear stored token
    localStorage.removeItem('authToken');

    // Redirect to login or dispatch logout action
    // This can be customized based on your routing setup
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  /**
   * Set authentication token
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('authToken', token);
  }

  /**
   * Clear authentication token
   */
  public clearAuthToken(): void {
    this.authToken = null;
    localStorage.removeItem('authToken');
  }

  /**
   * Initialize auth token from localStorage
   */
  public initializeAuth(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.authToken = token;
    }
  }

  /**
   * Generic GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   */
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PATCH request
   */
  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Upload file
   */
  public async uploadFile<T>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    return response.data;
  }

  /**
   * Download file
   */
  public async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
    });

    // Create blob link to download
    const href = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', filename || 'download');
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  }

  /**
   * Get axios instance for advanced usage
   */
  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Create and export singleton instance
const apiClient = new ApiClient();

// Initialize auth on app startup
apiClient.initializeAuth();

export default apiClient;
export { ApiClient, ApiClientError };