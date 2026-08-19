import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { theme } from '../utils/theme';
import { TestParameter, TestResult } from '../types';

interface Props {
  visible: boolean;
  editingResult: TestResult | null;
  targetParameter: TestParameter | null;
  onSave: (result: TestResult) => void;
  onClose: () => void;
  accentColor: string;
}

export default function TestResultModal({ visible, editingResult, targetParameter, onSave, onClose, accentColor }: Props) {
  const [date, setDate] = useState('');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingResult) {
      setDate(editingResult.date);
      setValue(editingResult.value.toString());
      setNotes(editingResult.notes);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setValue('');
      setNotes('');
    }
  }, [editingResult, visible]);

  const handleSave = () => {
    const valNum = parseFloat(value.replace(',', '.'));
    if (isNaN(valNum) || !date.trim()) return;

    if (!targetParameter && !editingResult) return;

    onSave({
      id: editingResult ? editingResult.id : `test_${Math.floor(Date.now() / 1000)}`,
      date: date.trim(),
      parameter: editingResult ? editingResult.parameter : targetParameter!.name,
      value: valNum,
      unit: editingResult ? editingResult.unit : targetParameter!.unit,
      referenceRange: editingResult ? editingResult.referenceRange : targetParameter!.referenceRange,
      category: editingResult ? editingResult.category : targetParameter!.category,
      notes: notes.trim(),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={[styles.title, { color: accentColor }]}>
            {editingResult ? '🧪 Edytuj Wynik' : '🧪 Dodaj Wynik'}
          </Text>

          {targetParameter && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Badanie</Text>
              <Text style={styles.infoName}>
                {targetParameter.name}{' '}
                <Text style={{ fontSize: 13, fontWeight: '400', color: theme.textSecondary }}>
                  ({targetParameter.unit})
                </Text>
              </Text>
            </View>
          )}

          <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 12 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Date */}
            <Text style={styles.label}>Data Badania (RRRR-MM-DD):</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="np. 2026-07-01"
              placeholderTextColor={theme.textMuted}
            />

            {/* Value */}
            <Text style={styles.label}>Wynik:</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              placeholder="np. 4.25"
              placeholderTextColor={theme.textMuted}
            />

            {/* Notes */}
            <Text style={styles.label}>Uwagi / Notatki:</Text>
            <TextInput
              style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="np. Na czczo, po treningu..."
              placeholderTextColor={theme.textMuted}
            />
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Anuluj</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: accentColor }, (!value.trim() || !date.trim()) && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={!value.trim() || !date.trim()}
            >
              <Text style={styles.saveText}>Zapisz</Text>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spaceMd,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: theme.bgSurface,
    borderRadius: theme.radiusMd,
    borderWidth: 1,
    borderColor: theme.borderColor,
    padding: theme.spaceLg,
    gap: theme.spaceSm,
    ...theme.shadowLg,
  },
  scrollArea: {
    maxHeight: 380,
    flexGrow: 0,
    flexShrink: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.accentPrimary,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
    paddingBottom: theme.spaceSm,
  },
  infoBox: {
    padding: theme.spaceSm,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.borderColor,
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  infoName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textPrimary,
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: theme.spaceSm,
    marginBottom: 2,
  },
  input: {
    padding: theme.spaceSm,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.borderColor,
    backgroundColor: 'rgba(255,255,255,0.03)',
    color: theme.textPrimary,
    fontSize: 15,
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
  saveBtn: {
    paddingHorizontal: theme.spaceXl,
    paddingVertical: theme.spaceSm,
    borderRadius: theme.radiusSm,
    backgroundColor: theme.accentPrimary,
  },
  saveText: {
    color: theme.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
});
