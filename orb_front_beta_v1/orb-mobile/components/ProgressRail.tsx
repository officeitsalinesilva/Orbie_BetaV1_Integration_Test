import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

type Props = {
  step: number;
  total: number;
};

export function ProgressRail({ step, total }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrapper} accessibilityLabel={`Etapa ${step} de ${total}`}>
      <View style={styles.meta}>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>PERFIL</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {String(step).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View style={[styles.fill, { width: `${(step / total) * 100}%`, backgroundColor: colors.accent }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  caption: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.5 },
  count: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1 },
  track: { height: 2, overflow: 'hidden' },
  fill: { height: 2 },
});