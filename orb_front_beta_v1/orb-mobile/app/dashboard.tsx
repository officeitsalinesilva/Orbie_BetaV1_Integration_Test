import React, { useEffect, useRef, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth, useUser } from '@clerk/expo';
import {
  Animated,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrbBrand } from '@/components/OrbBrand';
import { useOrb } from '@/context/OrbContext';
import { useColors } from '@/hooks/useColors';

type EnergyLevel = {
  value: string;
  name: string;
  description: string;
  trackPosition: number;
};

const energyLevels: EnergyLevel[] = [
  { value: '20', name: 'Vergonha', description: 'Humilhação, baixa autoestima, miséria.', trackPosition: 416 },
  { value: '30', name: 'Culpa', description: 'Culpa, remorso, autodestruição.', trackPosition: 390 },
  { value: '50', name: 'Apatia', description: 'Desesperança, desamparo, desânimo.', trackPosition: 364 },
  { value: '75', name: 'Luto', description: 'Tristeza, arrependimento, perda.', trackPosition: 338 },
  { value: '100', name: 'Medo', description: 'Ansiedade, insegurança, retraimento.', trackPosition: 312 },
  { value: '125', name: 'Desejo', description: 'Vício, dependência, escravidão.', trackPosition: 286 },
  { value: '150', name: 'Raiva', description: 'Ódio, agressividade, hostilidade.', trackPosition: 260 },
  { value: '175', name: 'Orgulho', description: 'Desdém, dignidade, exigência.', trackPosition: 234 },
  { value: '200', name: 'Coragem', description: 'Afirmação, empoderamento, o primeiro ponto de despertar.', trackPosition: 208 },
  { value: '250', name: 'Neutralidade', description: 'Confiança, segurança, libertação.', trackPosition: 182 },
  { value: '310', name: 'Disposição', description: 'Otimismo, intenção, esperança.', trackPosition: 156 },
  { value: '350', name: 'Aceitação', description: 'Perdão, transcendência, harmonia. Segundo ponto de despertar.', trackPosition: 130 },
  { value: '400', name: 'Razão', description: 'Compreensão, racionalidade, significado.', trackPosition: 104 },
  { value: '500', name: 'Amor', description: 'Reverência, revelação, benevolência.', trackPosition: 78 },
  { value: '540', name: 'Alegria', description: 'Serenidade, compaixão, transfiguração.', trackPosition: 52 },
  { value: '600', name: 'Paz', description: 'Bem-aventurança, iluminação, perfeição.', trackPosition: 26 },
  { value: '700+', name: 'Iluminação', description: 'Consciência pura, inefável.', trackPosition: 0 },
];

