import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import { env } from '../../config/env';

export const API_BASE_URL = 'https://api.themoviedb.org/3/';

type ApiClientOptions = {
  serverUrl: string;
  timeout: number;
  path: string;
  type: 'movie' | '';
};

function isTmdbReadAccessToken(key: string) {
  return key.startsWith('eyJ');
}

function applyTmdbAuth(
  config: InternalAxiosRequestConfig,
  type: ApiClientOptions['type'],
) {
  const apiKey = type === 'movie' ? env.tmdbApiKey : '';
  if (!apiKey) {
    return config;
  }

  if (isTmdbReadAccessToken(apiKey)) {
    config.headers.Authorization = `Bearer ${apiKey}`;
    return config;
  }

  config.params = {
    ...config.params,
    api_key: apiKey,
  };
  return config;
}

export default class ApiClient {
  #instance: AxiosInstance;

  constructor(options: Partial<ApiClientOptions> = {}) {
    const {
      serverUrl = API_BASE_URL,
      timeout = 1000 * 60 * 3,
      path = '/',
      type = 'movie',
    } = options;

    this.#instance = axios.create({
      baseURL: `${serverUrl}${path}`,
      timeout,
    });

    this.#instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => applyTmdbAuth(config, type),
      (error: AxiosError) => Promise.reject(error),
    );
  }

  get instance() {
    return this.#instance;
  }
}
