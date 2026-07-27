import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../utils/theme';

interface Props {
  onAddPress: () => void;
  accentColor: string;
}

export default function EmptyState({ onAddPress, accentColor }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔬</Text>
      <Text style={styles.title}>Brak wskaźników badań</Text>
      <Text style={styles.subtitle}>
        Zdefiniuj swój pierwszy wskaźnik laboratoryjny (np. TSH, Cholesterol), aby zacząć śledzić wyniki i analizować trendy na wykresach.
      </Text>
      <TouchableOpacity style={[styles.btn, { backgroundColor: accentColor }]} onPress={onAddPress} activeOpacity={0.8}>
        <Text style={styles.btnText}>＋ Dodaj Pierwszy Wskaźnik</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spaceXl,
    marginVertical: 40,
    gap: theme.spaceMd,
  },
  icon: {
    fontSize: 64,
    opacity: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  btn: {
    backgroundColor: theme.accentPrimary,
    paddingHorizontal: theme.spaceXl,
    paddingVertical: theme.spaceMd,
    borderRadius: theme.radiusMd,
    marginTop: theme.spaceSm,
    ...theme.shadowMd,
  },
  btnText: {
    color: theme.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
});
