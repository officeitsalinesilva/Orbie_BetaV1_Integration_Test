/**
 * ==============================================================================
 * ORB REGIONAL PRICING & PURCHASING POWER PARITY (PPP) ENGINE
 * ==============================================================================
 * 
 * FÓRMULA MATEMÁTICA:
 * ------------------------------------------------------------------------------
 * PreçoFinal = RoundingRule( Quantidade × PreçoBaseUSD × MultiplicadorRegional )
 * 
 * Sendo:
 * - PreçoBaseUSD = 1.00 USD (Preço Matriz de Referência por Crédito)
 * - Quantidade = Número de créditos adquiridos (Mínimo: 5 créditos)
 * - MultiplicadorRegional = Fator de desconto baseado no Tier de poder de compra:
 *     * Tier 1 (Países Desenvolvidos): Multiplicador = 1.00 (0% desconto)
 *     * Tier 2 (Países de Renda Média): Multiplicador = 0.50 (50% desconto)
 *     * Tier 3 (Países de Baixa Renda):  Multiplicador = 0.30 (70% desconto)
 * 
 * REGRAS DE ARREDONDAMENTO E CONVERSÃO LOCAL:
 * - Brasil (Tier 2): Fixo em R$ 1,00 por crédito (ex: 50 créditos = R$ 50,00).
 * - Outros Tier 2: Preço convertido para moeda local e arredondado para inteiro mais próximo.
 * - Tier 1: USD/EUR/GBP com valores inteiros redondos (1,00 / 5,00 / 50,00).
 * - Tier 3: USD/Moeda local com valores inteiros ou redondos (0,30 / crédito -> 50 = USD 15,00).
 * ==============================================================================
 */

export type PricingTier = 1 | 2 | 3;

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  unitName: string;
  decimalPlaces: number;
}

export interface TierInfo {
  tier: PricingTier;
  label: string;
  namePt: string;
  nameEn: string;
  multiplier: number;
  discountPercent: number;
  badge: string;
  descriptionPt: string;
  descriptionEn: string;
}

export interface CountryPricingProfile {
  countryCode: string;
  countryNamePt: string;
  countryNameEn: string;
  tier: PricingTier;
  currency: CurrencyConfig;
  /** Fixed price per single credit in local currency (if overridden, e.g. BRL = 1.00) */
  fixedUnitRate?: number;
  /** Approximate exchange rate relative to USD */
  usdExchangeRate: number;
}

export interface CalculatedPrice {
  credits: number;
  rawAmountUSD: number;
  tierMultiplier: number;
  discountPercent: number;
  unitPriceLocal: number;
  finalAmount: number;
  formattedAmount: string;
  currency: CurrencyConfig;
  tier: PricingTier;
  isBrazilFixed: boolean;
  savingsUSD: number;
}

// ------------------------------------------------------------------------------
// CONSTANTS & TIERS
// ------------------------------------------------------------------------------
export const BASE_PRICE_USD = 1.00;

export const TIER_DEFINITIONS: Record<PricingTier, TierInfo> = {
  1: {
    tier: 1,
    label: 'Tier 1 - Standard Global',
    namePt: 'Tier 1: Economias Desenvolvidas',
    nameEn: 'Tier 1: Developed Economies',
    multiplier: 1.00,
    discountPercent: 0,
    badge: 'Tier 1',
    descriptionPt: 'Preço matriz de referência internacional (USD 1,00 / crédito).',
    descriptionEn: 'Standard international reference pricing (USD 1.00 / credit).',
  },
  2: {
    tier: 2,
    label: 'Tier 2 - Regional Parity 50%',
    namePt: 'Tier 2: Desconto Regional de Paridade (50%)',
    nameEn: 'Tier 2: Regional Parity Discount (50%)',
    multiplier: 0.50,
    discountPercent: 50,
    badge: '-50% Paridade Regional',
    descriptionPt: 'Ajuste regional de poder de compra com 50% de benefício para renda média.',
    descriptionEn: 'Purchasing power parity adjustment with 50% discount for middle-income regions.',
  },
  3: {
    tier: 3,
    label: 'Tier 3 - Regional Parity 70%',
    namePt: 'Tier 3: Desconto Regional de Acessibilidade (70%)',
    nameEn: 'Tier 3: Accessibility Parity Discount (70%)',
    multiplier: 0.30,
    discountPercent: 70,
    badge: '-70% Acessibilidade',
    descriptionPt: 'Ajuste prioritário de acessibilidade com 70% de benefício econômico.',
    descriptionEn: 'Accessibility adjustment with 70% discount for developing regions.',
  },
};

