import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@clerk/expo';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrbPreferenceControls } from '@/components/OrbPreferenceControls';
import { useOrb, OrbTheme } from '@/context/OrbContext';
import { useColors } from '@/hooks/useColors';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { profile, preferences, savePreferences } = useOrb();
  const [syncing, setSyncing] = useState(false);
  const isEnglish = preferences.language === 'en';
  const name = profile?.preferredName || profile?.fullName || user?.firstName || 'Orb';

  const chooseTheme = (theme: OrbTheme) => void savePreferences({ theme });

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Feather name="arrow-left" size={20} color={colors.foreground} /></Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{isEnglish ? 'Profile' : 'Perfil'}</Text>
        <OrbPreferenceControls compact />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        <View style={styles.content}>
          <View style={styles.identity}>
            {user?.imageUrl ? <Image source={{ uri: user.imageUrl }} style={[styles.profileImage, { backgroundColor: colors.accent }]} /> : <View style={[styles.profileImage, { backgroundColor: colors.accent }]}><Text style={[styles.profileInitial, { color: colors.accentForeground }]}>{name.slice(0, 1).toUpperCase()}</Text></View>}
            <Text style={[styles.name, { color: colors.foreground }]}>{name}</Text>
            <Text style={[styles.email, { color: colors.mutedForeground }]}>{user?.primaryEmailAddress?.emailAddress || 'Google account'}</Text>
          </View>

          <SectionLabel label={isEnglish ? 'APPEARANCE' : 'APARÊNCIA'} colors={colors} />
          <PreferenceLine label={isEnglish ? 'Theme' : 'Tema'} detail={preferences.theme === 'light' ? (isEnglish ? 'Light' : 'Claro') : preferences.theme === 'dark' ? (isEnglish ? 'Dark' : 'Escuro') : (isEnglish ? 'Automatic' : 'Automático')} colors={colors}>
            <Switch value={preferences.theme === 'dark'} onValueChange={(value) => chooseTheme(value ? 'dark' : 'light')} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={colors.background} />
          </PreferenceLine>
          <View style={styles.themeChoices}>
            {(['light', 'dark', 'automatic'] as OrbTheme[]).map((theme) => (
              <Pressable key={theme} onPress={() => chooseTheme(theme)} style={[styles.themeChoice, { borderBottomColor: preferences.theme === theme ? colors.accent : colors.border }]}>
                <Text style={[styles.themeChoiceText, { color: preferences.theme === theme ? colors.accent : colors.mutedForeground }]}>{theme === 'light' ? (isEnglish ? 'Light' : 'Claro') : theme === 'dark' ? (isEnglish ? 'Dark' : 'Escuro') : (isEnglish ? 'Auto' : 'Auto')}</Text>
              </Pressable>
            ))}
          </View>

          <SectionLabel label={isEnglish ? 'LANGUAGE' : 'IDIOMA'} colors={colors} />
          <PreferenceLine label={isEnglish ? 'App language' : 'Idioma do app'} detail={isEnglish ? 'English' : 'Português'} colors={colors}>
            <OrbPreferenceControls compact />
          </PreferenceLine>

          <SectionLabel label={isEnglish ? 'DATA BACKUP' : 'BACKUP DE DADOS'} colors={colors} />
          <View style={[styles.backupLine, { borderBottomColor: colors.border }]}>
            <View style={[styles.driveMark, { borderColor: colors.border }]}><Feather name="hard-drive" size={17} color={colors.accent} /></View>
            <View style={styles.backupCopy}>
              <Text style={[styles.preferenceLabel, { color: colors.foreground }]}>Google Drive</Text>
              <Text style={[styles.preferenceDetail, { color: colors.mutedForeground }]}>{isEnglish ? 'JSON copy ready for secure sync' : 'Cópia JSON pronta para sincronização segura'}</Text>
            </View>
            <Text style={[styles.pending, { color: colors.tertiary }]}>{isEnglish ? 'Pending' : 'Aguardando'}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setSyncing(true);
              setTimeout(() => setSyncing(false), 700);
            }}
            style={({ pressed }) => [styles.syncButton, { borderColor: colors.border }, pressed && styles.pressed]}
          >
            <Feather name="upload-cloud" size={16} color={colors.accent} />
            <Text style={[styles.syncText, { color: colors.foreground }]}>{syncing ? (isEnglish ? 'Preparing JSON…' : 'Preparando JSON…') : (isEnglish ? 'Prepare backup' : 'Preparar backup')}</Text>
          </Pressable>
          <Text style={[styles.backupNote, { color: colors.tertiary }]}>{isEnglish ? 'Your profile remains local first. Drive is an additional backup.' : 'Seu perfil continua local primeiro. O Drive será um backup adicional.'}</Text>

          <Pressable onPress={() => router.replace('/login' as never)} style={({ pressed }) => [styles.logout, { borderTopColor: colors.border }, pressed && styles.pressed]}>
            <Feather name="log-out" size={17} color={colors.destructive} />
            <Text style={[styles.logoutText, { color: colors.destructive }]}>{isEnglish ? 'Sign out' : 'Sair da conta'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ label, colors }: { label: string; colors: ReturnType<typeof useColors> }) {
  return <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{label}</Text>;
}

function PreferenceLine({ label, detail, colors, children }: { label: string; detail: string; colors: ReturnType<typeof useColors>; children: React.ReactNode }) {
  return (
    <View style={[styles.preferenceLine, { borderBottomColor: colors.border }]}>
      <View style={styles.preferenceCopy}>
        <Text style={[styles.preferenceLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.preferenceDetail, { color: colors.mutedForeground }]}>{detail}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { paddingHorizontal: 24, paddingBottom: 17, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  content: { paddingHorizontal: 28 },
  identity: { alignItems: 'center', paddingVertical: 35 },
  profileImage: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  profileInitial: { fontFamily: 'Inter_600SemiBold', fontSize: 26 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 25, marginTop: 16 },
  email: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 6 },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5, marginTop: 22, marginBottom: 7 },
  preferenceLine: { minHeight: 64, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  preferenceCopy: { flex: 1, gap: 4 },
  preferenceLabel: { fontFamily: 'Inter_500Medium', fontSize: 15 },
  preferenceDetail: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 18 },
  themeChoices: { flexDirection: 'row', gap: 22, paddingVertical: 13 },
  themeChoice: { minWidth: 60, borderBottomWidth: 2, paddingBottom: 7 },
  themeChoiceText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  backupLine: { minHeight: 74, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 13 },
  driveMark: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  backupCopy: { flex: 1, gap: 4 },
  pending: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  syncButton: { minHeight: 50, borderWidth: 1, borderRadius: 8, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  syncText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  backupNote: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginTop: 12 },
  logout: { minHeight: 61, borderTopWidth: 1, marginTop: 31, flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoutText: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  pressed: { opacity: 0.58 },
});