const weekday = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'][new Date().getDay()];

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, preferences } = useOrb();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<EnergyLevel | null>(null);
  const menuProgress = useRef(new Animated.Value(0)).current;
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const copy = preferences.language === 'en' ? {
    data: 'Data',
    today: 'Your awareness today',
    alchemy: 'Alchemy indices today',
    presence: 'Productivity panorama today',
    projection: 'Projection of the day',
    profile: 'Profile',
    wallet: 'Wallet',
    notifications: 'Notifications',
    backup: 'Data backup',
    menu: 'Menu',
    logout: 'Log out',
  } : {
    data: 'Data',
    today: 'Sua consciência hoje',
    alchemy: 'Índices alquímicos hoje',
    presence: 'Panorama de produtividade hoje',
    projection: 'Projeção do dia',
    profile: 'Perfil',
    wallet: 'Carteira',
    notifications: 'Notificações',
    backup: 'Backup de dados',
    menu: 'Menu',
    logout: 'Sair',
  };

  useEffect(() => {
    if (!profile) router.replace('/onboarding' as never);
  }, [profile]);

  if (!profile) return null;

  const name = profile.preferredName || profile.fullName.split(' ')[0];
  const avatarLetter = (user?.firstName || name || 'O').slice(0, 1).toUpperCase();
  const avatarUrl = user?.imageUrl;
  const pageWidth = Math.min(350, Math.max(268, viewportWidth - 40));
  const carouselHeight = Math.max(400, Math.min(560, viewportHeight - insets.top - insets.bottom - 170));
  const openMenu = () => {
    menuProgress.setValue(0);
    setMenuOpen(true);
    requestAnimationFrame(() => {
      Animated.timing(menuProgress, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };
  const closeMenu = (after?: () => void) => {
    Animated.timing(menuProgress, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setMenuOpen(false);
      after?.();
    });
  };
  const open = (path: '/profile' | '/wallet' | '/notifications') => {
    closeMenu(() => router.push(path as never));
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      closeMenu(() => router.replace('/login' as never));
    } catch {
      closeMenu();
    }
  };
  const onCarouselScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(event.nativeEvent.contentOffset.x / pageWidth));
  };
  const activePageTitle = [copy.today, copy.alchemy, copy.presence, copy.projection][page];
  const carouselSidePadding = Math.max(0, (viewportWidth - 40 - pageWidth) / 2);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.fixedHeader, { paddingTop: insets.top + 10, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <View style={styles.primaryHeader}>
          <View style={styles.headerCenter}>
            <OrbBrand compact />
          </View>
          <Pressable testID="dashboard-avatar" accessibilityLabel={copy.menu} onPress={openMenu} hitSlop={8} style={({ pressed }) => [styles.avatar, { backgroundColor: colors.accent }, pressed && styles.pressed]}>
            {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatarImage} /> : <Text style={[styles.avatarText, { color: colors.accentForeground }]}>{avatarLetter}</Text>}
          </Pressable>
        </View>
      </View>

      <View style={[styles.body, { paddingTop: insets.top + 74, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.content}>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>ORB / STAGE</Text>
              <Text style={[styles.title, { color: colors.foreground }]}>{copy.data}</Text>
            </View>
            <Text style={[styles.day, { color: colors.mutedForeground }]}>{weekday}</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{activePageTitle}</Text>

          <ScrollView
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            snapToInterval={pageWidth}
            onMomentumScrollEnd={onCarouselScroll}
            style={[styles.carousel, { height: carouselHeight }]}
            contentContainerStyle={[styles.carouselContent, { paddingHorizontal: carouselSidePadding }]}
          >
             <EnergyPage colors={colors} width={pageWidth} height={carouselHeight} selectedLevel={selectedLevel} onInfo={setSelectedLevel} onClear={() => setSelectedLevel(null)} />
             <AlchemyPage colors={colors} width={pageWidth} height={carouselHeight} />
             <PresencePage colors={colors} width={pageWidth} height={carouselHeight} copy={copy} />
             <ProjectionPage colors={colors} width={pageWidth} height={carouselHeight} copy={copy} />
          </ScrollView>
          <View style={styles.dots}>
            {[0, 1, 2, 3].map((dot) => <View key={dot} style={[styles.dot, { backgroundColor: dot === page ? colors.accent : colors.border }, dot === page && styles.activeDot]} />)}
          </View>
        </View>
      </View>

      <Modal visible={menuOpen} transparent animationType="none" onRequestClose={() => closeMenu()}>
        <View style={styles.menuModal}>
          <Pressable style={styles.menuDismiss} onPress={() => closeMenu()} />
          <Animated.View style={[styles.sideMenu, { backgroundColor: colors.background, borderLeftColor: colors.border, paddingTop: insets.top + 22, paddingBottom: insets.bottom + 22, transform: [{ translateX: menuProgress.interpolate({ inputRange: [0, 1], outputRange: [340, 0] }) }] }]}>
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: colors.foreground }]}>{copy.menu}</Text>
              <Pressable onPress={() => closeMenu()} hitSlop={10}><Feather name="x" size={20} color={colors.foreground} /></Pressable>
            </View>
            <Text style={[styles.menuEyebrow, { color: colors.mutedForeground }]}>{name}</Text>
            <MenuRow label={copy.profile} icon="user" colors={colors} onPress={() => open('/profile')} />
            <MenuRow label={copy.wallet} icon="credit-card" colors={colors} onPress={() => open('/wallet')} />
            <MenuRow label={copy.notifications} icon="bell" colors={colors} badge onPress={() => open('/notifications')} />
            <MenuRow label={copy.backup} icon="upload-cloud" colors={colors} onPress={() => open('/profile')} />
            <View style={[styles.menuFooter, { borderTopColor: colors.border }]}>
              <Text style={[styles.menuEyebrow, { color: colors.mutedForeground }]}>{preferences.language === 'en' ? 'Preferences are in your profile' : 'Preferências ficam no seu perfil'}</Text>
            </View>
            <MenuRow label={copy.logout} icon="log-out" colors={colors} onPress={handleSignOut} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function EnergyPage({
  colors,
  width,
  height,
  selectedLevel,
  onInfo,
  onClear,
}: {
  colors: ReturnType<typeof useColors>;
  width: number;
  height: number;
  selectedLevel: EnergyLevel | null;
  onInfo: (level: EnergyLevel) => void;
  onClear: () => void;
}) {
  const orderedLevels = [...energyLevels].reverse();
  return (
    <View style={[styles.page, { width, height }]}>
      <View style={styles.energyHeader}>
        <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>ESCALA LOGARÍTMICA</Text>
        <Text style={[styles.energyScore, { color: colors.foreground }]}>350</Text>
      </View>
      <ScrollView
        style={[styles.scaleViewport, { height: Math.max(220, height - 180) }]}
        contentContainerStyle={styles.scaleScrollContent}
        showsVerticalScrollIndicator
        scrollEventThrottle={16}
      >
        <View style={[styles.scaleRail, { backgroundColor: colors.muted }]} />
        {orderedLevels.map((level, index) => {
          const markerColor = index < 4 ? colors.silver : index < 10 ? colors.accent : colors.primary;
          const lineWidth = Math.max(18, 54 - index * 2.2);
          return (
            <Pressable
              key={level.value}
              accessibilityRole="button"
              accessibilityLabel={`${level.value}, ${level.name}`}
              onPress={() => onInfo(level)}
              style={({ pressed }) => [
                styles.scaleMarker,
                { top: level.trackPosition },
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.markerDot, { backgroundColor: markerColor, borderColor: colors.background }]} />
              <Text style={[styles.scaleValue, { color: colors.mutedForeground }]}>{level.value}</Text>
              <View style={[styles.markerLine, { backgroundColor: colors.border, width: lineWidth }]} />
              <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.scaleName, { color: colors.foreground }]}>{level.name}</Text>
              {level.value === '350' ? <View style={[styles.currentMark, { backgroundColor: colors.accent }]} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
      {selectedLevel ? (
        <View style={[styles.infoInline, { borderTopColor: colors.border }]}>
          <View style={styles.infoInlineHeader}>
            <Text style={[styles.infoValue, { color: colors.accent }]}>{selectedLevel.value}</Text>
            <Pressable accessibilityLabel="Fechar informação" onPress={onClear} hitSlop={10} style={({ pressed }) => [styles.infoClose, pressed && styles.pressed]}>
              <Feather name="x" size={17} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <Text style={[styles.infoName, { color: colors.foreground }]}>{selectedLevel.name}</Text>
          <Text style={[styles.infoDescription, { color: colors.mutedForeground }]}>{selectedLevel.description}</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.pageCaption, { color: colors.foreground }]}>Sua consciência hoje</Text>
          <Text style={[styles.pageBody, { color: colors.mutedForeground }]}>A leitura combina presença, intenção e os sinais que atravessam o seu dia.</Text>
        </>
      )}
    </View>
  );
}

function AlchemyPage({ colors, width, height }: { colors: ReturnType<typeof useColors>; width: number; height: number }) {
  const metrics = [['água', 64], ['ar', 48], ['terra', 71], ['fogo', 56]] as const;
  return (
    <View style={[styles.page, { width, height }]}>
      <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>ELEMENTOS</Text>
      <Text style={[styles.chartTitle, { color: colors.foreground }]}>Níveis alquímicos</Text>
      <View style={styles.metricBars}>
        {metrics.map(([label, value]) => (
          <View key={label} style={styles.metricBarRow}>
            <View style={styles.metricLabelRow}>
              <Text style={[styles.metricLabel, { color: colors.foreground }]}>{label}</Text>
              <Text style={[styles.metricValue, { color: colors.mutedForeground }]}>{value}%</Text>
            </View>
            <View style={[styles.track, { backgroundColor: colors.muted }]}>
              <View style={[styles.fill, { backgroundColor: value > 60 ? colors.silver : colors.accent, width: `${value}%` }]} />
            </View>
          </View>
        ))}
      </View>
      <Text style={[styles.pageCaption, { color: colors.foreground }]}>Índices alquímicos hoje</Text>
      <Text style={[styles.pageBody, { color: colors.mutedForeground }]}>Um retrato de como você distribui energia, movimento e estabilidade.</Text>
    </View>
  );
}

function PresencePage({ colors, width, height, copy }: { colors: ReturnType<typeof useColors>; width: number; height: number; copy: { presence: string } }) {
  const metrics = [['Foco', 72], ['Descanso', 61], ['Físico', 83]] as const;
  return (
    <View style={[styles.page, { width, height }]}>
      <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>PRESENÇA</Text>
      <View style={styles.discRow}>
        {metrics.map(([label, value]) => <MetricDisc key={label} label={label} value={value} colors={colors} />)}
      </View>
      <View style={[styles.suggestion, { borderLeftColor: colors.accent }]}>
        <Feather name="compass" size={16} color={colors.accent} />
        <Text style={[styles.suggestionText, { color: colors.foreground }]}>Hoje, reserve 30 min para leitura e movimento.</Text>
      </View>
      <Text style={[styles.pageCaption, { color: colors.foreground }]}>{copy.presence}</Text>
      <Text style={[styles.pageBody, { color: colors.mutedForeground }]}>Foco, descanso e corpo em um mesmo panorama de produtividade.</Text>
    </View>
  );
}

function ProjectionPage({ colors, width, height, copy }: { colors: ReturnType<typeof useColors>; width: number; height: number; copy: { projection: string } }) {
  return (
    <View style={[styles.page, { width, height }]}>
      <Text style={[styles.cardKicker, { color: colors.mutedForeground }]}>RITMO DO DIA</Text>
      <View style={styles.projectionHeader}>
        <Text style={[styles.projectionMood, { color: colors.foreground }]}>A favor</Text>
        <Text style={[styles.projectionScore, { color: colors.accent }]}>78%</Text>
      </View>
      <View style={[styles.moodScale, { backgroundColor: colors.muted }]}>
        <View style={[styles.moodFill, { backgroundColor: colors.accent, width: '78%' }]} />
        <View style={[styles.moodPointer, { backgroundColor: colors.background, borderColor: colors.accent, left: '78%' }]} />
      </View>
      <Text style={[styles.projectionText, { color: colors.mutedForeground }]}>O dia rende melhor entre 09:30 e 12:00. Proteja esse intervalo de interrupções.</Text>
      <Text style={[styles.pageCaption, { color: colors.foreground }]}>{copy.projection}</Text>
    </View>
  );
}

function MetricDisc({ label, value, colors }: { label: string; value: number; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.discBlock}>
      <View style={[styles.disc, { borderColor: colors.border }]}>
        <View style={[styles.discArc, { borderColor: colors.accent, transform: [{ rotate: `${(value / 100) * 220 - 110}deg` }] }]} />
        <Text style={[styles.discValue, { color: colors.foreground }]}>{value}%</Text>
      </View>
      <Text style={[styles.discLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function MenuRow({ label, icon, colors, badge, onPress }: { label: string; icon: keyof typeof Feather.glyphMap; colors: ReturnType<typeof useColors>; badge?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuRow, { borderBottomColor: colors.border }, pressed && styles.pressed]}>
      <Feather name={icon} size={18} color={colors.accent} />
      <Text style={[styles.menuRowText, { color: colors.foreground }]}>{label}</Text>
      {badge ? <View style={[styles.menuBadge, { backgroundColor: colors.destructive }]} /> : null}
      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  fixedHeader: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 5, borderBottomWidth: 1, paddingHorizontal: 22 },
  primaryHeader: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: 40, height: 40 },
  avatarText: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  headerCenter: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  body: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.8, marginBottom: 10 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 34, letterSpacing: -1.2 },
  day: { fontFamily: 'Inter_500Medium', fontSize: 12, marginBottom: 5, textTransform: 'capitalize' },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, marginTop: 10 },
  carousel: { flexShrink: 0, marginTop: 10 },
  carouselContent: { alignItems: 'flex-start' },
  page: { paddingTop: 14, paddingRight: 12 },
  cardKicker: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5 },
  energyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  energyScore: { fontFamily: 'Inter_600SemiBold', fontSize: 30, marginTop: -10 },
  scaleViewport: { marginTop: 14, flexGrow: 0 },
  scaleScrollContent: { height: 440, position: 'relative' },
  scaleRail: { position: 'absolute', left: 6, top: 14, bottom: 14, width: 2, borderRadius: 1 },
  scaleMarker: { position: 'absolute', left: 0, right: 0, height: 24, flexDirection: 'row', alignItems: 'center', paddingRight: 2 },
  markerDot: { width: 11, height: 11, borderRadius: 6, borderWidth: 2 },
  scaleValue: { width: 42, marginLeft: 12, fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 0.3 },
  markerLine: { height: 1, marginLeft: 8, marginRight: 10 },
  scaleName: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, letterSpacing: -0.1 },
  currentMark: { width: 4, height: 4, borderRadius: 2, marginLeft: 6 },
  pageCaption: { fontFamily: 'Inter_600SemiBold', fontSize: 20, marginTop: 16, letterSpacing: -0.4 },
  pageBody: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, marginTop: 8, maxWidth: 300 },
  infoInline: { borderTopWidth: 1, marginTop: 24, paddingTop: 16, paddingBottom: 8 },
  infoInlineHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoClose: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  infoValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13, letterSpacing: 1 },
  infoName: { fontFamily: 'Inter_600SemiBold', fontSize: 26, marginTop: 5, letterSpacing: -0.6 },
  infoDescription: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, marginTop: 8 },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 30 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  activeDot: { width: 18, borderRadius: 3 },
  metricBars: { gap: 20, marginTop: 28 },
  metricBarRow: { gap: 8 },
  metricLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricLabel: { fontFamily: 'Inter_500Medium', fontSize: 14, textTransform: 'capitalize' },
  metricValue: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  chartTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 24, marginTop: 16, letterSpacing: -0.6 },
  discRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 27 },
  discBlock: { alignItems: 'center', gap: 10 },
  disc: { width: 82, height: 82, borderRadius: 41, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  discArc: { position: 'absolute', width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderLeftColor: 'transparent', borderBottomColor: 'transparent' },
  discValue: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  discLabel: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  suggestion: { flexDirection: 'row', gap: 10, borderLeftWidth: 2, paddingLeft: 12, marginTop: 30, maxWidth: 290 },
  suggestionText: { fontFamily: 'Inter_500Medium', fontSize: 13, lineHeight: 19, flex: 1 },
  projectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 44 },
  projectionMood: { fontFamily: 'Inter_600SemiBold', fontSize: 30, letterSpacing: -1 },
  projectionScore: { fontFamily: 'Inter_600SemiBold', fontSize: 32 },
  moodScale: { height: 8, borderRadius: 4, marginTop: 28, position: 'relative' },
  moodFill: { height: 8, borderRadius: 4 },
  moodPointer: { position: 'absolute', top: -4, width: 16, height: 16, borderRadius: 8, borderWidth: 2, marginLeft: -8 },
  projectionText: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23, marginTop: 30, maxWidth: 300 },
  pressed: { opacity: 0.58 },
  menuModal: { flex: 1, flexDirection: 'row' },
  menuDismiss: { flex: 1 },
  sideMenu: { width: '82%', borderLeftWidth: 1, paddingHorizontal: 26 },
  menuHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  menuTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 25, letterSpacing: -0.6 },
  menuEyebrow: { fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 },
  menuRow: { minHeight: 57, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuRowText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 15 },
  menuBadge: { width: 6, height: 6, borderRadius: 3, marginRight: 2 },
  menuFooter: { borderTopWidth: 1, marginTop: 28, paddingTop: 20 },
});