import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform
} from 'react-native';
import { theme, getHandwritingFontFamily, FontMode } from '../utils/theme';
import { TestParameter, TestResult, CATEGORIES, CATEGORY_ICONS } from '../types';
import ParameterCard from './ParameterCard';
import EmptyState from './EmptyState';
import { checkRangeStatus } from '../utils/rangeParser';
import { Import, Settings, Plus, Camera, ArrowLeft, CompactLayout, FileText } from './Icons';

type SortMode = 'custom' | 'name-az' | 'name-za' | 'category' | 'date-newest' | 'date-oldest' | 'status';

interface Props {
  parameters: TestParameter[];
  results: TestResult[];
  loading: boolean;
  testSearch: string;
  setTestSearch: (text: string) => void;
  categoryFilter: string;
  setCategoryFilter: (text: string) => void;
  tagFilter: string;
  setTagFilter: (text: string) => void;
  onAddParameter: () => void;
  onEditParameter: (param: TestParameter) => void;
  onDeleteParameter: (name: string) => void;
  onAddResult: (param: TestParameter) => void;
  onSelectParam: (param: TestParameter) => void;
  getResultsForParam: (name: string) => TestResult[];
  getLatestResult: (name: string) => TestResult | null;
  onOpenSettings: () => void;
  onOpenImportCode: () => void;
  onOpenImageScan: () => void;
  onOpenReportModal: () => void;
  accentColor: string;
  onReorderParameter: (fromIndex: number, toIndex: number) => void;
  isCompact: boolean;
  setIsCompact: (val: boolean) => void;
  fontMode?: FontMode;
}

