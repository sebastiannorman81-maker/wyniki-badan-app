import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import Svg, {
  Path, Circle, Rect, Line, Text as SvgText, Defs, LinearGradient, Stop, G, ClipPath
} from 'react-native-svg';
import { theme } from '../utils/theme';
import { TestParameter, TestResult } from '../types';
import { parseRange } from '../utils/rangeParser';

interface Props {
  mainParam: TestParameter;
  tests: TestResult[]; // All tests in the app (we will filter them here)
  comparedParamNames: string[];
  parameters: TestParameter[]; // All parameter configs
  startDate?: string;
  endDate?: string;
  selectedResultId?: string | null;
  onSelectResult?: (resultId: string | null) => void;
  accentColor?: string;
}

export default function TestChart({
  mainParam,
  tests,
  comparedParamNames,
  parameters,
  startDate,
  endDate,
  selectedResultId,
  onSelectResult,
  accentColor,
}: Props) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    date: string;
    value: number;
    unit: string;
    notes?: string;
    parameterName: string;
    color: string;
  } | null>(null);

  const additionalParams = parameters.filter(p => comparedParamNames.includes(p.name));
  const paramsToDraw = [mainParam, ...additionalParams];

  const drawData = paramsToDraw.map((p, idx) => {
    const results = tests
      .filter(t => t.parameter === p.name)
      .filter(t => {
        if (startDate && t.date < startDate) return false;
        if (endDate && t.date > endDate) return false;
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      param: p,
      results,
      color: (idx === 0 && accentColor) ? accentColor : theme.chartColors[idx % theme.chartColors.length],
    };
  });

  const totalPointsCount = drawData.reduce((acc, curr) => acc + curr.results.length, 0);

  if (totalPointsCount === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>🔬 Brak wyników do wyświetlenia na wykresie.</Text>
        <Text style={styles.emptySubtext}>Dodaj pomiary dla wybranego wskaźnika w wybranym przedziale dat.</Text>
      </View>
    );
  }

  // Find min/max values and times to scale coordinates
  let allVals: number[] = [];
  let allNorms: number[] = [];
  let allTimes: number[] = [];

  drawData.forEach(d => {
    allVals.push(...d.results.map(r => r.value));
    allTimes.push(...d.results.map(r => new Date(r.date).getTime()));
    const range = parseRange(d.param.referenceRange);
    if (range) {
      if (range.min !== null) allNorms.push(range.min);
      if (range.max !== null) allNorms.push(range.max);
    }
  });

  const minVal = Math.min(...allVals, ...allNorms);
  const maxVal = Math.max(...allVals, ...allNorms);
  const valRange = maxVal - minVal;
  const paddingY = valRange * 0.15 || 1.0;
  const yMin = Math.max(0, minVal - paddingY);
  const yMax = maxVal + paddingY;
  const yRange = yMax - yMin;

  allTimes.sort((a, b) => a - b);
  const minTime = allTimes[0];
  const maxTime = allTimes[allTimes.length - 1];
  const timeRange = maxTime - minTime || 1;

  // SVG dimensions — taller to fit dedicated year timeline ribbon
  const width = 500;
  const height = 320;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 40;
  const yearBandHeight = 50; // dedicated space for year timeline at bottom
  const paddingBottom = yearBandHeight + 10;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Map points and lines
  const mappedLines = drawData
    .map((d) => {
      if (d.results.length === 0) return null;
      const points = d.results.map(r => {
        const t = new Date(r.date).getTime();
        const x = paddingLeft + ((t - minTime) / timeRange) * chartWidth;
        const y = paddingTop + (1 - (r.value - yMin) / yRange) * chartHeight;
        return {
          x,
          y,
          ...r,
          color: d.color,
          unit: d.param.unit,
          refRange: d.param.referenceRange,
        };
      });

      let pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
      }

      const gradientPathD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

      return {
        param: d.param,
        color: d.color,
        points,
        pathD,
        gradientPathD,
      };
    })
    .filter(Boolean) as Array<{
    param: TestParameter;
    color: string;
    points: any[];
    pathD: string;
    gradientPathD: string;
  }>;

  React.useEffect(() => {
    if (!selectedResultId) return;
    for (const ml of mappedLines) {
      const found = ml.points.find((pt: any) => pt.id === selectedResultId);
      if (found) {
        setHoveredPoint({
          x: found.x,
          y: found.y - 12,
          date: found.date,
          value: found.value,
          unit: found.unit,
          notes: found.notes,
          parameterName: ml.param.name,
          color: ml.color,
        });
        break;
      }
    }
  }, [selectedResultId, tests, startDate, endDate, comparedParamNames]);

  // Grid lines
  const gridLinesCount = 3;
  const yGridValues: number[] = [];
  for (let i = 0; i <= gridLinesCount; i++) {
    yGridValues.push(yMin + (yRange * i) / gridLinesCount);
  }

  return (
    <View style={styles.container}>
      <Svg viewBox={`0 0 ${width} ${height}`} width="100%" height={320} style={{ overflow: 'visible' }}>
        <Defs>
          {mappedLines.map((ml, idx) => (
            <LinearGradient key={idx} id={`chartGradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={ml.color} stopOpacity={0.2} />
              <Stop offset="100%" stopColor={ml.color} stopOpacity={0.0} />
            </LinearGradient>
          ))}
        </Defs>

        {/* Legend */}
        <G transform={`translate(${paddingLeft}, 15)`}>
          {drawData.map((d, idx) => (
            <G key={idx} transform={`translate(${idx * 90}, 0)`}>
              <Rect width={8} height={8} rx={2} fill={d.color} />
              <SvgText x={12} y={8} fill={theme.textSecondary} fontSize={9} fontWeight="600">
                {d.param.name.length > 11 ? `${d.param.name.slice(0, 9)}...` : d.param.name}
              </SvgText>
            </G>
          ))}
        </G>

        {/* ═══════════════ YEAR BANDS — Each year gets a distinct colored background ═══════════════ */}
        {minTime !== maxTime && (() => {
          const startYear = new Date(minTime).getFullYear();
          const endYear = new Date(maxTime).getFullYear();
          const years: number[] = [];
          for (let y = startYear; y <= endYear; y++) years.push(y);

          // Curated year color palette — muted, visually distinct
          const yearColors = [
            { fill: 'rgba(124, 108, 240, 0.08)', border: 'rgba(124, 108, 240, 0.35)', ribbon: '#7c6cf0', text: '#c4bbff' },
            { fill: 'rgba(0, 184, 148, 0.08)',   border: 'rgba(0, 184, 148, 0.35)',   ribbon: '#00b894', text: '#80ffd4' },
            { fill: 'rgba(255, 183, 77, 0.07)',   border: 'rgba(255, 183, 77, 0.30)',  ribbon: '#ffb74d', text: '#ffe0a8' },
            { fill: 'rgba(253, 121, 168, 0.07)',  border: 'rgba(253, 121, 168, 0.30)', ribbon: '#fd79a8', text: '#ffb6d1' },
            { fill: 'rgba(9, 132, 227, 0.08)',    border: 'rgba(9, 132, 227, 0.35)',   ribbon: '#0984e3', text: '#74b9ff' },
            { fill: 'rgba(85, 239, 196, 0.06)',   border: 'rgba(85, 239, 196, 0.25)',  ribbon: '#55efc4', text: '#a8fce0' },
          ];

          const chartBottom = paddingTop + chartHeight;
          const monthTickY = chartBottom + 12; // months directly under chart
          const ribbonY = chartBottom + 20;     // ribbon below months
          const ribbonH = 20;

          return years.map((y, idx) => {
            const yearStart = Math.max(minTime, new Date(y, 0, 1).getTime());
            const yearEnd = Math.min(maxTime, new Date(y, 11, 31, 23, 59, 59).getTime());

            const xStart = paddingLeft + ((yearStart - minTime) / timeRange) * chartWidth;
            const xEnd = paddingLeft + ((yearEnd - minTime) / timeRange) * chartWidth;
            const spanWidth = xEnd - xStart;
            const xCenter = (xStart + xEnd) / 2;

            if (spanWidth <= 0) return null;

            const colors = yearColors[idx % yearColors.length];

            // Generate month ticks within this year
            const polishMonths = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
            const monthTicks: { x: number; label: string }[] = [];
            const diffMs = yearEnd - yearStart;
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays <= 45) {
              // Short span → show day.month ticks
              const step = Math.max(1, Math.floor(diffDays / 4));
              for (let d = new Date(yearStart); d.getTime() <= yearEnd; d.setDate(d.getDate() + step)) {
                const t = d.getTime();
                const x = paddingLeft + ((t - minTime) / timeRange) * chartWidth;
                const dayStr = String(d.getDate()).padStart(2, '0');
                const monStr = String(d.getMonth() + 1).padStart(2, '0');
                monthTicks.push({ x, label: `${dayStr}.${monStr}` });
              }
            } else {
              // Longer span → show month labels
              const startMonth = new Date(yearStart).getMonth();
              const endMonth = new Date(yearEnd).getMonth();
              const startYearNum = new Date(yearStart).getFullYear();
              // Decide step based on how many months fit in pixel space
              const monthsInSpan = endMonth - startMonth + 1 + (new Date(yearEnd).getFullYear() - startYearNum) * 12;
              const pxPerMonth = spanWidth / Math.max(1, monthsInSpan);
              const monthStep = pxPerMonth < 20 ? 3 : pxPerMonth < 35 ? 2 : 1;

              for (let m = startMonth; m <= 11; m += monthStep) {
                const mTime = new Date(y, m, 15).getTime(); // mid-month
                if (mTime < yearStart || mTime > yearEnd) continue;
                const x = paddingLeft + ((mTime - minTime) / timeRange) * chartWidth;
                if (x >= xStart + 4 && x <= xEnd - 4) {
                  monthTicks.push({ x, label: polishMonths[m] });
                }
              }
            }

            return (
              <G key={`year-band-${y}`}>
                {/* Year background band — gradient fill */}
                <Defs>
                  <LinearGradient id={`yearGrad-${y}`} x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={colors.ribbon} stopOpacity={0.06} />
                    <Stop offset="100%" stopColor={colors.ribbon} stopOpacity={0.01} />
                  </LinearGradient>
                </Defs>
                <Rect
                  x={xStart}
                  y={paddingTop}
                  width={spanWidth}
                  height={chartHeight}
                  fill={`url(#yearGrad-${y})`}
                />

                {/* Left edge glow line (if not first) */}
                {yearStart > minTime && (
                  <Line
                    x1={xStart}
                    y1={paddingTop}
                    x2={xStart}
                    y2={chartBottom}
                    stroke={colors.border}
                    strokeWidth={1.5}
                    strokeDasharray="6 3"
                  />
                )}

                {/* ──── Month Ticks above ribbon ──── */}
                {monthTicks.map((mt, mIdx) => (
                  <G key={`mt-${y}-${mIdx}`}>
                    {/* Subtle vertical guide from chart area to ribbon */}
                    <Line
                      x1={mt.x}
                      y1={chartBottom}
                      x2={mt.x}
                      y2={ribbonY}
                      stroke={colors.border}
                      strokeWidth={0.5}
                      opacity={0.4}
                    />
                    {/* Month label above ribbon */}
                    <SvgText
                      x={mt.x}
                      y={monthTickY}
                      fill={theme.textSecondary}
                      fontSize={8.5}
                      fontWeight="600"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {mt.label}
                    </SvgText>
                  </G>
                ))}

                {/* ──── Year Ribbon Badge ──── */}
                <Rect
                  x={xStart + 1}
                  y={ribbonY}
                  width={Math.max(0, spanWidth - 2)}
                  height={ribbonH}
                  rx={6}
                  ry={6}
                  fill={colors.ribbon}
                  opacity={0.15}
                />
                <Rect
                  x={xStart + 1}
                  y={ribbonY}
                  width={Math.max(0, spanWidth - 2)}
                  height={ribbonH}
                  rx={6}
                  ry={6}
                  fill="none"
                  stroke={colors.ribbon}
                  strokeWidth={1}
                  opacity={0.4}
                />
                {spanWidth > 30 && (
                  <SvgText
                    x={xCenter}
                    y={ribbonY + ribbonH / 2 + 3.5}
                    fill={colors.text}
                    fontSize={spanWidth > 60 ? 11 : 8.5}
                    fontWeight="900"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                    letterSpacing={spanWidth > 60 ? 2 : 0.5}
                  >
                    {y}
                  </SvgText>
                )}
              </G>
            );
          });
        })()}

        {/* Chart bottom edge line */}
        <Line
          x1={paddingLeft}
          y1={paddingTop + chartHeight}
          x2={width - paddingRight}
          y2={paddingTop + chartHeight}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={1}
        />

        {/* Single-point fallback: show year label centered */}
        {minTime === maxTime && (() => {
          const d = new Date(minTime);
          const polishMonths = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
          const chartBottom = paddingTop + chartHeight;
          const monthTickY = chartBottom + 12;
          const ribbonY = chartBottom + 20;
          const ribbonH = 20;
          const xCenter = paddingLeft + chartWidth / 2;
          return (
            <G>
              <SvgText x={xCenter} y={monthTickY} fill={theme.textSecondary} fontSize={9} fontWeight="600" textAnchor="middle" fontFamily="sans-serif">
                {polishMonths[d.getMonth()]}
              </SvgText>
              <Rect x={paddingLeft + 1} y={ribbonY} width={chartWidth - 2} height={ribbonH} rx={6} ry={6} fill="rgba(124, 108, 240, 0.15)" />
              <Rect x={paddingLeft + 1} y={ribbonY} width={chartWidth - 2} height={ribbonH} rx={6} ry={6} fill="none" stroke="rgba(124, 108, 240, 0.4)" strokeWidth={1} />
              <SvgText x={xCenter} y={ribbonY + ribbonH / 2 + 3.5} fill="#c4bbff" fontSize={11} fontWeight="900" textAnchor="middle" fontFamily="sans-serif" letterSpacing={2}>
                {d.getFullYear()}
              </SvgText>
            </G>
          );
        })()}

        {/* Grid lines & Y-axis labels */}
        {yGridValues.map((val, idx) => {
          const y = paddingTop + (1 - (val - yMin) / yRange) * chartHeight;
          return (
            <G key={idx}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 4"
              />
              <SvgText
                x={paddingLeft - 8}
                y={y + 3}
                textAnchor="end"
                fill={theme.textSecondary}
                fontSize={9}
                fontFamily="monospace"
              >
                {val.toFixed(1)}
              </SvgText>
            </G>
          );
        })}

        {/* Reference Range Band (when only 1 parameter is displayed) */}
        {drawData.length === 1 && (() => {
          const rangeParsed = parseRange(mainParam.referenceRange);
          if (!rangeParsed) return null;
          const normMin = rangeParsed.min !== null ? rangeParsed.min : yMin;
          const normMax = rangeParsed.max !== null ? rangeParsed.max : yMax;

          const yMinNorm = paddingTop + (1 - (normMin - yMin) / yRange) * chartHeight;
          const yMaxNorm = paddingTop + (1 - (normMax - yMin) / yRange) * chartHeight;

          return (
            <G>
              {/* Highlight band - 8% green fill for strong visibility */}
              <Rect
                x={paddingLeft}
                y={yMaxNorm}
                width={chartWidth}
                height={Math.max(0, yMinNorm - yMaxNorm)}
                fill="rgba(85, 239, 196, 0.08)"
                stroke="rgba(85, 239, 196, 0.35)"
                strokeDasharray="3 3"
                strokeWidth={1.5}
              />
              <SvgText
                x={width - paddingRight - 8}
                y={yMaxNorm + 12}
                fill="rgba(85, 239, 196, 0.85)"
                fontSize={9.5}
                fontWeight="900"
                textAnchor="end"
              >
                Norma ({mainParam.referenceRange})
              </SvgText>
            </G>
          );
        })()}

        {/* Reference Range lines for multiple compared parameters */}
        {drawData.length > 1 && drawData.map((d, dIdx) => {
          const range = parseRange(d.param.referenceRange);
          if (!range) return null;
          return (
            <G key={`norm-lines-${dIdx}`}>
              {range.min !== null && range.min >= yMin && range.min <= yMax && (
                <Line
                  x1={paddingLeft}
                  y1={paddingTop + (1 - (range.min - yMin) / yRange) * chartHeight}
                  x2={width - paddingRight}
                  y2={paddingTop + (1 - (range.min - yMin) / yRange) * chartHeight}
                  stroke={d.color}
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  opacity={0.65}
                />
              )}
              {range.max !== null && range.max >= yMin && range.max <= yMax && (
                <Line
                  x1={paddingLeft}
                  y1={paddingTop + (1 - (range.max - yMin) / yRange) * chartHeight}
                  x2={width - paddingRight}
                  y2={paddingTop + (1 - (range.max - yMin) / yRange) * chartHeight}
                  stroke={d.color}
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  opacity={0.65}
                />
              )}
            </G>
          );
        })}

        {/* Lines and Gradients */}
        {mappedLines.map((ml, idx) => (
          <G key={`chart-line-${idx}`}>
            <Path
              d={ml.gradientPathD}
              fill={`url(#chartGradient-${idx})`}
            />
            <Path
              d={ml.pathD}
              fill="none"
              stroke={ml.color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>
        ))}

        {/* Interactive Points */}
        {mappedLines.flatMap((ml, mlIdx) =>
          ml.points.map((pt, ptIdx) => {
            const isSelected = (selectedResultId && pt.id === selectedResultId) ||
              (hoveredPoint && hoveredPoint.date === pt.date && hoveredPoint.value === pt.value && hoveredPoint.parameterName === ml.param.name);
            const selectPoint = () => {
              setHoveredPoint({
                x: pt.x,
                y: pt.y - 12,
                date: pt.date,
                value: pt.value,
                unit: pt.unit,
                notes: pt.notes,
                parameterName: ml.param.name,
                color: ml.color,
              });
              if (pt.id) {
                onSelectResult?.(pt.id === selectedResultId ? null : pt.id);
              }
            };
            return (
              <G key={`dot-${mlIdx}-${ptIdx}`}>
                {/* Outer glowing ring when selected */}
                {isSelected && (
                  <Circle
                    cx={pt.x}
                    cy={pt.y}
                    r={13}
                    fill="none"
                    stroke={ml.color}
                    strokeWidth={2}
                    opacity={0.6}
                  />
                )}
                {/* Invisible larger touch target for easier clicking */}
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r={16}
                  fill="transparent"
                  onPress={selectPoint}
                  onPressIn={selectPoint}
                />
                {/* Visible dot */}
                <Circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 7 : 4}
                  fill={isSelected ? '#ffffff' : ml.color}
                  stroke={ml.color}
                  strokeWidth={isSelected ? 3 : 2}
                  onPress={selectPoint}
                  onPressIn={selectPoint}
                />
              </G>
            );
          })
        )}

        {/* Vector Tooltip inside Svg */}
        {hoveredPoint && (() => {
          const boxWidth = 140;
          const boxHeight = 55;
          
          let tx = hoveredPoint.x - boxWidth / 2;
          let ty = hoveredPoint.y - boxHeight - 8;

          // Constraints to prevent tooltip from going off chart boundaries
          if (tx < paddingLeft) tx = paddingLeft;
          if (tx + boxWidth > width - paddingRight) tx = width - paddingRight - boxWidth;
          if (ty < paddingTop) ty = hoveredPoint.y + 12; // show below the point if too close to top

          return (
            <G>
              {/* Background card with border matching parameter color */}
              <Rect
                x={tx}
                y={ty}
                width={boxWidth}
                height={boxHeight}
                rx={6}
                ry={6}
                fill="#0c0d14"
                stroke={hoveredPoint.color}
                strokeWidth={1.5}
              />
              
              {/* Parameter Name */}
              <SvgText
                x={tx + 8}
                y={ty + 15}
                fill={theme.textSecondary}
                fontSize={8}
                fontWeight="700"
                fontFamily="sans-serif"
              >
                {hoveredPoint.parameterName.toUpperCase()}
              </SvgText>

              {/* Date */}
              <SvgText
                x={tx + 8}
                y={ty + 28}
                fill={theme.textMuted}
                fontSize={9}
                fontFamily="sans-serif"
              >
                {hoveredPoint.date}
              </SvgText>

              {/* Value */}
              <SvgText
                x={tx + 8}
                y={ty + 44}
                fill="#ffffff"
                fontSize={13}
                fontWeight="800"
                fontFamily="sans-serif"
              >
                {hoveredPoint.value}
                <SvgText fill={theme.textSecondary} fontSize={9} fontWeight="normal">
                  {` ${hoveredPoint.unit}`}
                </SvgText>
              </SvgText>
            </G>
          );
        })()}
      </Svg>

      {/* Persistent Details Panel below the chart */}
      {hoveredPoint && (
        <View style={[styles.detailPanel, { borderColor: hoveredPoint.color }]}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>📊 Szczegóły wybranego punktu</Text>
            <TouchableOpacity onPress={() => setHoveredPoint(null)}>
              <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Wyczyść ✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailGrid}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Wskaźnik</Text>
              <Text style={styles.detailValue}>{hoveredPoint.parameterName}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Data pomiaru</Text>
              <Text style={styles.detailValue}>{hoveredPoint.date}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Wynik</Text>
              <Text style={[styles.detailValue, { color: hoveredPoint.color, fontWeight: '800' }]}>
                {hoveredPoint.value} {hoveredPoint.unit}
              </Text>
            </View>
          </View>
          {hoveredPoint.notes ? (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notatki / opis:</Text>
              <Text style={styles.notesText}>{hoveredPoint.notes}</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: theme.radiusMd,
    padding: theme.spaceSm,
  },
  emptyContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.borderColor,
    borderRadius: theme.radiusMd,
    padding: theme.spaceMd,
  },
  emptyText: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtext: {
    color: theme.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },

  detailPanel: {
    marginTop: theme.spaceMd,
    padding: theme.spaceMd,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderRadius: theme.radiusMd,
    gap: theme.spaceSm,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 6,
  },
  detailTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spaceMd,
    marginTop: 2,
  },
  detailCol: {
    flex: 1,
    minWidth: 100,
  },
  detailLabel: {
    fontSize: 10,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: theme.textPrimary,
    fontWeight: '600',
  },
  notesContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: theme.spaceXs,
    marginTop: 2,
  },
  notesLabel: {
    fontSize: 10,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  notesText: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
});
