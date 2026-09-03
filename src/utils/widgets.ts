import { NativeModules, Platform } from 'react-native';
import { TestParameter, TestResult } from '../types';

export function updateAndroidWidgets(params?: TestParameter[], results?: TestResult[]) {
  if (Platform.OS !== 'android') return;

  const { WidgetUpdater } = NativeModules;
  if (WidgetUpdater && typeof WidgetUpdater.updateWidgets === 'function') {
    try {
      const paramsJson = params ? JSON.stringify(params) : null;
      const resultsJson = results ? JSON.stringify(results) : null;
      WidgetUpdater.updateWidgets(paramsJson, resultsJson);
    } catch (e) {
      console.error('Failed to trigger Android widget update:', e);
    }
  }
}
