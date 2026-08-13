import React, { useState, useEffect } from 'react';
import { StyleSheet, View, useColorScheme, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Kalam_400Regular, Kalam_700Bold } from '@expo-google-fonts/kalam';
import { theme, applyTheme, applyFont, ThemeMode, FontMode } from './src/utils/theme';
import { TestParameter, TestResult } from './src/types';
import { useTestData } from './src/hooks/useTestData';
import DashboardView from './src/components/DashboardView';
import ParameterDetailView from './src/components/ParameterDetailView';
import ParameterModal from './src/components/ParameterModal';
import TestResultModal from './src/components/TestResultModal';
import SettingsView from './src/components/SettingsView';
import ImportCodeModal from './src/components/ImportCodeModal';
import QRModal from './src/components/QRModal';
import ImageScanModal from './src/components/ImageScanModal';
import ReportModal from './src/components/ReportModal';


const ACCENT_STORAGE_KEY = 'wyniki_badan_accent_color';
const THEME_MODE_KEY = 'wyniki_badan_theme_mode';
const FONT_MODE_KEY = 'wyniki_badan_font_mode';
const COMPACT_VIEW_KEY = 'wyniki_badan_compact_view';

function MainAppContent() {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Kalam_400Regular,
    Kalam_700Bold,
  });
  const {
    parameters,
    results,
    loading,
    addParameter,
    updateParameter,
    deleteParameter,
    addResult,
    addResults,
    updateResult,
    deleteResult,
    getResultsForParam,
    getLatestResult,
    replaceAll,
    reorderParameters,
  } = useTestData();

  // Navigation State
  const [screen, setScreen] = useState<'dashboard' | 'detail' | 'settings'>('dashboard');
  const [selectedParam, setSelectedParam] = useState<TestParameter | null>(null);

  // Search & Filter State
  const [testSearch, setTestSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Wszystkie');
  const [tagFilter, setTagFilter] = useState('');

  // Modal States
  const [showParamModal, setShowParamModal] = useState(false);
  const [editingParam, setEditingParam] = useState<TestParameter | null>(null);

  const [showTestModal, setShowTestModal] = useState(false);
  const [editingTest, setEditingTest] = useState<TestResult | null>(null);
  const [targetParamForNewTest, setTargetParamForNewTest] = useState<TestParameter | null>(null);

  const [showImportCodeModal, setShowImportCodeModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showImageScanModal, setShowImageScanModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Accent Color & Custom Theme/Font States
  const [accentColor, setAccentColor] = useState<string>(theme.accentPrimary);
  const [themeMode, setThemeMode] = useState<ThemeMode>('liquid-glass');
  const [fontMode, setFontMode] = useState<FontMode>('standard');
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(ACCENT_STORAGE_KEY).then(stored => {
      if (stored) setAccentColor(stored);
    });
    AsyncStorage.getItem(THEME_MODE_KEY).then(stored => {
      if (stored) setThemeMode(stored as ThemeMode);
      else setThemeMode('liquid-glass');
    });
    AsyncStorage.getItem(FONT_MODE_KEY).then(stored => {
      if (stored) setFontMode(stored as FontMode);
    });
    AsyncStorage.getItem(COMPACT_VIEW_KEY).then(stored => {
      if (stored) setIsCompact(stored === 'true');
    });
  }, []);

  useEffect(() => {
    const sysTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
    applyTheme(themeMode, sysTheme);
  }, [themeMode, systemColorScheme]);

  useEffect(() => {
    applyFont(fontMode);
  }, [fontMode]);

  const handleSetAccentColor = (color: string) => {
    setAccentColor(color);
    AsyncStorage.setItem(ACCENT_STORAGE_KEY, color);
  };

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    AsyncStorage.setItem(THEME_MODE_KEY, mode);
  };

  const handleSetFontMode = (mode: FontMode) => {
    setFontMode(mode);
    AsyncStorage.setItem(FONT_MODE_KEY, mode);
  };

  const handleSetIsCompact = (val: boolean) => {
    setIsCompact(val);
    AsyncStorage.setItem(COMPACT_VIEW_KEY, val ? 'true' : 'false');
  };

  // --- Parameter Callbacks ---
  const handleOpenAddParam = () => {
    setEditingParam(null);
    setShowParamModal(true);
  };

  const handleOpenEditParam = (param: TestParameter) => {
    setEditingParam(param);
    setShowParamModal(true);
  };

  const handleSaveParam = async (param: TestParameter) => {
    if (editingParam) {
      await updateParameter(editingParam.name, param);
      // Update selectedParam state if we are currently looking at details for it
      if (selectedParam && selectedParam.name === editingParam.name) {
        setSelectedParam(param);
      }
    } else {
      await addParameter(param);
    }
    setShowParamModal(false);
  };

  // --- Test Result Callbacks ---
  const handleOpenAddResult = (param: TestParameter) => {
    setTargetParamForNewTest(param);
    setEditingTest(null);
    setShowTestModal(true);
  };

  const handleOpenEditResult = (result: TestResult) => {
    const param = parameters.find(p => p.name === result.parameter) || null;
    setTargetParamForNewTest(param);
    setEditingTest(result);
    setShowTestModal(true);
  };

  const handleSaveResult = async (result: TestResult) => {
    if (editingTest) {
      await updateResult(editingTest.id, result);
    } else {
      await addResult(result);
    }
    setShowTestModal(false);
  };

  const handleImportSuccess = (importedParams: TestParameter[], importedResults: TestResult[]) => {
    replaceAll(importedParams, importedResults);
  };

  // --- Import from code callback ---
  const handleImportFromCode = async (param: TestParameter, codeResults: TestResult[]) => {
    // Check if parameter already exists
    const existing = parameters.find(p => p.name === param.name);
    if (!existing) {
      await addParameter(param);
    }
    // Use bulk insert to avoid stale closure issue
    await addResults(codeResults);
  };

  const handleSaveFromScan = async (items: { param: TestParameter; result: TestResult }[]) => {
    const resultsToAdd: TestResult[] = [];
    for (const item of items) {
      const existing = parameters.find(p => p.name.toLowerCase() === item.param.name.toLowerCase());
      if (!existing) {
        await addParameter(item.param);
      }
      resultsToAdd.push(item.result);
    }
    if (resultsToAdd.length > 0) {
      await addResults(resultsToAdd);
    }
    setShowImageScanModal(false);
  };


  const topPadding = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 8 : Math.max(insets.top, 12);
  const bottomPadding = Math.max(insets.bottom, 12);

  return (
    <View style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}>
      <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
      
      <View style={{ flex: 1 }}>
        {screen === 'settings' ? (
          <SettingsView
            parameters={parameters}
            results={results}
            onBack={() => setScreen('dashboard')}
            onImportSuccess={handleImportSuccess}
            accentColor={accentColor}
            setAccentColor={handleSetAccentColor}
            themeMode={themeMode}
            setThemeMode={handleSetThemeMode}
            fontMode={fontMode}
            setFontMode={handleSetFontMode}
          />
        ) : screen === 'dashboard' ? (
          <DashboardView
            parameters={parameters}
            results={results}
            loading={loading}
            testSearch={testSearch}
            setTestSearch={setTestSearch}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            tagFilter={tagFilter}
            setTagFilter={setTagFilter}
            onAddParameter={handleOpenAddParam}
            onEditParameter={handleOpenEditParam}
            onDeleteParameter={deleteParameter}
            onAddResult={handleOpenAddResult}
            onSelectParam={(param) => {
              setSelectedParam(param);
              setScreen('detail');
            }}
            getResultsForParam={getResultsForParam}
            getLatestResult={getLatestResult}
            onOpenSettings={() => setScreen('settings')}
            onOpenImportCode={() => setShowImportCodeModal(true)}
            onOpenImageScan={() => setShowImageScanModal(true)}
            onOpenReportModal={() => setShowReportModal(true)}
            accentColor={accentColor}
            onReorderParameter={reorderParameters}
            isCompact={isCompact}
            setIsCompact={handleSetIsCompact}
            fontMode={fontMode}
          />
        ) : (
          selectedParam && (
            <ParameterDetailView
              selectedParam={selectedParam}
              tests={results}
              parameters={parameters}
              filteredParams={parameters.filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(testSearch.toLowerCase()) || 
                                      p.category.toLowerCase().includes(testSearch.toLowerCase());
                const matchesCategory = categoryFilter === 'Wszystkie' || p.category === categoryFilter;
                return matchesSearch && matchesCategory;
              })}
              onBack={() => {
                setSelectedParam(null);
                setScreen('dashboard');
              }}
              onEditParam={() => handleOpenEditParam(selectedParam)}
              onAddResult={() => handleOpenAddResult(selectedParam)}
              onEditResult={handleOpenEditResult}
              onDeleteResult={deleteResult}
              setSelectedParam={setSelectedParam}
              onSharePress={() => setShowQRModal(true)}
              accentColor={accentColor}
              fontMode={fontMode}
            />
          )
        )}
      </View>

      {/* Parameter Add/Edit Modal */}
      <ParameterModal
        visible={showParamModal}
        editingParam={editingParam}
        existingNames={parameters.map(p => p.name)}
        onSave={handleSaveParam}
        onClose={() => setShowParamModal(false)}
        accentColor={accentColor}
      />

      {/* Test Result Add/Edit Modal */}
      <TestResultModal
        visible={showTestModal}
        editingResult={editingTest}
        targetParameter={targetParamForNewTest}
        onSave={handleSaveResult}
        onClose={() => setShowTestModal(false)}
        accentColor={accentColor}
      />

      {/* Import from Text Code Modal */}
      <ImportCodeModal
        visible={showImportCodeModal}
        onImport={handleImportFromCode}
        onClose={() => setShowImportCodeModal(false)}
        accentColor={accentColor}
      />

      {/* QR / Text Code Share Modal */}
      {selectedParam && (
        <QRModal
          visible={showQRModal}
          parameter={selectedParam}
          results={results}
          onClose={() => setShowQRModal(false)}
          accentColor={accentColor}
        />
      )}

      {/* Image scanning/extracting Modal */}
      <ImageScanModal
        visible={showImageScanModal}
        existingParameters={parameters}
        onSave={handleSaveFromScan}
        onClose={() => setShowImageScanModal(false)}
        accentColor={accentColor}
      />

      {/* Medical PDF Report Modal */}
      <ReportModal
        visible={showReportModal}
        parameters={parameters}
        results={results}
        onClose={() => setShowReportModal(false)}
        accentColor={accentColor}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainAppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bgApp,
  },
});
