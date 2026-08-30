import React, { useCallback, useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { useSSO } from '@clerk/expo';
import { router } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { OrbBrand } from '@/components/OrbBrand';
import { OrbPreferenceControls } from '@/components/OrbPreferenceControls';
import { useColors } from '@/hooks/useColors';

WebBrowser.maybeCompleteAuthSession();

function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

export default function LoginScreen() {
  useWarmUpBrowser();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { startSSOFlow } = useSSO();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogle = useCallback(async () => {
    setLoading(true);
    setError('');
    await Haptics.selectionAsync();
    try {
      const redirectUrl = Platform.OS === 'web'
        ? AuthSession.makeRedirectUri()
        : AuthSession.makeRedirectUri({
            scheme: 'orb-mobile',
            path: 'oauth-native',
          });
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl,
      });

      if (!createdSessionId || !setActive) {
        throw new Error('Não foi possível concluir a autenticação.');
      }
      await setActive({ session: createdSessionId });
      router.replace('/onboarding' as never);
    } catch (caughtError) {
      console.error('Orb Google sign-in failed', caughtError);
      const message = caughtError instanceof Error ? caughtError.message : '';
      setError(message.toLowerCase().includes('oauth') ? 'O Google não concluiu o retorno. Confira o provedor Google no Auth e tente novamente.' : 'Não foi possível entrar agora. Tente novamente.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [startSSOFlow]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 26, paddingBottom: insets.bottom + 18 }]}>
      <View style={styles.topLine}>
        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>ORB / STAGE</Text>
        <OrbPreferenceControls compact />
      </View>

      <View style={styles.center}>
        <OrbBrand />
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>Sua análise pessoal, única e profunda.</Text>
        <View style={styles.rule} />
        <Pressable
          testID="google-sign-in"
          accessibilityRole="button"
          accessibilityLabel="Entrar com Google"
          onPress={handleGoogle}
          disabled={loading}
          style={({ pressed }) => [
            styles.googleButton,
            { borderColor: colors.border, backgroundColor: colors.card },
            pressed && styles.pressed,
            loading && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.foreground} />
          ) : (
            <>
              <View style={[styles.googleMark, { borderColor: colors.border }]}>
                <Text style={[styles.googleG, { color: colors.accent }]}>G</Text>
              </View>
              <Text style={[styles.googleText, { color: colors.foreground }]}>Entrar com Google</Text>
              <Feather name="arrow-up-right" size={17} color={colors.mutedForeground} />
            </>
          )}
        </Pressable>
        {error ? (
          <View style={[styles.errorLine, { borderColor: colors.destructive }]}>
            <Feather name="alert-circle" size={15} color={colors.destructive} />
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.terms, { color: colors.tertiary }]}>
        Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 28, justifyContent: 'space-between' },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.8 },
  version: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1 },
  center: { alignItems: 'center', width: '100%', transform: [{ translateY: -16 }] },
  tagline: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, marginTop: 18, textAlign: 'center' },
  rule: { height: 1, width: '100%', marginVertical: 36 },
  googleButton: { minHeight: 54, width: '100%', borderWidth: 1, borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  googleMark: { width: 24, height: 24, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  googleG: { fontFamily: 'Inter_700Bold', fontSize: 14 },
  googleText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15, marginLeft: 12 },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.5 },
  errorLine: { width: '100%', borderLeftWidth: 2, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 13, flex: 1 },
  terms: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center', paddingHorizontal: 8 },
});