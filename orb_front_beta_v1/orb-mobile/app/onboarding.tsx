import React, { useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { OrbBrand } from '@/components/OrbBrand';
import { ProgressRail } from '@/components/ProgressRail';
import { OrbLanguage, OrbProfile, OrbTheme, useOrb } from '@/context/OrbContext';
import { useColors } from '@/hooks/useColors';

const TOTAL_STEPS = 6;
const currentYear = new Date().getFullYear();

function Field({
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType = 'default',
  maxLength,
  flex,
}: {
  label?: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'number-pad';
  maxLength?: number;
  flex?: number;
}) {
  const colors = useColors();
  return (
    <View style={[styles.fieldBlock, flex ? { flex } : null]}>
      {label ? <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.tertiary}
        keyboardType={keyboardType}
        maxLength={maxLength}
        style={[styles.input, { color: colors.foreground, borderBottomColor: colors.border }]}
      />
    </View>
  );
}

function ChoiceRow({
  label,
  active,
  onPress,
  detail,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  detail?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceRow,
        { borderBottomColor: active ? colors.accent : colors.border },
        pressed && { opacity: 0.65 },
      ]}
    >
      <View style={[styles.radio, { borderColor: active ? colors.accent : colors.border }]}>
        {active ? <View style={[styles.radioDot, { backgroundColor: colors.accent }]} /> : null}
      </View>
      <View style={styles.choiceCopy}>
        <Text style={[styles.choiceLabel, { color: colors.foreground }]}>{label}</Text>
        {detail ? <Text style={[styles.choiceDetail, { color: colors.mutedForeground }]}>{detail}</Text> : null}
      </View>
      {active ? <Feather name="check" size={17} color={colors.accent} /> : null}
    </Pressable>
  );
}

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, preferences, saveProfile } = useOrb();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<OrbProfile>(
    profile ?? {
      fullName: '',
      preferredName: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      birthHour: '',
      birthMinute: '',
      noExactTime: false,
      birthCountry: '',
      birthState: '',
      birthCity: '',
      timezone: 'UTC -3 (Brasília)',
       theme: preferences.theme,
       language: preferences.language,
      dailySynthesis: true,
      synthesisHour: '08:00',
    },
  );

  const title = useMemo(() => {
    const titles = [
      ['Como devemos chamar você?', 'Usado exclusivamente para sua análise.'],
      ['Quando você nasceu?', 'A data dá contexto para a sua leitura individual.'],
      ['Que horas?', 'O horário refina a precisão da sua análise.'],
      ['Onde você nasceu?', 'Usaremos o local apenas para calcular o fuso correto.'],
      ['Suas preferências', 'Você pode ajustar tudo isso depois.'],
      ['Revise seus dados', 'Tudo certo antes de ativar o seu perfil?'],
    ];
    return titles[step - 1];
  }, [step]);

  const update = (patch: Partial<OrbProfile>) => setDraft((current) => ({ ...current, ...patch }));

  const validate = () => {
    if (step === 1 && !draft.fullName.trim()) return 'Digite seu nome completo para continuar.';
    if (step === 2) {
      const day = Number(draft.birthDay);
      const month = Number(draft.birthMonth);
      const year = Number(draft.birthYear);
      if (!day || !month || !year || day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > currentYear) {
        return 'Confira a data de nascimento.';
      }
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return 'Essa data não parece válida.';
    }
    if (step === 3 && !draft.noExactTime) {
      const hour = Number(draft.birthHour);
      const minute = Number(draft.birthMinute);
      if (draft.birthHour.length < 1 || draft.birthMinute.length < 1 || hour > 23 || minute > 59) return 'Confira o horário de nascimento.';
    }
    if (step === 4) {
      if (!draft.birthCountry.trim()) return 'Digite o país de nascimento.';
      if (!draft.birthState.trim()) return 'Digite o estado ou região de nascimento.';
      if (!draft.birthCity.trim()) return 'Digite sua cidade de nascimento.';
    }
    return '';
  };

  const next = async () => {
    const validation = validate();
    if (validation) {
      setError(validation);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setError('');
    await Haptics.selectionAsync();
    if (step < TOTAL_STEPS) setStep((current) => current + 1);
    else {
      setSaving(true);
      await saveProfile(draft);
      await new Promise((resolve) => setTimeout(resolve, 450));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/dashboard' as never);
    }
  };

  const previous = () => {
    setError('');
    if (step > 1) setStep((current) => current - 1);
    else router.back();
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Pressable testID="onboarding-back" onPress={previous} hitSlop={12} style={({ pressed }) => pressed && styles.pressed}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <ProgressRail step={step} total={TOTAL_STEPS} />
        <OrbBrand compact />
      </View>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={styles.scrollContent}
        bottomOffset={90}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>ETAPA {String(step).padStart(2, '0')}</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>{title[0]}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{title[1]}</Text>

        <View style={styles.form}>
          {step === 1 ? (
            <>
              <Field label="Nome completo" value={draft.fullName} placeholder="Nome completo" onChangeText={(value) => update({ fullName: value })} />
              <Field label="Nome atual (opcional)" value={draft.preferredName} placeholder="Como você prefere ser chamado" onChangeText={(value) => update({ preferredName: value })} />
            </>
          ) : null}

          {step === 2 ? (
            <View style={styles.dateRow}>
              <Field label="DIA" value={draft.birthDay} placeholder="DD" keyboardType="number-pad" maxLength={2} onChangeText={(value) => update({ birthDay: value.replace(/\D/g, '') })} flex={1} />
              <Field label="MÊS" value={draft.birthMonth} placeholder="MM" keyboardType="number-pad" maxLength={2} onChangeText={(value) => update({ birthMonth: value.replace(/\D/g, '') })} flex={1} />
              <Field label="ANO" value={draft.birthYear} placeholder="AAAA" keyboardType="number-pad" maxLength={4} onChangeText={(value) => update({ birthYear: value.replace(/\D/g, '') })} flex={1.5} />
            </View>
          ) : null}

          {step === 3 ? (
            <>
              <View style={styles.timeRow}>
                <Field label="HORA" value={draft.birthHour} placeholder="HH" keyboardType="number-pad" maxLength={2} onChangeText={(value) => update({ birthHour: value.replace(/\D/g, '') })} flex={1} />
                <Text style={[styles.colon, { color: colors.mutedForeground }]}>:</Text>
                <Field label="MINUTO" value={draft.birthMinute} placeholder="MM" keyboardType="number-pad" maxLength={2} onChangeText={(value) => update({ birthMinute: value.replace(/\D/g, '') })} flex={1} />
              </View>
              <View style={[styles.switchRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
                <View style={styles.switchCopy}>
                  <Text style={[styles.choiceLabel, { color: colors.foreground }]}>Não sei minha hora exata</Text>
                  {draft.noExactTime ? <Text style={[styles.choiceDetail, { color: colors.mutedForeground }]}>Sem o horário, parte da sua análise fica incompleta. Você pode adicionar depois.</Text> : null}
                </View>
                <Switch value={draft.noExactTime} onValueChange={(value) => update({ noExactTime: value })} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={colors.background} />
              </View>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <Field label="PAÍS DE NASCIMENTO" value={draft.birthCountry} placeholder="Digite o país" onChangeText={(value) => update({ birthCountry: value })} />
              <Field label="ESTADO OU REGIÃO" value={draft.birthState} placeholder="Digite o estado ou região" onChangeText={(value) => update({ birthState: value })} />
              <Field label="CIDADE DE NASCIMENTO" value={draft.birthCity} placeholder="Digite sua cidade" onChangeText={(value) => update({ birthCity: value })} />
              {draft.birthCity.trim() && draft.birthState.trim() && draft.birthCountry.trim() ? (
                <View style={styles.detectedLine}>
                  <Feather name="check-circle" size={16} color={colors.success} />
                  <Text style={[styles.detectedText, { color: colors.success }]}>Fuso detectado: {draft.timezone}</Text>
                </View>
              ) : null}
            </>
          ) : null}

          {step === 5 ? (
            <>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TEMA</Text>
              <ChoiceRow label="Claro" detail="Fundo branco e texto profundo" active={draft.theme === 'light'} onPress={() => update({ theme: 'light' as OrbTheme })} />
              <ChoiceRow label="Escuro" detail="Preto, prata e contraste baixo" active={draft.theme === 'dark'} onPress={() => update({ theme: 'dark' as OrbTheme })} />
              <ChoiceRow label="Automático" detail="Segue a aparência do aparelho" active={draft.theme === 'automatic'} onPress={() => update({ theme: 'automatic' as OrbTheme })} />
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 32 }]}>IDIOMA</Text>
              <View style={styles.languageRow}>
                <ChoiceRow label="Português" active={draft.language === 'pt-BR'} onPress={() => update({ language: 'pt-BR' as OrbLanguage })} />
                <ChoiceRow label="English" active={draft.language === 'en'} onPress={() => update({ language: 'en' as OrbLanguage })} />
              </View>
              <View style={[styles.switchRow, { borderTopColor: colors.border, borderBottomColor: colors.border, marginTop: 24 }]}>
                <View>
                  <Text style={[styles.choiceLabel, { color: colors.foreground }]}>Síntese diária</Text>
                  <Text style={[styles.choiceDetail, { color: colors.mutedForeground }]}>Uma leitura breve para começar o dia</Text>
                </View>
                <Switch value={draft.dailySynthesis} onValueChange={(value) => update({ dailySynthesis: value })} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={colors.background} />
              </View>
              {draft.dailySynthesis ? (
                <View style={styles.hourRow}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>HORÁRIO</Text>
                  <View style={styles.hourOptions}>
                    {['06:00', '07:00', '08:00', '09:00'].map((hour) => (
                      <Pressable key={hour} onPress={() => update({ synthesisHour: hour })} style={[styles.hourOption, { borderBottomColor: draft.synthesisHour === hour ? colors.accent : colors.border }]}>
                        <Text style={[styles.hourText, { color: draft.synthesisHour === hour ? colors.accent : colors.mutedForeground }]}>{hour}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          ) : null}

          {step === 6 ? (
            <View style={styles.reviewList}>
              <ReviewLine label="Nome" value={draft.preferredName || draft.fullName} />
              <ReviewLine label="Nascimento" value={`${draft.birthDay}/${draft.birthMonth}/${draft.birthYear}`} />
              <ReviewLine label="Horário" value={draft.noExactTime ? 'Não informado' : `${draft.birthHour}:${draft.birthMinute}`} />
              <ReviewLine label="Local" value={`${draft.birthCity} · ${draft.birthState} · ${draft.birthCountry} · ${draft.timezone}`} />
              <ReviewLine label="Preferências" value={`${draft.theme === 'automatic' ? 'Automático' : draft.theme === 'light' ? 'Claro' : 'Escuro'} · ${draft.language === 'pt-BR' ? 'Português' : 'English'}`} />
            </View>
          ) : null}
        </View>

        {error ? (
          <View style={styles.validationLine}>
            <Feather name="alert-circle" size={15} color={colors.destructive} />
            <Text style={[styles.validationText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}
      </KeyboardAwareScrollViewCompat>
      <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: 12 }]}>
        <Pressable
          testID="onboarding-next"
          onPress={next}
          disabled={saving}
          style={({ pressed }) => [
            styles.nextButton,
            { backgroundColor: colors.accent },
            pressed && styles.pressed,
            saving && styles.disabled,
          ]}
        >
          {saving ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={[styles.nextText, { color: colors.primaryForeground }]}>{step === TOTAL_STEPS ? 'Ativar meu perfil' : 'Continuar'}</Text>}
          {!saving && <Feather name="arrow-right" size={17} color={colors.primaryForeground} />}
        </Pressable>
      </View>
    </View>
  );
}

function ReviewLine({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.reviewLine, { borderBottomColor: colors.border }]}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.reviewValue, { color: colors.foreground }]}>{value || '—'}</Text>
      <Feather name="edit-2" size={15} color={colors.mutedForeground} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  scrollContent: { paddingHorizontal: 28, paddingBottom: 28 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.8, marginTop: 10, marginBottom: 16 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 30, lineHeight: 36, letterSpacing: -0.9 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 23, marginTop: 10, maxWidth: 320 },
  form: { marginTop: 42 },
  fieldBlock: { marginBottom: 30 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.4, marginBottom: 10 },
  input: { fontFamily: 'Inter_400Regular', fontSize: 17, minHeight: 44, paddingVertical: 8, borderBottomWidth: 1 },
  dateRow: { flexDirection: 'row', gap: 16 },
  timeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  colon: { fontSize: 20, paddingBottom: 15 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingVertical: 18, borderTopWidth: 1, borderBottomWidth: 1, marginTop: 14 },
  switchCopy: { flex: 1, gap: 6 },
  choiceLabel: { fontFamily: 'Inter_500Medium', fontSize: 15 },
  choiceDetail: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  detectedLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -12, marginBottom: 20 },
  detectedText: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.5, marginBottom: 2 },
  choiceRow: { minHeight: 58, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 13 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  choiceCopy: { flex: 1, gap: 3 },
  languageRow: { gap: 18 },
  hourRow: { marginTop: 26 },
  hourOptions: { flexDirection: 'row', justifyContent: 'space-between' },
  hourOption: { borderBottomWidth: 2, paddingVertical: 10, minWidth: 48, alignItems: 'center' },
  hourText: { fontFamily: 'Inter_500Medium', fontSize: 13 },
  reviewList: { gap: 0 },
  reviewLine: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 14, borderBottomWidth: 1 },
  reviewValue: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14 },
  validationLine: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 22 },
  validationText: { fontFamily: 'Inter_400Regular', fontSize: 13, flex: 1 },
  footer: { paddingHorizontal: 28, paddingTop: 14, borderTopWidth: 1 },
  nextButton: { minHeight: 54, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  nextText: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.5 },
});