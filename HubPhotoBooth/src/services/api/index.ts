import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';
import {API_CONFIG, STORAGE_KEYS} from '../../constants';
import {storageService} from '../storage';

// API 서비스 클래스
class ApiService {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // 인터셉터 설정
  private setupInterceptors() {
    // 요청 인터셉터
    this.instance.interceptors.request.use(
      async config => {
        // 토큰이 있으면 헤더에 추가
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    // 응답 인터셉터
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async error => {
        const originalRequest = error.config;

        // 401 에러이고 재시도하지 않은 요청인 경우
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // 이미 토큰 갱신 중인 경우 대기
            return new Promise((resolve, reject) => {
              this.failedQueue.push({resolve, reject});
            })
              .then(() => {
                return this.instance(originalRequest);
              })
              .catch(err => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // 토큰 갱신 시도
            const newToken = await this.refreshAuthToken();
            if (newToken) {
              // 대기 중인 요청들 처리
              this.processQueue(null, newToken);

              // 원래 요청 재시도
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.instance(originalRequest);
            }
          } catch (refreshError) {
            // 토큰 갱신 실패 시 대기 중인 요청들 실패 처리
            this.processQueue(refreshError, null);

            // 로그아웃 처리
            await this.handleAuthFailure();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // 대기 중인 요청들 처리
  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({resolve, reject}) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  // 인증 토큰 가져오기
  private async getAuthToken(): Promise<string | null> {
    try {
      const userData = await storageService.getItem(STORAGE_KEYS.USER);
      if (userData) {
        const user = JSON.parse(userData);
        return user.token || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // 토큰 갱신
  private async refreshAuthToken(): Promise<string | null> {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`);
      if (response.data.success && response.data.data?.token) {
        // 새로운 토큰을 스토리지에 저장
        const userData = await storageService.getItem(STORAGE_KEYS.USER);
        if (userData) {
          const user = JSON.parse(userData);
          user.token = response.data.data.token;
          await storageService.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        }
        return response.data.data.token;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // 인증 실패 처리
  private async handleAuthFailure() {
    try {
      await storageService.removeItem(STORAGE_KEYS.USER);
      // 앱 재시작 또는 로그인 화면으로 이동
    } catch (error) {
      console.error('Auth failure handling error:', error);
    }
  }

  // GET 요청
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.instance.get(url, config);
  }

  // POST 요청
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.instance.post(url, data, config);
  }

  // PUT 요청
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.instance.put(url, data, config);
  }

  // DELETE 요청
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.instance.delete(url, config);
  }

  // PATCH 요청
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.instance.patch(url, data, config);
  }

  // 파일 업로드
  async uploadFile<T = any>(
    url: string,
    file: File | FormData,
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(progress);
        }
      },
    };

    return this.instance.post(url, file, uploadConfig);
  }

  // 다운로드 (React Native에서는 파일 시스템을 통해 처리)
  async downloadFile(
    url: string,
    filename?: string,
    config?: AxiosRequestConfig,
  ): Promise<string> {
    await this.instance.get(url, {
      ...config,
      responseType: 'blob',
    });

    // React Native에서는 파일 시스템 경로를 반환
    // 실제 다운로드는 react-native-fs 등을 사용하여 구현
    return `file://${filename || 'download'}`;
  }

  // 요청 취소
  cancelRequest(cancelToken: any) {
    if (cancelToken) {
      cancelToken.cancel('Request cancelled');
    }
  }

  // 기본 URL 설정
  setBaseURL(url: string) {
    this.instance.defaults.baseURL = url;
  }

  // 기본 헤더 설정
  setDefaultHeaders(headers: Record<string, string>) {
    Object.assign(this.instance.defaults.headers, headers);
  }

  // 타임아웃 설정
  setTimeout(timeout: number) {
    this.instance.defaults.timeout = timeout;
  }
}

// 싱글톤 인스턴스 생성
export const apiService = new ApiService();

// 기본 내보내기
export default apiService;
