import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, Platform, Alert
} from 'react-native';
import { theme } from '../utils/theme';
import { TestParameter, TestResult, CATEGORIES, CATEGORY_ICONS } from '../types';
import { checkRangeStatus, getStatusInfo } from '../utils/rangeParser';
import { FileText } from './Icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  parameters: TestParameter[];
  results: TestResult[];
  accentColor: string;
}

export default function ReportModal({
  visible,
  onClose,
  parameters,
  results,
  accentColor,
}: Props) {
  // State for date range
  const [activeQuickRange, setActiveQuickRange] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Selected parameter names
  const [selectedParamNames, setSelectedParamNames] = useState<string[]>(
    parameters.map(p => p.name)
  );

  // Patient & Doctor metadata
  const [patientName, setPatientName] = useState<string>('');
  const [patientId, setPatientId] = useState<string>('');
  const [doctorNotes, setDoctorNotes] = useState<string>('');

  // Options (hardcoded)
  const showAnomaliesSummary = false;
  const showNorms = true;

  // Preview state
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  // Quick range helper
  const applyQuickRange = (rangeKey: string, months: number | null) => {
    setActiveQuickRange(rangeKey);
    if (months === null) {
      setStartDate('');
      setEndDate('');
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  // Toggle parameter selection
  const toggleParam = (name: string) => {
    if (selectedParamNames.includes(name)) {
      setSelectedParamNames(selectedParamNames.filter(n => n !== name));
    } else {
      setSelectedParamNames([...selectedParamNames, name]);
    }
  };

  const selectAll = () => setSelectedParamNames(parameters.map(p => p.name));
  const deselectAll = () => setSelectedParamNames([]);

  // Build HTML content
  const buildHtmlContent = (): string | null => {
    if (selectedParamNames.length === 0) {
      Alert.alert('Brak wybranych badań', 'Wybierz co najmniej jeden wskaźnik do raportu.');
      return null;
    }

    // Filter results
    let filteredResults = results.filter(r => selectedParamNames.includes(r.parameter));
    if (startDate) {
      filteredResults = filteredResults.filter(r => r.date >= startDate);
    }
    if (endDate) {
      filteredResults = filteredResults.filter(r => r.date <= endDate);
    }

    // Sort by parameter & date
    filteredResults.sort((a, b) => {
      if (a.parameter !== b.parameter) {
        return a.parameter.localeCompare(b.parameter, 'pl');
      }
      return b.date.localeCompare(a.date);
    });

    // Group out-of-norm results (anomalies)
    const anomalies: { result: TestResult; param: TestParameter; status: string }[] = [];
    filteredResults.forEach(r => {
      const param = parameters.find(p => p.name === r.parameter);
      if (param) {
        const status = checkRangeStatus(r.value, param.referenceRange);
        if (status === 'high' || status === 'low') {
          anomalies.push({ result: r, param, status });
        }
      }
    });

    const nowStr = new Date().toLocaleDateString('pl-PL', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const dateRangeStr = (startDate || endDate)
      ? `${startDate || 'Najstarsze'} do ${endDate || 'Najnowsze'}`
      : 'Całość historii badań';

    // Construct print HTML document
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pl">
      <head>
        <meta charset="utf-8">
        <title>Raport Medyczny Wyników Badań</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1a1a1a;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .header {
            border-bottom: 2px solid #2d3748;
            padding-bottom: 12px;
            margin-bottom: 18px;
          }
          .header-title {
            font-size: 20px;
            font-weight: 800;
            color: #1a202c;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .patient-box {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 18px;
            display: flex;
            gap: 20px;
            font-size: 12px;
          }
          .patient-field {
            font-weight: 700;
            color: #2d3748;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 20px;
          }
          th {
            background: #edf2f7;
            color: #2d3748;
            font-weight: 700;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 2px solid #cbd5e0;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.5px;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
          }
          .status-normal { background: #c6f6d5; color: #22543d; }
          .status-high { background: #fed7d7; color: #742a2a; }
          .status-low { background: #ebf8ff; color: #2b6cb0; }
          .separator-row td {
            padding: 4px 0;
            border-bottom: 2px solid #cbd5e0;
            background: #f0f4f8;
            font-weight: 700;
            font-size: 11px;
            color: #2d3748;
            letter-spacing: 0.3px;
          }
          .doctor-notes {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
            margin-top: 15px;
            font-size: 12px;
          }
          .doctor-notes-title {
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-title">📋 Raport Wyników Badań</div>
        </div>

        ${(patientName || patientId) ? `
          <div class="patient-box">
            ${patientName ? `<div><span class="patient-field">Pacjent:</span> ${patientName}</div>` : ''}
            ${patientId ? `<div><span class="patient-field">Data urodzenia / PESEL:</span> ${patientId}</div>` : ''}
          </div>
        ` : ''}

        <table>
          <thead>
            <tr>
              <th>Wskaźnik</th>
              <th>Data pomiaru</th>
              <th>Wynik</th>
              ${showNorms ? `<th>Norma referencyjna</th>` : ''}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              let lastParam = '';
              return filteredResults.map(r => {
                const param = parameters.find(p => p.name === r.parameter);
                const status = param ? checkRangeStatus(r.value, param.referenceRange) : 'unknown';
                const statusInfo = getStatusInfo(status);
                
                let badgeClass = 'status-normal';
                if (status === 'high') badgeClass = 'status-high';
                if (status === 'low') badgeClass = 'status-low';

                const colCount = showNorms ? 5 : 4;
                let separator = '';
                if (r.parameter !== lastParam) {
                  lastParam = r.parameter;
                  separator = `<tr class="separator-row"><td colspan="${colCount}">${r.parameter}</td></tr>`;
                }

                return `
                  ${separator}
                  <tr>
                    <td>${r.parameter}</td>
                    <td>${r.date}</td>
                    <td><strong>${r.value}</strong> ${param?.unit || ''}</td>
                    ${showNorms ? `<td>${param?.referenceRange || 'Brak'}</td>` : ''}
                    <td>
                      <span class="status-badge ${badgeClass}">${statusInfo.label}</span>
                    </td>
                  </tr>
                `;
              }).join('');
            })()}
          </tbody>
        </table>

        ${doctorNotes ? `
          <div class="doctor-notes">
            <div class="doctor-notes-title">📝 Uwagi dla lekarza:</div>
            <div>${doctorNotes.replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}
      </body>
      </html>
    `;

    return htmlContent;
  };

  const showPreview = () => {
    const html = buildHtmlContent();
    if (html) {
      setPreviewHtml(html);
    }
  };

  const downloadPDF = () => {
    if (!previewHtml) return;
    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(previewHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 300);
      }
    } else {
      Alert.alert('Drukuj Raport', 'Pobieranie PDF na urządzeniach mobilnych wymaga połączenia przeglądarkowego.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={() => { setPreviewHtml(null); onClose(); }}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, previewHtml ? { maxWidth: 900, maxHeight: '95%' } : {}]}>
          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <FileText color={accentColor} size={20} />
              <Text style={styles.modalTitle}>
                {previewHtml ? 'Podgląd Raportu' : 'Generowanie Raportu PDF'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => { setPreviewHtml(null); onClose(); }} style={styles.closeBtn}>
              <Text style={{ color: theme.textSecondary, fontSize: 18, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {previewHtml ? (
            /* ===== PREVIEW MODE ===== */
            <>
              {Platform.OS === 'web' ? (
                <View style={{ flex: 1, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: theme.borderColor }}>
                  <iframe
                    srcDoc={previewHtml}
                    style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff', borderRadius: 8 } as any}
                    title="Podgląd raportu"
                  />
                </View>
              ) : (
                <ScrollView style={{ flex: 1 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', padding: 20 }}>
                    Podgląd PDF jest dostępny w przeglądarce webowej.
                  </Text>
                </ScrollView>
              )}

              {/* Preview footer buttons */}
              <View style={styles.footerRow}>
                <TouchableOpacity onPress={() => setPreviewHtml(null)} style={styles.cancelBtn}>
                  <Text style={{ color: accentColor, fontWeight: '700' }}>← Wróć do edycji</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={downloadPDF}
                  style={[styles.downloadBtn, { backgroundColor: accentColor }]}
                  activeOpacity={0.8}
                >
                  <FileText color={theme.textInverse} size={16} />
                  <Text style={[styles.downloadBtnText, { color: theme.textInverse }]}>Pobierz PDF</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* ===== EDITOR MODE ===== */
            <>
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Step 1: Date Range */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeader}>1. Wybierz zakres dat</Text>
                  <View style={styles.quickRangeRow}>
                    {[
                      { label: '1M', key: '1m', months: 1 },
                      { label: '3M', key: '3m', months: 3 },
                      { label: '6M', key: '6m', months: 6 },
                      { label: '1 Rok', key: '1y', months: 12 },
                      { label: 'Wszystko', key: 'all', months: null },
                    ].map(item => (
                      <TouchableOpacity
                        key={item.key}
                        onPress={() => applyQuickRange(item.key, item.months)}
                        style={[
                          styles.quickBtn,
                          activeQuickRange === item.key && { backgroundColor: accentColor + '25', borderColor: accentColor }
                        ]}
                      >
                        <Text style={[styles.quickBtnText, activeQuickRange === item.key && { color: accentColor, fontWeight: '700' }]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.dateInputsRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>Od daty:</Text>
                      <TextInput
                        style={styles.textInput}
                        value={startDate}
                        onChangeText={t => { setStartDate(t); setActiveQuickRange('custom'); }}
                        placeholder="RRRR-MM-DD"
                        placeholderTextColor={theme.textMuted}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>Do daty:</Text>
                      <TextInput
                        style={styles.textInput}
                        value={endDate}
                        onChangeText={t => { setEndDate(t); setActiveQuickRange('custom'); }}
                        placeholder="RRRR-MM-DD"
                        placeholderTextColor={theme.textMuted}
                      />
                    </View>
                  </View>
                </View>

                {/* Step 2: Patient Info */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeader}>2. Dane pacjenta (opcjonalnie)</Text>
                  <View style={{ gap: 8 }}>
                    <TextInput
                      style={styles.textInput}
                      value={patientName}
                      onChangeText={setPatientName}
                      placeholder="Imię i Nazwisko pacjenta..."
                      placeholderTextColor={theme.textMuted}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={patientId}
                      onChangeText={setPatientId}
                      placeholder="PESEL lub data urodzenia..."
                      placeholderTextColor={theme.textMuted}
                    />
                    <TextInput
                      style={[styles.textInput, { height: 60 }]}
                      value={doctorNotes}
                      onChangeText={setDoctorNotes}
                      multiline
                      placeholder="Uwagi / pytania dla lekarza prowadzącego..."
                      placeholderTextColor={theme.textMuted}
                    />
                  </View>
                </View>

                {/* Step 3: Parameter Selection */}
                <View style={styles.section}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={styles.sectionHeader}>3. Wybierz wskaźniki ({selectedParamNames.length}/{parameters.length})</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity onPress={selectAll}>
                        <Text style={{ color: accentColor, fontSize: 12, fontWeight: '700' }}>Wszystkie</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={deselectAll}>
                        <Text style={{ color: '#ff7675', fontSize: 12, fontWeight: '700' }}>Wyczyść</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.paramsGrid}>
                    {parameters.map(p => {
                      const isChecked = selectedParamNames.includes(p.name);
                      return (
                        <TouchableOpacity
                          key={p.name}
                          onPress={() => toggleParam(p.name)}
                          style={[
                            styles.paramChip,
                            isChecked && { backgroundColor: accentColor + '20', borderColor: accentColor + '50' }
                          ]}
                        >
                          <Text style={[styles.paramChipText, isChecked && { color: accentColor, fontWeight: '700' }]}>
                            {isChecked ? '✓ ' : ''}{p.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>


              </ScrollView>

              {/* Bottom Action Button */}
              <View style={styles.footerRow}>
                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                  <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={showPreview}
                  style={[styles.downloadBtn, { backgroundColor: accentColor }]}
                  activeOpacity={0.8}
                >
                  <FileText color={theme.textInverse} size={16} />
                  <Text style={[styles.downloadBtnText, { color: theme.textInverse }]}>Podgląd Raportu</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '90%',
    backgroundColor: theme.bgSurface,
    borderRadius: theme.radiusLg,
    borderWidth: 1,
    borderColor: theme.borderColor,
    padding: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  quickRangeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  quickBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.borderColor,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  quickBtnText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldLabel: {
    fontSize: 11,
    color: theme.textMuted,
    marginBottom: 2,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: theme.radiusSm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: theme.textPrimary,
    fontSize: 13,
  },
  paramsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    maxHeight: 140,
  },
  paramChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.borderColor,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  paramChipText: {
    fontSize: 11,
    color: theme.textSecondary,
  },
  checkboxRow: {
    paddingVertical: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.borderColor,
    paddingTop: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radiusSm,
  },
  downloadBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
