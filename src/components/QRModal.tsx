import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Clipboard, Platform, ScrollView
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import QRCode from 'qrcode';
import { theme } from '../utils/theme';
import { TestParameter, TestResult } from '../types';
import { serializeIndicator } from '../utils/qrSerializer';

interface Props {
  visible: boolean;
  parameter: TestParameter | null;
  results: TestResult[];
  onClose: () => void;
  accentColor: string;
}

export default function QRModal({ visible, parameter, results, onClose, accentColor }: Props) {
  const [serializedCode, setSerializedCode] = useState('');
  const [qrSize, setQrSize] = useState(0);
  const [qrModules, setQrModules] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (visible && parameter) {
      const code = serializeIndicator(parameter, results);
      setSerializedCode(code);

      try {
        const qr = QRCode.create(code, { errorCorrectionLevel: 'M' });
        setQrModules(qr.modules);
        setQrSize(qr.modules.size);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
      setCopied(false);
    } else {
      setSerializedCode('');
      setQrModules(null);
      setQrSize(0);
    }
  }, [visible, parameter, results]);

  const handleCopy = () => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(serializedCode);
    } else {
      Clipboard.setString(serializedCode);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!parameter) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={[styles.title, { color: accentColor }]}>📤 Udostępnij Wskaźnik</Text>
          <Text style={styles.subtitle}>{parameter.name}</Text>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* QR Code container */}
            <Text style={styles.sectionLabel}>Kod QR do skanowania:</Text>
            {qrModules && qrSize > 0 ? (
              <View style={styles.qrContainer}>
                <View style={styles.qrWhiteBox}>
                  <Svg width={180} height={180} viewBox={`0 0 ${qrSize} ${qrSize}`}>
                    {Array.from({ length: qrSize }).map((_, row) =>
                      Array.from({ length: qrSize }).map((_, col) => {
                        if (qrModules.get(row, col)) {
                          return (
                            <Rect
                              key={`${row}-${col}`}
                              x={col}
                              y={row}
                              width={1.05}
                              height={1.05}
                              fill="#000000"
                            />
                          );
                        }
                        return null;
                      })
                    )}
                  </Svg>
                </View>
                <Text style={styles.qrInfo}>Przełącz telefon na aparat i zeskanuj, aby zaimportować.</Text>
              </View>
            ) : (
              <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 20 }}>
                Generowanie kodu QR...
              </Text>
            )}

            {/* Text Code area */}
            <Text style={styles.sectionLabel}>Kod tekstowy:</Text>
            <View style={styles.codeContainer}>
              <TextInput
                style={styles.codeText}
                value={serializedCode}
                editable={false}
                multiline
                selectTextOnFocus
              />
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.7}>
                <Text style={styles.copyBtnText}>
                  {copied ? '✓ Skopiowano!' : '📋 Kopiuj kod wskaźnika'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Close button */}
          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: accentColor }]} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeBtnText}>Zamknij</Text>
          </TouchableOpacity>
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
    padding: theme.spaceLg,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textPrimary,
    textAlign: 'center',
    marginTop: -2,
    marginBottom: theme.spaceSm,
  },
  scrollContent: {
    alignItems: 'center',
    gap: theme.spaceSm,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textSecondary,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 6,
    gap: 8,
  },
  qrWhiteBox: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: theme.radiusSm,
    ...theme.shadowSm,
  },
  qrInfo: {
    fontSize: 11,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  codeContainer: {
    width: '100%',
    gap: 6,
    marginBottom: theme.spaceSm,
  },
  codeText: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: theme.radiusSm,
    padding: 8,
    color: theme.textSecondary,
    fontSize: 11,
    fontFamily: 'monospace',
    height: 70,
    textAlignVertical: 'top',
  },
  copyBtn: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: theme.radiusSm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  copyBtnText: {
    color: theme.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    backgroundColor: theme.accentPrimary,
    paddingVertical: 12,
    borderRadius: theme.radiusSm,
    alignItems: 'center',
    marginTop: theme.spaceSm,
  },
  closeBtnText: {
    color: theme.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
