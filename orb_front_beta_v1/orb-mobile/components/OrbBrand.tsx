import { Circle, Path, Svg } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

type Props = {
  compact?: boolean;
};

export function OrbBrand({ compact = false }: Props) {
  const colors = useColors();
  const size = compact ? 30 : 74;

  return (
    <View style={styles.brand}>
      <Svg width={size} height={size} viewBox="0 0 80 80" accessibilityLabel="Orb">
        <Circle cx="40" cy="40" r="29" fill="none" stroke={colors.accent} strokeWidth="1.6" />
        <Circle cx="40" cy="40" r="17" fill="none" stroke={colors.accent} strokeWidth="1" opacity={0.7} />
        <Path d="M11 40h58M40 11c11 8 17 18 17 29S51 61 40 69M40 11C29 19 23 29 23 40s6 21 17 29" fill="none" stroke={colors.accent} strokeWidth="1" opacity={0.7} />
        <Path d="M19 19c18 7 31 21 42 42" fill="none" stroke={colors.accent} strokeWidth="1.8" />
      </Svg>
      {!compact && <Text style={[styles.wordmark, { color: colors.foreground }]}>orb</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    gap: 10,
  },
  wordmark: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    letterSpacing: -1.8,
  },
});