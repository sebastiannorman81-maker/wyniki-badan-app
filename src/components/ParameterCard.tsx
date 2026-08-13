import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { theme, getHandwritingFontFamily, getHandwrittenTextStyle, FontMode } from '../utils/theme';
import { TestParameter, TestResult, CATEGORY_COLORS, CATEGORY_ICONS } from '../types';
import { checkRangeStatus, getStatusInfo } from '../utils/rangeParser';
import { Pencil, Trash, Plus, DragHandle, ArrowUp, ArrowDown, TrendingUp, TrendingDown, FileText } from './Icons';

interface Props {
  parameter: TestParameter;
  latestResult: TestResult | null;
  previousResult: TestResult | null;
  resultCount: number;
  onPress: () => void;
  onAddResult: () => void;
  onEdit: () => void;
  onDelete: () => void;
  accentColor: string;
  showDragHandle?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  dragIndex?: number;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  compact?: boolean;
  fontMode?: FontMode;
}

export default function ParameterCard({
  parameter,
  latestResult,
  previousResult,
  resultCount,
  onPress,
  onAddResult,
  onEdit,
  onDelete,
  accentColor,
  showDragHandle = false,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  dragIndex,
  onReorder,
  compact = false,
  fontMode,
}: Props) {
  const status = latestResult
    ? checkRangeStatus(latestResult.value, parameter.referenceRange)
    : 'unknown';
  const statusInfo = getStatusInfo(status);
  const catColor = CATEGORY_COLORS[parameter.category] || '#b2bec3';
  const catIcon = CATEGORY_ICONS[parameter.category] || '📦';

  const handleCleanupRef = React.useRef<(() => void) | null>(null);
  const cardCleanupRef = React.useRef<(() => void) | null>(null);

  // Helper to extract the actual HTML DOM node in react-native-web
  const getDOMNode = (node: any) => {
    if (!node) return null;
    if (Platform.OS !== 'web') return null;
    // In react-native-web, the ref can be an HTMLElement directly or an object with nativeRef/current
    if (node instanceof HTMLElement) return node;
    if (node.current instanceof HTMLElement) return node.current;
    if (node.select) return node; // Web wrapper
    return null;
  };

  // Callback ref for the DragHandle to bind drag events
  const handleRefCallback = React.useCallback((node: any) => {
    if (handleCleanupRef.current) {
      handleCleanupRef.current();
      handleCleanupRef.current = null;
    }

    const domNode = getDOMNode(node);
    if (domNode && dragIndex !== undefined) {
      const onDragStartWeb = (e: any) => {
        if (e.dataTransfer) {
          e.dataTransfer.setData('text/plain', dragIndex.toString());
          e.dataTransfer.effectAllowed = 'move';
        }
      };

      const onMouseDown = (e: MouseEvent) => {
        // Stop event propagation to prevent React Native's touch responder from hijacking the drag gesture
        e.stopPropagation();
      };

      domNode.setAttribute('draggable', 'true');
      domNode.addEventListener('dragstart', onDragStartWeb);
      domNode.addEventListener('mousedown', onMouseDown);

      handleCleanupRef.current = () => {
        domNode.removeEventListener('dragstart', onDragStartWeb);
        domNode.removeEventListener('mousedown', onMouseDown);
      };
    }
  }, [dragIndex]);

  // Callback ref for the whole card view container to act as the Drop Target
  const cardRefCallback = React.useCallback((node: any) => {
    if (cardCleanupRef.current) {
      cardCleanupRef.current();
      cardCleanupRef.current = null;
    }

    const domNode = getDOMNode(node);
    if (domNode && dragIndex !== undefined && onReorder) {
      const onDragOverWeb = (e: any) => {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'move';
        }
      };

      const onDropWeb = (e: any) => {
        e.preventDefault();
        if (e.dataTransfer) {
          const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
          if (!isNaN(fromIndex) && fromIndex !== dragIndex) {
            onReorder(fromIndex, dragIndex);
          }
        }
      };

      domNode.addEventListener('dragover', onDragOverWeb);
      domNode.addEventListener('drop', onDropWeb);

      cardCleanupRef.current = () => {
        domNode.removeEventListener('dragover', onDragOverWeb);
        domNode.removeEventListener('drop', onDropWeb);
      };
    }
  }, [dragIndex, onReorder]);

  // Ensure cleanups run when the component unmounts entirely
  React.useEffect(() => {
    return () => {
      if (handleCleanupRef.current) handleCleanupRef.current();
      if (cardCleanupRef.current) cardCleanupRef.current();
    };
  }, []);

  if (compact) {
    return (
      <TouchableOpacity
        ref={cardRefCallback}
        style={[styles.card, styles.compactCard, { borderLeftColor: accentColor }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactRow}>
          {showDragHandle && (
            <View style={styles.compactLeftControls}>
              {onMoveUp && !isFirst ? (
                <TouchableOpacity onPress={onMoveUp} style={styles.compactArrowBtn}>
                  <ArrowUp color={accentColor} size={11} />
                </TouchableOpacity>
              ) : (
                <View style={[styles.compactArrowBtn, { opacity: 0 }]} />
              )}
              
              <View ref={handleRefCallback} style={styles.compactDragHandle}>
                <DragHandle color={theme.textSecondary} size={14} />
              </View>

              {onMoveDown && !isLast ? (
                <TouchableOpacity onPress={onMoveDown} style={styles.compactArrowBtn}>
                  <ArrowDown color={accentColor} size={11} />
                </TouchableOpacity>
              ) : (
                <View style={[styles.compactArrowBtn, { opacity: 0 }]} />
              )}
            </View>
          )}

          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <Text style={[styles.compactName, getHandwrittenTextStyle(fontMode, true)]} numberOfLines={1}>{parameter.name}</Text>
              <View style={[styles.categoryBadge, { backgroundColor: catColor + '15', paddingHorizontal: 6, paddingVertical: 1 }]}>
                <Text style={[styles.categoryText, { color: catColor, fontSize: 8.5 }]}>
                  {catIcon} {parameter.category}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {latestResult ? (
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 1 }}>
                  <Text style={styles.compactValue}>{latestResult.value}</Text>
                  <Text style={styles.compactUnit}>{parameter.unit}</Text>
                </View>
              ) : (
                <Text style={styles.compactNoResult}>Brak</Text>
              )}

              {latestResult && (
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg, paddingHorizontal: 5, paddingVertical: 1 }]}>
                  <Text style={[styles.statusText, { color: statusInfo.text, fontSize: 8.5 }]}>{statusInfo.label}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.compactActions}>
            <TouchableOpacity onPress={onAddResult} style={styles.compactIconBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Plus color={theme.textPrimary} size={11} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onEdit} style={styles.compactIconBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Pencil color={theme.textSecondary} size={11} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.compactIconBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Trash color="#ff7675" size={11} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View ref={cardRefCallback} style={[styles.card, { borderLeftColor: accentColor }]}>
      {/* Top row */}
      <View style={styles.topRow}>
        {showDragHandle && (
          <View style={styles.leftControlColumn}>
            {onMoveUp && !isFirst ? (
              <TouchableOpacity onPress={onMoveUp} style={styles.verticalArrowBtn}>
                <ArrowUp color={accentColor} size={14} />
              </TouchableOpacity>
            ) : (
              <View style={[styles.verticalArrowBtn, { opacity: 0 }]} />
            )}

            <View ref={handleRefCallback} style={styles.dragHandleContainer}>
              <DragHandle color={theme.textSecondary} size={18} />
            </View>

            {onMoveDown && !isLast ? (
              <TouchableOpacity onPress={onMoveDown} style={styles.verticalArrowBtn}>
                <ArrowDown color={accentColor} size={14} />
              </TouchableOpacity>
            ) : (
              <View style={[styles.verticalArrowBtn, { opacity: 0 }]} />
            )}
          </View>
        )}
        
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, getHandwrittenTextStyle(fontMode, true)]} numberOfLines={2}>{parameter.name}</Text>
          <View style={styles.tagsRow}>
            <View style={[styles.categoryBadge, { backgroundColor: catColor + '20' }]}>
              <Text style={[styles.categoryText, { color: catColor }]}>
                {catIcon} {parameter.category}
              </Text>
            </View>
            {parameter.tags?.map(tag => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Pencil color={theme.textSecondary} size={14} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash color="#ff7675" size={14} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dashed Document Line */}
      <View style={styles.paperLineDivider} />

      {/* Reference range */}
      <Text style={styles.refRange}>
        Norma: <Text style={styles.refRangeValue}>{parameter.referenceRange}</Text> ({parameter.unit})
      </Text>

      {/* Latest result */}
      <View style={styles.resultRow}>
        <View>
          <Text style={styles.resultLabel}>Ostatni wynik</Text>
          {latestResult ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={styles.resultValue}>{latestResult.value}</Text>
                <Text style={styles.resultUnit}>{parameter.unit}</Text>
              </View>
              {previousResult && (() => {
                const diff = latestResult.value - previousResult.value;
                const absDiff = Math.abs(diff);
                const pct = previousResult.value !== 0 ? Math.abs((diff / previousResult.value) * 100) : 0;
                if (pct < 0.5) return null;
                const isUp = diff > 0;
                const color = isUp ? '#ff7675' : '#55efc4';
                return (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: color + '22',
                    borderWidth: 1,
                    borderColor: color + '50',
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}>
                    {isUp ? <TrendingUp color={color} size={12} /> : <TrendingDown color={color} size={12} />}
                    <Text style={{ fontSize: 10, fontWeight: '800', color }}>{isUp ? '+' : '−'}{pct.toFixed(1)}%</Text>
                  </View>
                );
              })()}
            </View>
          ) : (
            <Text style={styles.noResult}>Brak wyników</Text>
          )}
        </View>
        {latestResult && (
          <View style={{ alignItems: 'flex-end' }}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Text style={[styles.statusText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
            </View>
            <Text style={styles.resultDate}>{latestResult.date}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.addBtn} onPress={onAddResult} activeOpacity={0.7}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Plus color={theme.textPrimary} size={11} />
            <Text style={styles.addBtnText}>Wynik</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.chartBtn, { backgroundColor: accentColor }]} onPress={onPress} activeOpacity={0.7}>
          <Text style={styles.chartBtnText}>Wykres ({resultCount})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.bgSurface,
    borderRadius: theme.radiusMd,
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderLeftWidth: 4,
    padding: theme.spaceMd,
    gap: theme.spaceSm,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  compactCard: {
    backgroundColor: theme.bgSurface,
    paddingVertical: 8,
    paddingHorizontal: theme.spaceMd,
    borderRadius: theme.radiusSm,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  paperLineDivider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.08)',
    marginVertical: 1,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactLeftControls: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    gap: 1,
  },
  compactArrowBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 12,
  },
  compactDragHandle: {
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 18,
    ...Platform.select({
      web: {
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserDrag: 'element',
      } as any,
      default: {},
    }),
  },
  compactName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  compactValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  compactUnit: {
    fontSize: 10,
    color: theme.textSecondary,
    marginLeft: 1,
  },
  compactNoResult: {
    fontSize: 12,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  compactActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginLeft: 12,
  },
  compactIconBtn: {
    padding: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftControlColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    gap: 6,
  },
  verticalArrowBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 22,
  },
  dragHandleContainer: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
    ...Platform.select({
      web: {
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserDrag: 'element',
      } as any,
      default: {},
    }),
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tagBadge: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: theme.borderColor,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconBtn: {
    padding: 2,
  },
  refRange: {
    fontSize: 11,
    color: theme.textSecondary,
    marginTop: -2,
  },
  refRangeValue: {
    color: theme.textPrimary,
    fontWeight: '600',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: theme.radiusSm,
    padding: 10,
    marginTop: 2,
  },
  resultLabel: {
    fontSize: 10,
    color: theme.textMuted,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  resultUnit: {
    fontSize: 12,
    color: theme.textSecondary,
    marginLeft: 2,
  },
  noResult: {
    fontSize: 14,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resultDate: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  addBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: theme.radiusSm,
    alignItems: 'center',
  },
  addBtnText: {
    color: theme.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  chartBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: theme.accentPrimary,
    borderRadius: theme.radiusSm,
    alignItems: 'center',
  },
  chartBtnText: {
    color: theme.textInverse,
    fontSize: 13,
    fontWeight: '700',
  },
});
