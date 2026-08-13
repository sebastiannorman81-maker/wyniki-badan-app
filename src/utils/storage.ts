import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { TestParameter, TestResult } from '../types';

const PARAMS_KEY = '@wyniki_badania_parameters';
const RESULTS_KEY = '@wyniki_badania_results';

// ========================
// AsyncStorage CRUD
// ========================

export async function loadParameters(): Promise<TestParameter[]> {
  try {
    const json = await AsyncStorage.getItem(PARAMS_KEY);
    if (json) return JSON.parse(json);
    const defaults: TestParameter[] = [];
    await saveParameters(defaults);
    return defaults;
  } catch (e) {
    console.error('Error loading parameters:', e);
    return [];
  }
}

export async function saveParameters(params: TestParameter[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PARAMS_KEY, JSON.stringify(params));
  } catch (e) {
    console.error('Error saving parameters:', e);
  }
}

export async function loadResults(): Promise<TestResult[]> {
  try {
    const json = await AsyncStorage.getItem(RESULTS_KEY);
    if (json) return JSON.parse(json);
    const defaults: TestResult[] = [];
    await saveResults(defaults);
    return defaults;
  } catch (e) {
    console.error('Error loading results:', e);
    return [];
  }
}

export async function saveResults(results: TestResult[]): Promise<void> {
  try {
    await AsyncStorage.setItem(RESULTS_KEY, JSON.stringify(results));
  } catch (e) {
    console.error('Error saving results:', e);
  }
}

// ========================
// Export / Import JSON
// ========================

export async function exportData(params: TestParameter[], results: TestResult[]): Promise<boolean> {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    app: 'Wyniki Badań',
    parameters: params,
    results: results,
  };

  const fileName = `wyniki_badan_${new Date().toISOString().split('T')[0]}.json`;

  // Fallback for Web browser download
  if (Platform.OS === 'web') {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('Web export error:', err);
      return false;
    }
  }

  // Native mobile save and share
  try {
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Eksportuj dane Wyników Badań',
        UTI: 'public.json',
      });
      return true;
    }
    return false;
  } catch (e) {
    console.error('Error exporting data:', e);
    return false;
  }
}

export async function importData(): Promise<{ params: TestParameter[]; results: TestResult[] } | null> {
  // Fallback for Web browser upload
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (event: any) => {
          const file = event.target.files[0];
          if (!file) {
            resolve(null);
            return;
          }
          const reader = new FileReader();
          reader.onload = async (e: any) => {
            try {
              const content = e.target.result;
              const parsedData = JSON.parse(content);
              if (!parsedData.parameters || !parsedData.results) {
                alert('Nieprawidłowy format pliku kopii zapasowej.');
                resolve(null);
                return;
              }
              await saveParameters(parsedData.parameters);
              await saveResults(parsedData.results);
              resolve({ params: parsedData.parameters, results: parsedData.results });
            } catch (err) {
              console.error('Error parsing imported JSON:', err);
              resolve(null);
            }
          };
          reader.onerror = () => resolve(null);
          reader.readAsText(file);
        };
        input.click();
      } catch (err) {
        console.error('Web import error:', err);
        resolve(null);
      }
    });
  }

  // Native mobile document picker
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const fileUri = result.assets[0].uri;
    const content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const data = JSON.parse(content);

    if (!data.parameters || !data.results) {
      throw new Error('Nieprawidłowy format pliku');
    }

    // Validate & save
    await saveParameters(data.parameters);
    await saveResults(data.results);

    return { params: data.parameters, results: data.results };
  } catch (e) {
    console.error('Error importing data:', e);
    return null;
  }
}
