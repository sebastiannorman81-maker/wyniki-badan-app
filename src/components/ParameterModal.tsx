import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { theme } from '../utils/theme';
import { TestParameter, CATEGORIES, CATEGORY_ICONS } from '../types';

interface Props {
  visible: boolean;
  editingParam: TestParameter | null;
  existingNames: string[];
  onSave: (param: TestParameter) => void;
  onClose: () => void;
  accentColor: string;
}

export default function ParameterModal({ visible, editingParam, existingNames, onSave, onClose, accentColor }: Props) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [refRange, setRefRange] = useState('');
  const [category, setCategory] = useState<string>('Krew');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (editingParam) {
      setName(editingParam.name);
      setUnit(editingParam.unit);
      setRefRange(editingParam.referenceRange);
      setCategory(editingParam.category);
      setTags(editingParam.tags?.join(', ') || '');
    } else {
      setName('');
      setUnit('');
      setRefRange('');
      setCategory('Krew');
      setTags('');
    }
  }, [editingParam, visible]);

  const handleSave = () => {
    if (!name.trim() || !unit.trim()) return;

    // Check duplicate (only for new params or renamed params)
    if (!editingParam || editingParam.name !== name.trim()) {
      if (existingNames.some(n => n.toLowerCase() === name.trim().toLowerCase())) {
        return; // duplicate
      }
    }

    const tagsArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onSave({
      name: name.trim(),
      unit: unit.trim(),
      referenceRange: refRange.trim() || 'Brak normy',
      category,
      tags: tagsArray,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={[styles.title, { color: accentColor }]}>
            {editingParam ? '✏️ Edytuj Wskaźnik' : '🧪 Dodaj Nowy Wskaźnik'}
          </Text>

          <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 12 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Name */}
            <Text style={styles.label}>Nazwa Wskaźnika / Badania:</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="np. TSH, Żelazo, Glukoza..."
              placeholderTextColor={theme.textMuted}
            />

            {/* Unit + Category */}
            <View style={{ flexDirection: 'row', gap: theme.spaceSm }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Jednostka:</Text>
                <TextInput
                  style={styles.input}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="np. mIU/l, mg/dl..."
                  placeholderTextColor={theme.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Kategoria:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {CATEGORIES.map(cat => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[
                          styles.catBtn,
                          category === cat && { borderColor: accentColor + '60', backgroundColor: accentColor + '15' },
                        ]}
                      >
                        <Text style={[
                          styles.catBtnText,
                          category === cat && { color: accentColor },
                        ]}>
                          {CATEGORY_ICONS[cat]} {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            {/* Reference range */}
            <Text style={styles.label}>Przedział Referencyjny (Norma):</Text>
            <TextInput
              style={styles.input}
              value={refRange}
              onChangeText={setRefRange}
              placeholder="np. 0.27 - 4.2 lub < 190"
              placeholderTextColor={theme.textMuted}
            />

            {/* Tags */}
            <Text style={styles.label}>Tagi (oddzielone przecinkami):</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="np. tarczyca, krew, hormony..."
              placeholderTextColor={theme.textMuted}
            />
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Anuluj</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: accentColor }, (!name.trim() || !unit.trim()) && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={!name.trim() || !unit.trim()}
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
    maxWidth: 440,
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
    maxHeight: 460,
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
  catBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.borderColor,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  catBtnActive: {
    borderColor: theme.accentPrimary + '60',
    backgroundColor: theme.accentPrimary + '15',
  },
  catBtnText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  catBtnTextActive: {
    color: theme.accentPrimary,
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
