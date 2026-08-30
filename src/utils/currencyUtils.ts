import {
  CurrencyConfig,
  COUNTRY_DATABASE,
  resolveCountryProfile,
  calculateRegionalPrice,
  formatPriceOutput,
} from './pricingEngine';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  unitName: string;
}

export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyInfo> = Object.values(
  COUNTRY_DATABASE
).reduce((acc, curr) => {
  acc[curr.countryNamePt] = {
    code: curr.currency.code,
    symbol: curr.currency.symbol,
    name: curr.currency.name,
    flag: curr.currency.flag,
    unitName: curr.currency.unitName,
  };
  acc[curr.countryNameEn] = {
    code: curr.currency.code,
    symbol: curr.currency.symbol,
    name: curr.currency.name,
    flag: curr.currency.flag,
    unitName: curr.currency.unitName,
  };
  acc[curr.countryCode] = {
    code: curr.currency.code,
    symbol: curr.currency.symbol,
    name: curr.currency.name,
    flag: curr.currency.flag,
    unitName: curr.currency.unitName,
  };
  return acc;
}, {} as Record<string, CurrencyInfo>);

export const DEFAULT_CURRENCY: CurrencyInfo = {
  code: 'BRL',
  symbol: 'R$',
  name: 'Real Brasileiro',
  flag: '🇧🇷',
  unitName: 'real',
};

/**
 * Resolves the currency corresponding to a country string.
 */
export function getCurrencyForCountry(country?: string): CurrencyInfo {
  const profile = resolveCountryProfile(country);
  return {
    code: profile.currency.code,
    symbol: profile.currency.symbol,
    name: profile.currency.name,
    flag: profile.currency.flag,
    unitName: profile.currency.unitName,
  };
}

/**
 * Calculates and formats price using the exact regional pricing formula.
 */
export function formatCurrencyPrice(credits: number, currency: CurrencyInfo, countryName?: string): string {
  const calculated = calculateRegionalPrice(credits, countryName || currency.name);
  return calculated.formattedAmount;
}

export function formatPriceFormatted(credits: number, currency: CurrencyInfo, isEnglish = false, countryName?: string): string {
  const calculated = calculateRegionalPrice(credits, countryName || currency.name);
  return calculated.formattedAmount;
}
