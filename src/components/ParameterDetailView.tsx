import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Platform, Animated
} from 'react-native';
import { theme, getHandwritingFontFamily, getHandwrittenTextStyle, FontMode } from '../utils/theme';
import { TestParameter, TestResult, CATEGORY_COLORS } from '../types';
import TestChart from './TestChart';
import { checkRangeStatus, getStatusInfo } from '../utils/rangeParser';
import { ArrowLeft, ArrowUp, ArrowDown, Pencil, Trash, Plus, Share, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from './Icons';

interface Props {
  selectedParam: TestParameter;
  tests: TestResult[];
  parameters: TestParameter[];
  filteredParams: TestParameter[];
  onBack: () => void;
  onEditParam: () => void;
  onAddResult: () => void;
  onEditResult: (result: TestResult) => void;
  onDeleteResult: (id: string) => void;
  setSelectedParam: (param: TestParameter) => void;
  onSharePress: () => void;
  accentColor: string;
  fontMode?: FontMode;
}

export default function ParameterDetailView({
  selectedParam,
  tests,
  parameters,
  filteredParams,
  onBack,
  onEditParam,
  onAddResult,
  onEditResult,
  onDeleteResult,
  setSelectedParam,
  onSharePress,
  accentColor,
  fontMode,
}: Props) {
  const [testStartDate, setTestStartDate] = useState('');
  const [testEndDate, setTestEndDate] = useState('');
  const [comparedParamNames, setComparedParamNames] = useState<string[]>([]);
  const [activeQuickRange, setActiveQuickRange] = useState<string | null>(null);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(true);
  // Page transition animation values for entire ParameterDetailView sheet
  const pageFadeAnim = React.useRef(new Animated.Value(0)).current;
  const pageSlideAnim = React.useRef(new Animated.Value(45)).current;
  const pageScaleAnim = React.useRef(new Animated.Value(0.96)).current;

  const runPageEntrance = () => {
    pageFadeAnim.setValue(0);
    pageSlideAnim.setValue(45);
    pageScaleAnim.setValue(0.96);

    Animated.parallel([
      Animated.timing(pageFadeAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(pageSlideAnim, {
        toValue: 0,
        duration: 380,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(pageScaleAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  React.useEffect(() => {
    runPageEntrance();
  }, [selectedParam.name]);

  const handleBackWithAnimation = () => {
    Animated.parallel([
      Animated.timing(pageFadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(pageSlideAnim, {
        toValue: 45,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      onBack();
    });
  };

  const applyQuickRange = (rangeKey: string, months: number | null) => {
    setActiveQuickRange(rangeKey);
    if (months === null) {
      setTestStartDate('');
      setTestEndDate('');
      return;
    }
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    const dateString = d.toISOString().split('T')[0];
    setTestStartDate(dateString);
    setTestEndDate('');
  };

  // Navigation: Next / Prev Parameter
  const handlePrevParam = () => {
    const idx = filteredParams.findIndex(p => p.name === selectedParam.name);
    if (idx !== -1 && filteredParams.length > 1) {
      const prev = filteredParams[(idx - 1 + filteredParams.length) % filteredParams.length];
      setSelectedParam(prev);
    }
  };

  const handleNextParam = () => {
    const idx = filteredParams.findIndex(p => p.name === selectedParam.name);
    if (idx !== -1 && filteredParams.length > 1) {
      const next = filteredParams[(idx + 1) % filteredParams.length];
      setSelectedParam(next);
    }
  };

  // Filtered results for list and summary
  const paramResults = tests
    .filter(t => t.parameter === selectedParam.name)
    .filter(t => {
      if (testStartDate && t.date < testStartDate) return false;
      if (testEndDate && t.date > testEndDate) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const catColor = CATEGORY_COLORS[selectedParam.category] || '#b2bec3';

  return (
    <Animated.View
      style={[
        styles.root,
        {
          opacity: pageFadeAnim,
          transform: [
            { translateX: pageSlideAnim },
            { scale: pageScaleAnim },
          ],
        },
      ]}
    >
      {/* Back & Title Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackWithAnimation} style={styles.backBtn} activeOpacity={0.7}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ArrowLeft color={theme.textPrimary} size={15} />
            <Text style={{ fontSize: 16, color: theme.textPrimary, fontWeight: '600' }}>Lista</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.titleNav}>
          <TouchableOpacity
            onPress={handlePrevParam}
            disabled={filteredParams.length <= 1}
            style={[styles.navBtn, filteredParams.length <= 1 && { opacity: 0.3 }]}
          >
            <ChevronLeft color={theme.textSecondary} size={16} />
          </TouchableOpacity>

          <Text style={[styles.title, getHandwrittenTextStyle(fontMode, true)]} numberOfLines={1}>{selectedParam.name}</Text>

          <TouchableOpacity
            onPress={handleNextParam}
            disabled={filteredParams.length <= 1}
            style={[styles.navBtn, filteredParams.length <= 1 && { opacity: 0.3 }]}
          >
            <ChevronRight color={theme.textSecondary} size={16} />
          </TouchableOpacity>
        </View>

        <View style={[styles.catBadge, { backgroundColor: catColor + '20' }]}>
          <Text style={{ color: catColor, fontSize: 11, fontWeight: '700' }}>{selectedParam.category}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Unified Single Paper Sheet Document Container */}
        <View style={[styles.mainPaperSheet, { borderLeftColor: accentColor }]}>
          {/* Section 1: Parameter Info & Main Action Buttons */}
          <View style={styles.sheetSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jednostka: <Text style={styles.infoVal}>{selectedParam.unit}</Text></Text>
              <Text style={styles.infoLabel}>Norma referencyjna: <Text style={styles.infoVal}>{selectedParam.referenceRange}</Text></Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.editBtn} onPress={onEditParam}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Pencil color={theme.textPrimary} size={12} />
                  <Text style={styles.editBtnText}>Edytuj</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.editBtn, { marginHorizontal: 4 }]} onPress={onSharePress}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Share color={theme.textPrimary} size={12} />
                  <Text style={styles.editBtnText}>QR/Kod</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addValBtn, { backgroundColor: accentColor }]} onPress={onAddResult}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Plus color={theme.textInverse} size={13} />
                  <Text style={styles.addValBtnText}>Wynik</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dashed Paper Line Divider */}
          <View style={styles.paperLineDivider} />

          {/* Section 2: Date filters & Comparison */}
          <View style={styles.sheetSection}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              onPress={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.sectionTitle}>Filtry i Porównanie</Text>
                {(testStartDate || testEndDate || comparedParamNames.length > 0 || activeQuickRange) ? (
                  <View style={{ backgroundColor: accentColor + '20', borderWidth: 1, borderColor: accentColor + '40', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 12 }}>
                    <Text style={{ color: accentColor, fontSize: 10, fontWeight: '800' }}>
                      {[
                        activeQuickRange ? activeQuickRange.toUpperCase() : null,
                        comparedParamNames.length > 0 ? `+${comparedParamNames.length}` : null
                      ].filter(Boolean).join(' • ')}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={{ padding: 4, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)' }}>
                {isFiltersCollapsed ? (
                  <ChevronDown color={accentColor} size={16} />
                ) : (
                  <ChevronUp color={theme.textSecondary} size={16} />
                )}
              </View>
            </TouchableOpacity>
            
            {!isFiltersCollapsed && (
              <View style={{ marginTop: 12 }}>
                {/* Quick range selector buttons */}
                <Text style={styles.dateLabel}>Szybki zakres:</Text>
                <View style={styles.quickRangeRow}>
                  {[
                    { label: '1M', key: '1m', months: 1 },
                    { label: '3M', key: '3m', months: 3 },
                    { label: '6M', key: '6m', months: 6 },
                    { label: '1 Rok', key: '1y', months: 12 },
                    { label: '3 Lata', key: '3y', months: 36 },
                    { label: 'Wszystko', key: 'all', months: null },
                  ].map((item) => {
                    const isActive = activeQuickRange === item.key;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        onPress={() => applyQuickRange(item.key, item.months)}
                        style={[
                          styles.quickRangeBtn,
                          isActive && { backgroundColor: accentColor + '20', borderColor: accentColor + '50' },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.quickRangeText,
                          isActive && { color: accentColor, fontWeight: '700' },
                        ]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Date pickers */}
                <View style={styles.dateRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dateLabel}>Od:</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={testStartDate}
                      onChangeText={(text) => {
                        setTestStartDate(text);
                        setActiveQuickRange(null);
                      }}
                      placeholder="RRRR-MM-DD"
                      placeholderTextColor={theme.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dateLabel}>Do:</Text>
                    <TextInput
                      style={styles.dateInput}
                      value={testEndDate}
                      onChangeText={(text) => {
                        setTestEndDate(text);
                        setActiveQuickRange(null);
                      }}
                      placeholder="RRRR-MM-DD"
                      placeholderTextColor={theme.textMuted}
                    />
                  </View>
                  {(testStartDate || testEndDate) ? (
                    <TouchableOpacity
                      onPress={() => {
                        setTestStartDate('');
                        setTestEndDate('');
                        setActiveQuickRange(null);
                      }}
                      style={styles.resetDateBtn}
                    >
                      <Text style={{ color: '#ff7675', fontSize: 12, fontWeight: '700' }}>Reset</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Compare Checkboxes */}
                <Text style={[styles.dateLabel, { marginTop: 12 }]}>Porównaj z innymi wskaźnikami:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                  <View style={styles.compareWrapper}>
                    {parameters
                      .filter(p => p.name !== selectedParam.name)
                      .map(p => {
                        const isChecked = comparedParamNames.includes(p.name);
                        return (
                          <TouchableOpacity
                            key={p.name}
                            onPress={() => {
                              if (isChecked) {
                                setComparedParamNames(comparedParamNames.filter(n => n !== p.name));
                              } else {
                                if (comparedParamNames.length >= 4) {
                                  if (Platform.OS === 'web') {
                                    alert('Możesz porównać maksymalnie 5 wskaźników jednocześnie.');
                                  } else {
                                    Alert.alert('Limit', 'Możesz porównać maksymalnie 5 wskaźników jednocześnie.');
                                  }
                                  return;
                                }
                                setComparedParamNames([...comparedParamNames, p.name]);
                              }
                            }}
                            style={[
                              styles.compareChip,
                              isChecked && { backgroundColor: accentColor + '20', borderColor: accentColor + '40' },
                            ]}
                          >
                            <Text style={[
                              styles.compareChipText,
                              isChecked && { color: accentColor, fontWeight: '700' },
                            ]}>
                              {isChecked ? '✓ ' : ''}{p.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>

          {/* Dashed Paper Line Divider */}
          <View style={styles.paperLineDivider} />

          {/* Section 3: Chart Section */}
          <View style={styles.sheetSection}>
            <Text style={styles.sectionTitle}>📈 Zmiany w czasie</Text>
            <TestChart
              mainParam={selectedParam}
              tests={tests}
              comparedParamNames={comparedParamNames}
              parameters={parameters}
              startDate={testStartDate}
              endDate={testEndDate}
              selectedResultId={selectedResultId}
              onSelectResult={(id) => setSelectedResultId(id)}
              accentColor={accentColor}
            />
          </View>

          {/* Dashed Paper Line Divider */}
          <View style={styles.paperLineDivider} />

          {/* Section 4: Results History */}
          <View style={styles.sheetSection}>
            <Text style={styles.sectionTitle}>Historia pomiarów ({paramResults.length})</Text>

            {paramResults.length === 0 ? (
              <Text style={styles.noHistory}>Brak wpisanych wyników w wybranym przedziale dat.</Text>
            ) : (
              paramResults.map((t, idx) => {
                const status = checkRangeStatus(t.value, selectedParam.referenceRange);
                const badge = getStatusInfo(status);
                const isSelected = selectedResultId === t.id;

                const prevResult = idx < paramResults.length - 1 ? paramResults[idx + 1] : null;
                let trendIcon: React.ReactNode = null;
                let trendText = '';
                let trendColor: string = theme.textMuted;

                if (prevResult) {
                  const diff = t.value - prevResult.value;
                  const pct = prevResult.value !== 0 ? Math.abs((diff / prevResult.value) * 100) : 0;
                  const threshold = 0.5;

                  if (pct < threshold) {
                    trendIcon = <Text style={{ fontSize: 10, color: theme.textMuted }}>＝</Text>;
                    trendText = 'bez zmian';
                    trendColor = theme.textMuted;
                  } else if (diff > 0) {
                    trendIcon = <TrendingUp color="#ff7675" size={12} />;
                    trendText = `+${pct.toFixed(1)}%`;
                    trendColor = '#ff7675';
                  } else {
                    trendIcon = <TrendingDown color="#55efc4" size={12} />;
                    trendText = `−${pct.toFixed(1)}%`;
                    trendColor = '#55efc4';
                  }
                }

                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setSelectedResultId(isSelected ? null : t.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.historyItem,
                      isSelected && {
                        backgroundColor: accentColor + '15',
                        borderColor: accentColor,
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        marginVertical: 4,
                      }
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.historyDate}>{t.date}</Text>
                        <View style={[styles.statusItemBadge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.statusItemText, { color: badge.text }]}>{badge.label}</Text>
                        </View>
                        {isSelected && (
                          <View style={{ backgroundColor: accentColor, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                            <Text style={{ color: theme.textInverse, fontSize: 9, fontWeight: '800' }}>📍 Wybrany na wykresie</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                        <Text style={styles.historyValue}>{t.value} {selectedParam.unit}</Text>
                        {prevResult && (
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 5,
                            backgroundColor: trendColor + '22',
                            borderWidth: 1,
                            borderColor: trendColor + '50',
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 6,
                          }}>
                            {trendIcon}
                            <Text style={{ fontSize: 11, fontWeight: '800', color: trendColor }}>{trendText}</Text>
                          </View>
                        )}
                      </View>
                      {t.notes ? <Text style={styles.historyNotes}>{t.notes}</Text> : null}
                    </View>

                    <View style={styles.historyActions}>
                      <TouchableOpacity onPress={() => onEditResult(t)} style={styles.historyActionBtn}>
                        <Pencil color={theme.textSecondary} size={14} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => onDeleteResult(t.id)} style={styles.historyActionBtn}>
                        <Trash color="#ff7675" size={14} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: theme.spaceMd,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spaceMd,
    gap: 8,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radiusSm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  titleNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  navBtn: {
    padding: 6,
  },
  navBtnText: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.textPrimary,
    maxWidth: 120,
    textAlign: 'center',
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spaceMd,
    marginBottom: theme.spaceSm,
  },
  infoLabel: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  infoVal: {
    fontWeight: '700',
    color: theme.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spaceSm,
    borderTopWidth: 1,
    borderTopColor: theme.borderSubtle,
    paddingTop: theme.spaceSm,
    marginTop: theme.spaceXs,
  },
  editBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.borderColor,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  editBtnText: {
    color: theme.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  addValBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radiusSm,
    backgroundColor: theme.accentPrimary,
    alignItems: 'center',
  },
  addValBtnText: {
    color: theme.textInverse,
    fontWeight: '700',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: theme.spaceSm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spaceSm,
  },
  dateLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  dateInput: {
    padding: 8,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.borderColor,
    backgroundColor: 'rgba(255,255,255,0.02)',
    color: theme.textPrimary,
    fontSize: 13,
  },
  resetDateBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  compareWrapper: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  compareChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  compareChipActive: {
    backgroundColor: theme.accentPrimary + '20',
    borderColor: theme.accentPrimary + '40',
  },
  compareChipText: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  compareChipTextActive: {
    color: theme.accentPrimary,
    fontWeight: '700',
  },
  mainPaperSheet: {
    backgroundColor: theme.bgSurface,
    borderRadius: theme.radiusMd,
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderLeftWidth: 4,
    padding: theme.spaceMd,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  sheetSection: {
    paddingVertical: 4,
  },
  paperLineDivider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.08)',
    marginVertical: 14,
  },
  noHistory: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: theme.spaceLg,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spaceSm,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSubtle,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  statusItemBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
  },
  statusItemText: {
    fontSize: 10,
    fontWeight: '700',
  },
  historyValue: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.textPrimary,
    marginTop: 2,
  },
  historyNotes: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  historyActions: {
    flexDirection: 'row',
    gap: 4,
  },
  historyActionBtn: {
    padding: 8,
  },
  quickRangeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
    marginTop: 4,
  },
  quickRangeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radiusSm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  quickRangeBtnActive: {
    backgroundColor: theme.accentPrimary + '20',
    borderColor: theme.accentPrimary + '50',
  },
  quickRangeText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  quickRangeTextActive: {
    color: theme.accentPrimary,
    fontWeight: '700',
  },
});
