import { NativeModules, Platform } from 'react-native';

export function updateAndroidWidgets() {
  if (Platform.OS !== 'android') return;
  
  const { WidgetUpdater } = NativeModules;
  if (WidgetUpdater && typeof WidgetUpdater.updateWidgets === 'function') {
    try {
      WidgetUpdater.updateWidgets();
    } catch (e) {
      console.error('Failed to trigger Android widget update:', e);
    }
  }
}
