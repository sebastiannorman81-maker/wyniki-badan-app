import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView
} from 'react-native';
import { theme } from '../utils/theme';
import { deserializeIndicator } from '../utils/qrSerializer';
import { TestParameter, TestResult } from '../types';

interface Props {
  visible: boolean;
  onImport: (param: TestParameter, results: TestResult[]) => void;
  onClose: () => void;
  accentColor: string;
}

export default function ImportCodeModal({ visible, onImport, onClose, accentColor }: Props) {
  const [code, setCode] = useState('');

  const handleImport = () => {
    if (!code.trim()) return;

    try {
      const { param, results } = deserializeIndicator(code);
      onImport(param, results);
      setCode('');
      onClose();
      if (Platform.OS === 'web') {
        alert(`Pomyślnie zaimportowano wskaźnik "${param.name}" oraz ${results.length} pomiarów.`);
      } else {
        Alert.alert('Sukces', `Pomyślnie zaimportowano wskaźnik "${param.name}" oraz ${results.length} pomiarów.`);
      }
    } catch (err: any) {
      if (Platform.OS === 'web') {
        alert(err.message || 'Niepoprawny kod wskaźnika.');
      } else {
        Alert.alert('Błąd importu', err.message || 'Niepoprawny kod wskaźnika.');
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={[styles.title, { color: accentColor }]}>📥 Importuj z kodu wskaźnika</Text>
          <Text style={styles.info}>
            Wklej wygenerowany wcześniej kod tekstowy wskaźnika, aby automatycznie dodać go wraz z jego całą historią wyników.
          </Text>

          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Wklej kod tutaj..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={4}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Anuluj</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.importBtn, { backgroundColor: accentColor }, !code.trim() && { opacity: 0.5 }]}
              onPress={handleImport}
              disabled={!code.trim()}
            >
              <Text style={styles.importText}>Importuj</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spaceLg,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.bgSurface,
    borderRadius: theme.radiusMd,
    borderWidth: 1,
    borderColor: theme.borderColor,
    padding: theme.spaceLg,
    gap: theme.spaceSm,
    ...theme.shadowLg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.accentPrimary,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
    paddingBottom: theme.spaceSm,
  },
  info: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
    marginVertical: 4,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: theme.radiusSm,
    padding: theme.spaceSm,
    color: theme.textPrimary,
    fontSize: 13,
    fontFamily: 'monospace',
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spaceSm,
    justifyContent: 'flex-end',
    marginTop: theme.spaceMd,
  },
  cancelBtn: {
    paddingHorizontal: theme.spaceLg,
    paddingVertical: theme.spaceSm,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  cancelText: {
    color: theme.textPrimary,
    fontSize: 14,
  },
  importBtn: {
    paddingHorizontal: theme.spaceXl,
    paddingVertical: theme.spaceSm,
    borderRadius: theme.radiusSm,
    backgroundColor: theme.accentPrimary,
  },
  importText: {
    color: theme.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