// ------------------------------------------------------------------------------
// COUNTRY REPOSITORY (Tier 1, Tier 2, Tier 3)
// ------------------------------------------------------------------------------
export const COUNTRY_DATABASE: Record<string, CountryPricingProfile> = {
  // ==================== TIER 1: Desenvolvidos (Multiplicador 1.00) ====================
  US: {
    countryCode: 'US',
    countryNamePt: 'Estados Unidos',
    countryNameEn: 'United States',
    tier: 1,
    currency: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', unitName: 'dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.0,
  },
  CA: {
    countryCode: 'CA',
    countryNamePt: 'Canadá',
    countryNameEn: 'Canada',
    tier: 1,
    currency: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦', unitName: 'canadian dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.36,
  },
  GB: {
    countryCode: 'GB',
    countryNamePt: 'Reino Unido',
    countryNameEn: 'United Kingdom',
    tier: 1,
    currency: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', unitName: 'pound', decimalPlaces: 2 },
    usdExchangeRate: 0.78,
  },
  DE: {
    countryCode: 'DE',
    countryNamePt: 'Alemanha',
    countryNameEn: 'Germany',
    tier: 1,
    currency: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇩🇪', unitName: 'euro', decimalPlaces: 2 },
    usdExchangeRate: 0.92,
  },
  FR: {
    countryCode: 'FR',
    countryNamePt: 'França',
    countryNameEn: 'France',
    tier: 1,
    currency: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇫🇷', unitName: 'euro', decimalPlaces: 2 },
    usdExchangeRate: 0.92,
  },
  IT: {
    countryCode: 'IT',
    countryNamePt: 'Itália',
    countryNameEn: 'Italy',
    tier: 1,
    currency: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇮🇹', unitName: 'euro', decimalPlaces: 2 },
    usdExchangeRate: 0.92,
  },
  ES: {
    countryCode: 'ES',
    countryNamePt: 'Espanha',
    countryNameEn: 'Spain',
    tier: 1,
    currency: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇸', unitName: 'euro', decimalPlaces: 2 },
    usdExchangeRate: 0.92,
  },
  PT: {
    countryCode: 'PT',
    countryNamePt: 'Portugal',
    countryNameEn: 'Portugal',
    tier: 1,
    currency: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇵🇹', unitName: 'euro', decimalPlaces: 2 },
    usdExchangeRate: 0.92,
  },
  AU: {
    countryCode: 'AU',
    countryNamePt: 'Austrália',
    countryNameEn: 'Australia',
    tier: 1,
    currency: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', flag: '🇦🇺', unitName: 'australian dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.52,
  },
  NZ: {
    countryCode: 'NZ',
    countryNamePt: 'Nova Zelândia',
    countryNameEn: 'New Zealand',
    tier: 1,
    currency: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: '🇳🇿', unitName: 'nz dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.65,
  },
  JP: {
    countryCode: 'JP',
    countryNamePt: 'Japão',
    countryNameEn: 'Japan',
    tier: 1,
    currency: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', unitName: 'yen', decimalPlaces: 0 },
    fixedUnitRate: 100,
    usdExchangeRate: 155.0,
  },
  SG: {
    countryCode: 'SG',
    countryNamePt: 'Singapura',
    countryNameEn: 'Singapore',
    tier: 1,
    currency: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', unitName: 'singapore dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.34,
  },
  KR: {
    countryCode: 'KR',
    countryNamePt: 'Coreia do Sul',
    countryNameEn: 'South Korea',
    tier: 1,
    currency: { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷', unitName: 'won', decimalPlaces: 0 },
    fixedUnitRate: 1300,
    usdExchangeRate: 1370.0,
  },
  AE: {
    countryCode: 'AE',
    countryNamePt: 'Emirados Árabes Unidos',
    countryNameEn: 'United Arab Emirates',
    tier: 1,
    currency: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪', unitName: 'dirham', decimalPlaces: 2 },
    usdExchangeRate: 3.67,
  },

  // ==================== TIER 2: Renda Média (Multiplicador 0.50) ====================
  BR: {
    countryCode: 'BR',
    countryNamePt: 'Brasil',
    countryNameEn: 'Brazil',
    tier: 2,
    currency: { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro', flag: '🇧🇷', unitName: 'real', decimalPlaces: 2 },
    fixedUnitRate: 1.00, // R$ 1,00 exato por crédito conforme mandate
    usdExchangeRate: 5.60,
  },
  MX: {
    countryCode: 'MX',
    countryNamePt: 'México',
    countryNameEn: 'Mexico',
    tier: 2,
    currency: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', flag: '🇲🇽', unitName: 'peso mexicano', decimalPlaces: 2 },
    fixedUnitRate: 10.0,
    usdExchangeRate: 19.5,
  },
  AR: {
    countryCode: 'AR',
    countryNamePt: 'Argentina',
    countryNameEn: 'Argentina',
    tier: 2,
    currency: { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso', flag: '🇦🇷', unitName: 'peso argentino', decimalPlaces: 0 },
    fixedUnitRate: 500.0,
    usdExchangeRate: 1000.0,
  },
  CL: {
    countryCode: 'CL',
    countryNamePt: 'Chile',
    countryNameEn: 'Chile',
    tier: 2,
    currency: { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso', flag: '🇨🇱', unitName: 'peso chileno', decimalPlaces: 0 },
    fixedUnitRate: 450.0,
    usdExchangeRate: 940.0,
  },
  CO: {
    countryCode: 'CO',
    countryNamePt: 'Colômbia',
    countryNameEn: 'Colombia',
    tier: 2,
    currency: { code: 'COP', symbol: 'COL$', name: 'Colombian Peso', flag: '🇨🇴', unitName: 'peso colombiano', decimalPlaces: 0 },
    fixedUnitRate: 2000.0,
    usdExchangeRate: 4100.0,
  },
  PE: {
    countryCode: 'PE',
    countryNamePt: 'Peru',
    countryNameEn: 'Peru',
    tier: 2,
    currency: { code: 'PEN', symbol: 'S/.', name: 'Sol Peruano', flag: '🇵🇪', unitName: 'sol', decimalPlaces: 2 },
    fixedUnitRate: 2.0,
    usdExchangeRate: 3.75,
  },
  TR: {
    countryCode: 'TR',
    countryNamePt: 'Turquia',
    countryNameEn: 'Turkey',
    tier: 2,
    currency: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷', unitName: 'lira', decimalPlaces: 2 },
    fixedUnitRate: 15.0,
    usdExchangeRate: 34.0,
  },
  MY: {
    countryCode: 'MY',
    countryNamePt: 'Malásia',
    countryNameEn: 'Malaysia',
    tier: 2,
    currency: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾', unitName: 'ringgit', decimalPlaces: 2 },
    fixedUnitRate: 2.0,
    usdExchangeRate: 4.4,
  },
  TH: {
    countryCode: 'TH',
    countryNamePt: 'Tailândia',
    countryNameEn: 'Thailand',
    tier: 2,
    currency: { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭', unitName: 'baht', decimalPlaces: 0 },
    fixedUnitRate: 15.0,
    usdExchangeRate: 34.0,
  },
  CN: {
    countryCode: 'CN',
    countryNamePt: 'China',
    countryNameEn: 'China',
    tier: 2,
    currency: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', unitName: 'yuan', decimalPlaces: 2 },
    fixedUnitRate: 3.5,
    usdExchangeRate: 7.2,
  },
  ZA: {
    countryCode: 'ZA',
    countryNamePt: 'África do Sul',
    countryNameEn: 'South Africa',
    tier: 2,
    currency: { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', unitName: 'rand', decimalPlaces: 2 },
    fixedUnitRate: 9.0,
    usdExchangeRate: 18.0,
  },
  PL: {
    countryCode: 'PL',
    countryNamePt: 'Polônia',
    countryNameEn: 'Poland',
    tier: 2,
    currency: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', flag: '🇵🇱', unitName: 'zloty', decimalPlaces: 2 },
    fixedUnitRate: 2.0,
    usdExchangeRate: 4.0,
  },

  // ==================== TIER 3: Renda Baixa (Multiplicador 0.30) ====================
  IN: {
    countryCode: 'IN',
    countryNamePt: 'Índia',
    countryNameEn: 'India',
    tier: 3,
    currency: { code: 'USD', symbol: '$', name: 'US Dollar (India PPP -70%)', flag: '🇮🇳', unitName: 'dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.0,
  },
  ID: {
    countryCode: 'ID',
    countryNamePt: 'Indonésia',
    countryNameEn: 'Indonesia',
    tier: 3,
    currency: { code: 'USD', symbol: '$', name: 'US Dollar (Indonesia PPP -70%)', flag: '🇮🇩', unitName: 'dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.0,
  },
  PH: {
    countryCode: 'PH',
    countryNamePt: 'Filipinas',
    countryNameEn: 'Philippines',
    tier: 3,
    currency: { code: 'USD', symbol: '$', name: 'US Dollar (Philippines PPP -70%)', flag: '🇵🇭', unitName: 'dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.0,
  },
  VN: {
    countryCode: 'VN',
    countryNamePt: 'Vietnã',
    countryNameEn: 'Vietnam',
    tier: 3,
    currency: { code: 'USD', symbol: '$', name: 'US Dollar (Vietnam PPP -70%)', flag: '🇻🇳', unitName: 'dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.0,
  },
  PK: {
    countryCode: 'PK',
    countryNamePt: 'Paquistão',
    countryNameEn: 'Pakistan',
    tier: 3,
    currency: { code: 'USD', symbol: '$', name: 'US Dollar (Pakistan PPP -70%)', flag: '🇵🇰', unitName: 'dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.0,
  },
  BD: {
    countryCode: 'BD',
    countryNamePt: 'Bangladesh',
    countryNameEn: 'Bangladesh',
    tier: 3,
    currency: { code: 'USD', symbol: '$', name: 'US Dollar (Bangladesh PPP -70%)', flag: '🇧🇩', unitName: 'dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.0,
  },
  NG: {
    countryCode: 'NG',
    countryNamePt: 'Nigéria',
    countryNameEn: 'Nigeria',
    tier: 3,
    currency: { code: 'USD', symbol: '$', name: 'US Dollar (Nigeria PPP -70%)', flag: '🇳🇬', unitName: 'dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.0,
  },
  KE: {
    countryCode: 'KE',
    countryNamePt: 'Quênia',
    countryNameEn: 'Kenya',
    tier: 3,
    currency: { code: 'USD', symbol: '$', name: 'US Dollar (Kenya PPP -70%)', flag: '🇰🇪', unitName: 'dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.0,
  },
  EG: {
    countryCode: 'EG',
    countryNamePt: 'Egito',
    countryNameEn: 'Egypt',
    tier: 3,
    currency: { code: 'USD', symbol: '$', name: 'US Dollar (Egypt PPP -70%)', flag: '🇪🇬', unitName: 'dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.0,
  },
  MA: {
    countryCode: 'MA',
    countryNamePt: 'Marrocos',
    countryNameEn: 'Morocco',
    tier: 3,
    currency: { code: 'USD', symbol: '$', name: 'US Dollar (Morocco PPP -70%)', flag: '🇲🇦', unitName: 'dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.0,
  },
};

// ------------------------------------------------------------------------------
// RESOLVE COUNTRY & TIER FROM STRING OR CODE
// ------------------------------------------------------------------------------
export function resolveCountryProfile(countryQuery?: string): CountryPricingProfile {
  if (!countryQuery) return COUNTRY_DATABASE.BR; // Default to Brazil

  const q = countryQuery.trim();
  const upper = q.toUpperCase();

  // Direct Code match
  if (COUNTRY_DATABASE[upper]) {
    return COUNTRY_DATABASE[upper];
  }

  // Name match in PT or EN
  const found = Object.values(COUNTRY_DATABASE).find(
    (c) =>
      c.countryNamePt.toLowerCase() === q.toLowerCase() ||
      c.countryNameEn.toLowerCase() === q.toLowerCase() ||
      c.countryCode.toLowerCase() === q.toLowerCase()
  );

  if (found) return found;

  // Fallback heuristics: If "Brasil" / "Brazil" / "São Paulo"
  if (/brasil|brazil|são paulo|sp|rio/i.test(q)) {
    return COUNTRY_DATABASE.BR;
  }
  if (/estados unidos|usa|united states|us|america/i.test(q)) {
    return COUNTRY_DATABASE.US;
  }

  // Default to US (Tier 1 Standard) for unspecified countries
  return {
    countryCode: 'US',
    countryNamePt: q,
    countryNameEn: q,
    tier: 1,
    currency: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🌐', unitName: 'dollar', decimalPlaces: 2 },
    usdExchangeRate: 1.0,
  };
}

// ------------------------------------------------------------------------------
// MATHEMATICAL PRICING FORMULA
// ------------------------------------------------------------------------------
/**
 * Calculates the exact regional price based on purchasing power parity formula:
 * PreçoFinal = RoundingRule( Quantidade × PreçoBaseUSD × MultiplicadorRegional )
 * 
 * Regras:
 * - Tier 1: Quantidade × 1.00 (mantendo números redondos exatos)
 * - Tier 2 Brasil: Fixo em R$ 1,00 por crédito (Quantidade × 1.00)
 * - Tier 2 Outros: Convertido e arredondado para o número inteiro mais próximo
 * - Tier 3: Quantidade × 1.00 × 0.30 (USD 0.30 por crédito, arredondado de forma limpa)
 */
export function calculateRegionalPrice(credits: number, countryQuery?: string): CalculatedPrice {
  const profile = resolveCountryProfile(countryQuery);
  const tierInfo = TIER_DEFINITIONS[profile.tier];
  const safeCredits = Math.max(1, Math.floor(credits));

  let finalAmount = 0;
  let unitPriceLocal = 0;

  // 1. BRAZIL SPECIAL MANDATE: Fixed at R$ 1.00 per credit
  if (profile.countryCode === 'BR') {
    finalAmount = safeCredits * 1.0;
    unitPriceLocal = 1.0;
  }
  // 2. FIXED LOCAL RATE (e.g. JPY, MXN, etc.)
  else if (profile.fixedUnitRate !== undefined) {
    unitPriceLocal = profile.fixedUnitRate;
    finalAmount = Math.round(safeCredits * profile.fixedUnitRate);
  }
  // 3. TIER 1 (USD / Developed)
  else if (profile.tier === 1) {
    unitPriceLocal = BASE_PRICE_USD * tierInfo.multiplier; // 1.00
    finalAmount = Math.round(safeCredits * unitPriceLocal);
  }
  // 4. TIER 3 (0.30 Multiplier)
  else if (profile.tier === 3) {
    unitPriceLocal = Number((BASE_PRICE_USD * tierInfo.multiplier).toFixed(2)); // 0.30
    finalAmount = Number((safeCredits * unitPriceLocal).toFixed(2));
    // If it's a whole number or .50/.00 clean round
    if (Number.isInteger(finalAmount)) {
      finalAmount = Math.round(finalAmount);
    }
  }
  // 5. OTHER TIER 2
  else {
    const rawLocal = BASE_PRICE_USD * tierInfo.multiplier * profile.usdExchangeRate;
    unitPriceLocal = Math.max(1, Math.round(rawLocal));
    finalAmount = Math.round(safeCredits * unitPriceLocal);
  }

  // Savings in USD compared to full Tier 1 pricing
  const standardUSD = safeCredits * BASE_PRICE_USD;
  const actualUSDValue = (profile.countryCode === 'BR')
    ? (finalAmount / profile.usdExchangeRate)
    : (profile.tier === 3 ? finalAmount : (finalAmount / profile.usdExchangeRate));
  const savingsUSD = Math.max(0, Number((standardUSD - actualUSDValue).toFixed(2)));

  // Formatted string according to locale and symbol
  const formattedAmount = formatPriceOutput(finalAmount, profile.currency);

  return {
    credits: safeCredits,
    rawAmountUSD: standardUSD,
    tierMultiplier: tierInfo.multiplier,
    discountPercent: tierInfo.discountPercent,
    unitPriceLocal,
    finalAmount,
    formattedAmount,
    currency: profile.currency,
    tier: profile.tier,
    isBrazilFixed: profile.countryCode === 'BR',
    savingsUSD,
  };
}

/**
 * Format price according to currency conventions and clean round integer display.
 */
export function formatPriceOutput(amount: number, currency: CurrencyConfig): string {
  if (currency.code === 'JPY' || currency.code === 'KRW' || currency.code === 'CLP' || currency.code === 'COP' || currency.code === 'ARS' || currency.code === 'THB') {
    return `${currency.symbol} ${Math.round(amount).toLocaleString('pt-BR')}`;
  }

  if (currency.code === 'BRL') {
    return `${currency.symbol} ${amount.toFixed(2).replace('.', ',')}`;
  }

  if (currency.code === 'EUR') {
    return `${currency.symbol}${amount.toFixed(2)}`;
  }

  if (currency.code === 'GBP') {
    return `£${amount.toFixed(2)}`;
  }

  if (currency.code === 'USD' || currency.code === 'CAD' || currency.code === 'AUD') {
    return `${currency.symbol}${amount.toFixed(2)}`;
  }

  return `${currency.symbol} ${amount.toFixed(2)}`;
}
