import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useOrb, OrbTheme } from '@/context/OrbContext';
import { useColors } from '@/hooks/useColors';

export function OrbPreferenceControls({ compact = false }: { compact?: boolean }) {
  const colors = useColors();
  const { preferences, savePreferences } = useOrb();
  const isDark = preferences.theme === 'dark';

  const chooseTheme = (theme: OrbTheme) => {
    void savePreferences({ theme });
  };

  return (
    <View style={[styles.controls, compact && styles.compactControls, { borderColor: colors.border, backgroundColor: colors.background }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        onPress={() => chooseTheme(isDark ? 'light' : 'dark')}
        hitSlop={8}
        style={({ pressed }) => [styles.control, pressed && styles.pressed]}
      >
        <Feather name={isDark ? 'moon' : 'sun'} size={compact ? 13 : 16} color={colors.foreground} />
      </Pressable>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={preferences.language === 'pt-BR' ? 'Mudar para inglês' : 'Mudar para português'}
        onPress={() => void savePreferences({ language: preferences.language === 'pt-BR' ? 'en' : 'pt-BR' })}
        hitSlop={8}
        style={({ pressed }) => [styles.language, pressed && styles.pressed]}
      >
        <Text style={[styles.languageText, { color: colors.foreground }]}>{preferences.language === 'pt-BR' ? 'PT' : 'EN'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 999, minHeight: 38, paddingHorizontal: 6 },
  compactControls: { minHeight: 30, paddingHorizontal: 4 },
  control: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  language: { minWidth: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  languageText: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 0.5 },
  divider: { width: 1, height: 16 },
  pressed: { opacity: 0.55 },
});