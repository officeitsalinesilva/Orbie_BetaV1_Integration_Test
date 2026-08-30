import React from 'react';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrb } from '@/context/OrbContext';
import { useColors } from '@/hooks/useColors';

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { preferences } = useOrb();
  const isEnglish = preferences.language === 'en';
  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 18, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Feather name="arrow-left" size={20} color={colors.foreground} /></Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{isEnglish ? 'Notifications' : 'Notificações'}</Text>
        <Feather name="bell" size={19} color={colors.foreground} />
      </View>
      <View style={styles.content}>
        <View style={[styles.alertLine, { borderLeftColor: colors.accent }]}>
          <View style={styles.alertCopy}>
            <Text style={[styles.alertTitle, { color: colors.foreground }]}>{isEnglish ? 'Your daily reading is ready' : 'Sua leitura diária está pronta'}</Text>
            <Text style={[styles.alertText, { color: colors.mutedForeground }]}>{isEnglish ? 'Open Data to see today’s panorama.' : 'Abra Data para ver o panorama de hoje.'}</Text>
          </View>
          <Text style={[styles.alertTime, { color: colors.tertiary }]}>{isEnglish ? 'Now' : 'Agora'}</Text>
        </View>
        <Text style={[styles.emptyHint, { color: colors.tertiary }]}>{isEnglish ? 'You are all caught up.' : 'Você está em dia.'}</Text>
      </View>
      <Text style={[styles.footer, { color: colors.tertiary }]}>{isEnglish ? 'Quiet signals, when they matter.' : 'Sinais silenciosos, quando importam.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 28, justifyContent: 'space-between' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  content: { transform: [{ translateY: -40 }] },
  alertLine: { flexDirection: 'row', gap: 12, borderLeftWidth: 2, paddingLeft: 14, minHeight: 68 },
  alertCopy: { flex: 1, gap: 6 },
  alertTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  alertText: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  alertTime: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  emptyHint: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 32 },
  footer: { fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center' },
});