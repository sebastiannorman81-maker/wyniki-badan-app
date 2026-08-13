import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform
} from 'react-native';
import { theme, ThemeMode, FontMode } from '../utils/theme';
import { TestParameter, TestResult } from '../types';
import { exportData, importData } from '../utils/storage';
import { ArrowLeft, Export, Import } from './Icons';

interface Props {
  parameters: TestParameter[];
  results: TestResult[];
  onBack: () => void;
  onImportSuccess: (params: TestParameter[], results: TestResult[]) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  fontMode: FontMode;
  setFontMode: (mode: FontMode) => void;
}

export const ACCENT_COLORS = [
  { name: 'Neon Zielony', color: '#00ff66' },
  { name: 'Fioletowy', color: '#7c6cf0' },
  { name: 'Morski', color: '#00b894' },
  { name: 'Koralowy', color: '#ff7675' },
  { name: 'Bursztynowy', color: '#ffb74d' },
  { name: 'Niebieski', color: '#0984e3' },
];

export default function SettingsView({
  parameters,
  results,
  onBack,
  onImportSuccess,
  accentColor,
  setAccentColor,
  themeMode,
  setThemeMode,
  fontMode,
  setFontMode,
}: Props) {

  const handleExport = async () => {
    const success = await exportData(parameters, results);
    if (success) {
      if (Platform.OS === 'web') {
        alert('Pełna kopia zapasowa została pomyślnie wyeksportowana.');
      } else {
        Alert.alert('Sukces', 'Pełna kopia zapasowa została pomyślnie wyeksportowana.');
      }
    } else {
      if (Platform.OS === 'web') {
        alert('Nie udało się wyeksportować kopii zapasowej.');
      } else {
        Alert.alert('Błąd', 'Nie udało się wyeksportować kopii zapasowej.');
      }
    }
  };

  const handleImport = async () => {
    if (Platform.OS === 'web') {
      const confirmImport = window.confirm('Import zastąpi WSZYSTKIE obecne dane w aplikacji. Czy chcesz kontynuować?');
      if (confirmImport) {
        const imported = await importData();
        if (imported) {
          onImportSuccess(imported.params, imported.results);
          alert('Dane zostały pomyślnie zaimportowane.');
        }
      }
    } else {
      Alert.alert(
        'Potwierdzenie importu',
        'Import zastąpi WSZYSTKIE obecne dane w aplikacji. Czy chcesz kontynuować?',
        [
          { text: 'Anuluj', style: 'cancel' },
          {
            text: 'Importuj',
            onPress: async () => {
              const imported = await importData();
              if (imported) {
                onImportSuccess(imported.params, imported.results);
                Alert.alert('Sukces', 'Dane zostały pomyślnie zaimportowane.');
              }
            }
          }
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft color={theme.textPrimary} size={16} />
          <Text style={{ fontSize: 16, color: theme.textPrimary, fontWeight: '600', marginLeft: 6 }}>Pulpit</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ustawienia</Text>
        <View style={{ width: 80 }} />
      </View>

      {/* Theme selection */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Motyw aplikacji</Text>
        <Text style={styles.sectionDesc}>Wybierz jasny, ciemny lub systemowy schemat kolorów:</Text>
        
        <View style={styles.optionsRow}>
          {[
            { label: 'Jasny', value: 'light' as const },
            { label: 'Ciemny', value: 'dark' as const },
            { label: 'Systemowy', value: 'system' as const }
          ].map(opt => {
            const isSelected = themeMode === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionBtn,
                  isSelected && { backgroundColor: accentColor + '20', borderColor: accentColor }
                ]}
                onPress={() => setThemeMode(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, isSelected && { color: accentColor, fontWeight: '700' }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Font selection */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Krój czcionki</Text>
        <Text style={styles.sectionDesc}>Wybierz preferowaną czcionkę tekstu w aplikacji:</Text>
        
        <View style={styles.optionsRow}>
          {[
            { label: 'Standardowa (Inter)', value: 'standard' as const },
            { label: 'Odręczna (Kalam)', value: 'handwriting' as const }
          ].map(opt => {
            const isSelected = fontMode === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionBtn,
                  styles.optionBtnWide,
                  isSelected && { backgroundColor: accentColor + '15', borderColor: accentColor }
                ]}
                onPress={() => setFontMode(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, isSelected && { color: accentColor, fontWeight: '700' }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Color customization */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Kolor akcentu</Text>
        <Text style={styles.sectionDesc}>Wybierz kolor przewodnika dla przycisków i zaznaczeń:</Text>
        
        <View style={styles.colorRow}>
          {ACCENT_COLORS.map(c => {
            const isSelected = accentColor === c.color;
            return (
              <TouchableOpacity
                key={c.color}
                onPress={() => setAccentColor(c.color)}
                style={[
                  styles.colorOption,
                  { backgroundColor: c.color },
                  isSelected && styles.colorOptionSelected,
                ]}
                activeOpacity={0.8}
              >
                {isSelected && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Backup and Restore */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Kopia Zapasowa (JSON)</Text>
        <Text style={styles.sectionDesc}>
          Umożliwia przeniesienie lub zabezpieczenie Twoich wskaźników i wyników badań. Cała kopia zapisywana jest lokalnie na Twoim dysku.
        </Text>

        <View style={styles.backupActions}>
          <TouchableOpacity style={[styles.backupBtn, { borderColor: accentColor }]} onPress={handleExport} activeOpacity={0.7}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Export color={accentColor} size={15} />
              <Text style={[styles.backupBtnText, { color: accentColor }]}>Utwórz kopię zapasową</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.backupBtn, { backgroundColor: 'rgba(255,255,255,0.03)' }]} onPress={handleImport} activeOpacity={0.7}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Import color={theme.textPrimary} size={15} />
              <Text style={[styles.backupBtnText, { color: theme.textPrimary }]}>Przywróć z pliku JSON</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.infoCard}>
        <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 18 }}>
          Aplikacja Wyniki Badań v1.1.0{'\n'}
          100% offline — wszystkie dane pozostają na Twoim urządzeniu.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spaceMd,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: theme.spaceMd,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radiusSm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  card: {
    backgroundColor: theme.bgSurface,
    borderRadius: theme.radiusMd,
    borderWidth: 1,
    borderColor: theme.borderColor,
    padding: theme.spaceMd,
    marginBottom: theme.spaceMd,
    ...theme.shadowSm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spaceMd,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#ffffff',
    transform: [{ scale: 1.1 }],
  },
  checkMark: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  optionBtn: {
    flex: 1,
    minWidth: 90,
    paddingVertical: 10,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  optionBtnWide: {
    minWidth: 140,
  },
  optionText: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  backupActions: {
    gap: theme.spaceSm,
    marginTop: 4,
  },
  backupBtn: {
    paddingVertical: 12,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.borderColor,
    alignItems: 'center',
  },
  backupBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoCard: {
    marginTop: theme.spaceLg,
    padding: theme.spaceMd,
  },
});
