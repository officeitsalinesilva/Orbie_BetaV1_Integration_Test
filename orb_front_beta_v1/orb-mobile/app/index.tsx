import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '@clerk/expo';
import { useOrb } from '@/context/OrbContext';
import { useColors } from '@/hooks/useColors';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { profile, hydrated } = useOrb();
  const colors = useColors();

  if (!isLoaded || !hydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!isSignedIn) return <Redirect href={'/login' as never} />;
  if (!profile) return <Redirect href={'/onboarding' as never} />;
  return <Redirect href={'/dashboard' as never} />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});