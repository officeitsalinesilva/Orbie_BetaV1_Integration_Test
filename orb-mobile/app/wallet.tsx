import React from 'react';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrb } from '@/context/OrbContext';
import { useColors } from '@/hooks/useColors';

export default function WalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { preferences } = useOrb();
  const isEnglish = preferences.language === 'en';
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 18, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Feather name="arrow-left" size={20} color={colors.foreground} /></Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{isEnglish ? 'Wallet' : 'Carteira'}</Text>
        <View style={{ width: 20 }} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>ORB / CREDITS</Text>
        <Text style={[styles.balance, { color: colors.foreground }]}>◎ 240</Text>
        <Text style={[styles.description, { color: colors.mutedForeground }]}>{isEnglish ? 'Credits are used for deeper readings and premium tools.' : 'Créditos são usados para leituras profundas e ferramentas premium.'}</Text>
        <View style={[styles.rule, { backgroundColor: colors.border }]} />
        <View style={styles.row}><Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{isEnglish ? 'Available' : 'Disponíveis'}</Text><Text style={[styles.rowValue, { color: colors.foreground }]}>240</Text></View>
        <View style={styles.row}><Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{isEnglish ? 'Next renewal' : 'Próxima renovação'}</Text><Text style={[styles.rowValue, { color: colors.foreground }]}>{isEnglish ? 'Not scheduled' : 'Não agendada'}</Text></View>
      </View>
      <Text style={[styles.footer, { color: colors.tertiary }]}>{isEnglish ? 'Your Orb balance, in one place.' : 'Seu saldo Orb, em um só lugar.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 28, justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  content: { transform: [{ translateY: -22 }] },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.7, marginBottom: 16 },
  balance: { fontFamily: 'Inter_600SemiBold', fontSize: 46, letterSpacing: -1.5 },
  description: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23, maxWidth: 310, marginTop: 14 },
  rule: { height: 1, marginVertical: 30 },
  row: { minHeight: 52, borderBottomWidth: 1, borderBottomColor: '#E8E8E8', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  rowValue: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  footer: { fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center' },
});