export default function DashboardView({
  parameters,
  results,
  loading,
  testSearch,
  setTestSearch,
  categoryFilter,
  setCategoryFilter,
  tagFilter,
  setTagFilter,
  onAddParameter,
  onEditParameter,
  onDeleteParameter,
  onAddResult,
  onSelectParam,
  getResultsForParam,
  getLatestResult,
  onOpenSettings,
  onOpenImportCode,
  onOpenImageScan,
  onOpenReportModal,
  accentColor,
  onReorderParameter,
  isCompact,
  setIsCompact,
  fontMode,
}: Props) {

  const [sortMode, setSortMode] = useState<SortMode>('custom');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const latestTest = results.length > 0
    ? [...results].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  // Collect all unique tags
  const allTags: string[] = [];
  parameters.forEach(p => {
    p.tags?.forEach(t => {
      if (t && !allTags.includes(t)) allTags.push(t);
    });
  });

  // Filter parameters based on search, category, and tag
  let filteredParams = parameters.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(testSearch.toLowerCase()) || 
                          p.category.toLowerCase().includes(testSearch.toLowerCase()) ||
                          (p.tags && p.tags.some(t => t.toLowerCase().includes(testSearch.toLowerCase())));
    const matchesCategory = categoryFilter === 'Wszystkie' || p.category === categoryFilter;
    const matchesTag = !tagFilter || (p.tags && p.tags.includes(tagFilter));
    return matchesSearch && matchesCategory && matchesTag;
  });

  // Apply sorting
  if (sortMode !== 'custom') {
    filteredParams = [...filteredParams].sort((a, b) => {
      switch (sortMode) {
        case 'name-az':
          return a.name.localeCompare(b.name, 'pl');
        case 'name-za':
          return b.name.localeCompare(a.name, 'pl');
        case 'category':
          return a.category.localeCompare(b.category, 'pl') || a.name.localeCompare(b.name, 'pl');
        case 'date-newest': {
          const aDate = getLatestResult(a.name)?.date || '0000-00-00';
          const bDate = getLatestResult(b.name)?.date || '0000-00-00';
          return bDate.localeCompare(aDate);
        }
        case 'date-oldest': {
          const aDate = getLatestResult(a.name)?.date || '9999-99-99';
          const bDate = getLatestResult(b.name)?.date || '9999-99-99';
          return aDate.localeCompare(bDate);
        }
        case 'status': {
          const statusOrder = (name: string) => {
            const latest = getLatestResult(name);
            if (!latest) return 3;
            const s = checkRangeStatus(latest.value, a.referenceRange);
            if (s === 'high' || s === 'low') return 0;
            if (s === 'normal') return 1;
            return 2;
          };
          return statusOrder(a.name) - statusOrder(b.name);
        }
        default: return 0;
      }
    });
  }

  const SORT_OPTIONS: { label: string; value: SortMode }[] = [
    { label: '↕ Własna kolejność', value: 'custom' },
    { label: '🔤 Nazwa A→Z', value: 'name-az' },
    { label: '🔤 Nazwa Z→A', value: 'name-za' },
    { label: '📂 Kategoria', value: 'category' },
    { label: '📅 Najnowsze badanie', value: 'date-newest' },
    { label: '📅 Najstarsze badanie', value: 'date-oldest' },
    { label: '⚠️ Status (poza normą)', value: 'status' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={styles.loadingText}>Ładowanie apteczki offline...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Title and action buttons */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.title, { fontFamily: getHandwritingFontFamily(fontMode) }]}>Wyniki Badań</Text>
              <Text style={styles.subtitle}>Wskaźniki laboratoryjne offline</Text>
            </View>
            <TouchableOpacity onPress={onOpenSettings} style={[styles.backupBtn, { borderColor: accentColor, paddingHorizontal: 12, paddingVertical: 8 }]} activeOpacity={0.7}>
              <Settings color={accentColor} size={18} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.backupRow}>
            <TouchableOpacity onPress={onOpenReportModal} style={[styles.backupBtn, { flex: 1, justifyContent: 'center', borderColor: accentColor, backgroundColor: accentColor + '15' }]} activeOpacity={0.7}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <FileText color={accentColor} size={14} />
                <Text style={[styles.backupBtnText, { color: accentColor, fontWeight: '700' }]}>Raport PDF</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={onOpenImageScan} style={[styles.backupBtn, { flex: 1, justifyContent: 'center' }]} activeOpacity={0.7}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Camera color={theme.textPrimary} size={14} />
                <Text style={styles.backupBtnText}>Skanuj</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={onOpenImportCode} style={[styles.backupBtn, { flex: 1, justifyContent: 'center' }]} activeOpacity={0.7}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Import color={theme.textPrimary} size={14} />
                <Text style={styles.backupBtnText}>Z kodu</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>





        {/* Search & Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.searchInput, { flex: 1 }]}
              value={testSearch}
              onChangeText={setTestSearch}
              placeholder="Szukaj wskaźnika lub tagu..."
              placeholderTextColor={theme.textMuted}
            />
            <View style={{ position: 'relative', zIndex: 1000 }}>
              <TouchableOpacity
                style={[styles.sortBtn, showSortMenu && { borderColor: accentColor }]}
                onPress={() => setShowSortMenu(!showSortMenu)}
                activeOpacity={0.7}
              >
                <Text style={styles.sortBtnText}>⇅</Text>
              </TouchableOpacity>
              {showSortMenu && (
                <View style={styles.sortMenu}>
                  {SORT_OPTIONS.map(opt => {
                    const isActive = sortMode === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.sortMenuItem, isActive && { backgroundColor: accentColor + '15' }]}
                        onPress={() => { setSortMode(opt.value); setShowSortMenu(false); }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.sortMenuItemText, isActive && { color: accentColor, fontWeight: '700' }]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.sortBtn, isCompact && { borderColor: accentColor }]}
              onPress={() => setIsCompact(!isCompact)}
              activeOpacity={0.7}
            >
              <CompactLayout color={isCompact ? accentColor : theme.textPrimary} size={18} />
            </TouchableOpacity>
          </View>
          
          {/* Category Filter Horizontal List */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <View style={styles.categoryList}>
              <TouchableOpacity
                onPress={() => setCategoryFilter('Wszystkie')}
                style={[
                  styles.categoryChip,
                  categoryFilter === 'Wszystkie' && { backgroundColor: accentColor + '20', borderColor: accentColor + '50' }
                ]}
              >
                <Text style={[
                  styles.categoryChipText,
                  categoryFilter === 'Wszystkie' && { color: accentColor, fontWeight: '700' }
                ]}>
                  Wszystkie
                </Text>
              </TouchableOpacity>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategoryFilter(cat)}
                  style={[
                    styles.categoryChip,
                    categoryFilter === cat && { backgroundColor: accentColor + '20', borderColor: accentColor + '50' }
                  ]}
                >
                  <Text style={[
                    styles.categoryChipText,
                    categoryFilter === cat && { color: accentColor, fontWeight: '700' }
                  ]}>
                    {CATEGORY_ICONS[cat]} {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Tag Filter Horizontal List */}
          {allTags.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              <View style={styles.categoryList}>
                <TouchableOpacity
                  onPress={() => setTagFilter('')}
                  style={[
                    styles.tagChip,
                    !tagFilter && { backgroundColor: accentColor + '15', borderColor: accentColor + '30' }
                  ]}
                >
                  <Text style={[
                    styles.tagChipText,
                    !tagFilter && { color: accentColor, fontWeight: '700' }
                  ]}>
                    # Wszystkie tagi
                  </Text>
                </TouchableOpacity>
                {allTags.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => setTagFilter(tagFilter === tag ? '' : tag)}
                    style={[
                      styles.tagChip,
                      tagFilter === tag && { backgroundColor: accentColor + '15', borderColor: accentColor + '30' }
                    ]}
                  >
                    <Text style={[
                      styles.tagChipText,
                      tagFilter === tag && { color: accentColor, fontWeight: '700' }
                    ]}>
                      #{tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Parameters Cards List */}
        {parameters.length === 0 ? (
          <EmptyState onAddPress={onAddParameter} accentColor={accentColor} />
        ) : filteredParams.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🔍 Brak wskaźników spełniających kryteria wyszukiwania.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredParams.map((p, idx) => {
              const globalIndex = parameters.indexOf(p);
              const sortedResults = getResultsForParam(p.name)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              const latestRes = sortedResults.length > 0 ? sortedResults[0] : null;
              const prevRes = sortedResults.length > 1 ? sortedResults[1] : null;
              return (
                <ParameterCard
                  key={p.name}
                  parameter={p}
                  latestResult={latestRes}
                  previousResult={prevRes}
                  resultCount={sortedResults.length}
                  onPress={() => onSelectParam(p)}
                  onAddResult={() => onAddResult(p)}
                  onEdit={() => onEditParameter(p)}
                  onDelete={() => {
                    if (Platform.OS === 'web') {
                      if (window.confirm(`Czy na pewno chcesz usunąć "${p.name}" wraz ze wszystkimi jego wynikami?`)) {
                        onDeleteParameter(p.name);
                      }
                    } else {
                      Alert.alert(
                        'Usuń wskaźnik',
                        `Czy na pewno chcesz usunąć "${p.name}" wraz ze wszystkimi jego wynikami?`,
                        [
                          { text: 'Anuluj', style: 'cancel' },
                          { text: 'Usuń', style: 'destructive', onPress: () => onDeleteParameter(p.name) }
                        ]
                      );
                    }
                  }}
                  showDragHandle={sortMode === 'custom'}
                  dragIndex={globalIndex}
                  onReorder={onReorderParameter}
                  onMoveUp={sortMode === 'custom' ? () => onReorderParameter(globalIndex, globalIndex - 1) : undefined}
                  onMoveDown={sortMode === 'custom' ? () => onReorderParameter(globalIndex, globalIndex + 1) : undefined}
                  isFirst={globalIndex === 0}
                  isLast={globalIndex === parameters.length - 1}
                  accentColor={accentColor}
                  compact={isCompact}
                  fontMode={fontMode}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* FAB: Floating Action Button to add Parameter */}
      {parameters.length > 0 && (
        <TouchableOpacity style={[styles.fab, { backgroundColor: accentColor }]} onPress={onAddParameter} activeOpacity={0.85}>
          <Plus color={theme.textInverse} size={22} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spaceMd,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.bgApp,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spaceMd,
  },
  loadingText: {
    color: theme.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'column',
    marginTop: 10,
    marginBottom: theme.spaceMd,
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  backupRow: {
    flexDirection: 'row',
    gap: 8,
  },
  backupBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: theme.radiusSm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  backupBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  latestBanner: {
    paddingHorizontal: theme.spaceMd,
    paddingVertical: 10,
    backgroundColor: theme.accentPrimary + '15',
    borderWidth: 1,
    borderColor: theme.accentPrimary + '30',
    borderRadius: theme.radiusSm,
    marginBottom: theme.spaceMd,
  },
  latestBannerText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    zIndex: 1000,
  },
  sortBtn: {
    width: 42,
    height: 42,
    borderRadius: theme.radiusMd,
    borderWidth: 1,
    borderColor: theme.borderColor,
    backgroundColor: theme.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortBtnText: {
    fontSize: 18,
    color: theme.textPrimary,
    fontWeight: '700',
  },
  sortMenu: {
    position: 'absolute',
    top: 46,
    right: 0,
    width: 220,
    backgroundColor: theme.bgSurface,
    borderRadius: theme.radiusSm,
    borderWidth: 1,
    borderColor: theme.borderColor,
    zIndex: 999,
    overflow: 'hidden',
    ...theme.shadowLg,
  },
  sortMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSubtle,
  },
  sortMenuItemText: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  searchSection: {
    marginBottom: theme.spaceMd,
    gap: theme.spaceSm,
    zIndex: 1000,
  },
  searchInput: {
    padding: 10,
    borderRadius: theme.radiusMd,
    borderWidth: 1,
    borderColor: theme.borderColor,
    backgroundColor: theme.bgSurface,
    color: theme.textPrimary,
    fontSize: 15,
  },
  categoryScroll: {
    marginHorizontal: -theme.spaceMd,
    paddingHorizontal: theme.spaceMd,
  },
  categoryList: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radiusRound,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  categoryChipActive: {
    backgroundColor: theme.accentPrimary + '20',
    borderColor: theme.accentPrimary + '50',
  },
  categoryChipText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: theme.accentPrimary,
    fontWeight: '700',
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radiusRound,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  tagChipActive: {
    backgroundColor: theme.accentSecondary + '20',
    borderColor: theme.accentSecondary + '50',
  },
  tagChipText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  tagChipTextActive: {
    color: theme.accentSecondary,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    gap: theme.spaceSm,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: theme.accentPrimary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 26,
    fontWeight: '300',
    color: theme.textInverse,
  },
});
