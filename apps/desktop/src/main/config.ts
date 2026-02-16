import type { AppConfig } from './types';

/**
 * Application configuration
 * Centralized settings for the entire desktop app
 */
export const config: AppConfig = {
  window: {
    width: 1280,
    height: 800,
    title: 'BizFlow POS',
    devTools: process.env.NODE_ENV === 'development',
  },
  urls: {
    dev: 'http://localhost:3001',
    prod: 'file://${__dirname}/../../web/index.html',
  },
  printer: {
    defaultWidth: 80,
    supportedWidths: [58, 80],
  },
};

/**
 * Check if app is running in development mode
 */
export const isDev = (): boolean => {
  return (
    process.env.NODE_ENV === 'development' ||
    !require('electron').app.isPackaged
  );
};

/**
 * Get the appropriate URL based on environment
 */
export const getAppURL = (): string => {
  return isDev() ? config.urls.dev : config.urls.prod;
};
