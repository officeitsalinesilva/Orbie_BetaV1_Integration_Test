/**
 * ORBIE — Commercial Domain Service (Fase 4F)
 * Server-authoritative management of products, pricing, regional policies,
 * daily credit rules, plans, versioning, price quotes, and credit purchases.
 */

import {
  CommercialProduct,
  CommercialRegion,
  CommercialDailyCreditRule,
  CommercialPlan,
  CommercialConfigVersion,
  PriceQuote,
  PriceQuoteRequest,
  CommercialProductStatus,
} from './types';
import { walletService } from '../wallet/walletService';
import { profileRepo, commercialRepo } from '../../persistence';
import { couponService } from '../coupons/couponService';
import fs from 'fs';
import path from 'path';

// Canonical initial products
const SEED_PRODUCTS: CommercialProduct[] = [
  {
    id: 'FER-001',
    code: 'FER-001',
    name: 'Horóscopo Diário Personalizável',
    nameEn: 'Customizable Daily Horoscope',
    description: 'Análise diária personalizada das forças astrológicas com precisão oracular.',
    descriptionEn: 'Personalized daily force analysis with oracular precision.',
    category: 'ferramentas',
    type: 'TOOL',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 0,
      baseCurrency: 'BRL',
      creditPrice: 1,
      allowsCreditPurchase: true,
      allowsFiatPurchase: false,
    },
    entitlement: {
      type: 'USAGE_LIMITED',
      usageLimit: 1,
      targetScope: 'matrix',
    },
    policy: {
      freeAllowed: true,
      subscriptionIncluded: true,
      couponEligible: false,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'FER-002',
    code: 'FER-002',
    name: 'Oráculo Orbie Diário',
    nameEn: 'Daily Orbie Oracle',
    description: 'Síntese oracular em 3 cartas com reflexão meditativa profunda.',
    descriptionEn: '3-card oracular synthesis with deep meditative reflection.',
    category: 'ferramentas',
    type: 'TOOL',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 0,
      baseCurrency: 'BRL',
      creditPrice: 2,
      allowsCreditPurchase: true,
      allowsFiatPurchase: false,
    },
    entitlement: {
      type: 'USAGE_LIMITED',
      usageLimit: 1,
      targetScope: 'matrix',
    },
    policy: {
      freeAllowed: true,
      subscriptionIncluded: true,
      couponEligible: false,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'FER-003',
    code: 'FER-003',
    name: 'Estúdio Neuroacústico',
    nameEn: 'Neuroacoustic Studio',
    description: 'Frequências binaurais e síntese sonora terapêutica alinhada aos operadores diários.',
    descriptionEn: 'Binaural frequencies and sound synthesis aligned with daily operators.',
    category: 'ferramentas',
    type: 'TOOL',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 0,
      baseCurrency: 'BRL',
      creditPrice: 3,
      allowsCreditPurchase: true,
      allowsFiatPurchase: false,
    },
    entitlement: {
      type: 'FEATURE_ACCESS',
      targetScope: 'global',
    },
    policy: {
      freeAllowed: true,
      subscriptionIncluded: true,
      couponEligible: false,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'FER-004',
    code: 'FER-004',
    name: 'Sinastria Express',
    nameEn: 'Express Synastry',
    description: 'Mapeamento relacional harmônico entre dois perfis com cálculo de ressonância.',
    descriptionEn: 'Harmonic relational mapping between two profiles with resonance index.',
    category: 'ferramentas',
    type: 'TOOL',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 0,
      baseCurrency: 'BRL',
      creditPrice: 5,
      allowsCreditPurchase: true,
      allowsFiatPurchase: false,
    },
    entitlement: {
      type: 'USAGE_LIMITED',
      usageLimit: 1,
      targetScope: 'profile',
    },
    policy: {
      freeAllowed: true,
      subscriptionIncluded: true,
      couponEligible: false,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'FER-005',
    code: 'FER-005',
    name: 'Biorritmo Integrado',
    nameEn: 'Integrated Biorhythm',
    description: 'Ciclos físicos, emocionais e intelectuais sincronizados à matriz biológica.',
    descriptionEn: 'Physical, emotional and intellectual cycles synchronized to biological matrix.',
    category: 'ferramentas',
    type: 'TOOL',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 0,
      baseCurrency: 'BRL',
      creditPrice: 2,
      allowsCreditPurchase: true,
      allowsFiatPurchase: false,
    },
    entitlement: {
      type: 'USAGE_LIMITED',
      usageLimit: 1,
      targetScope: 'matrix',
    },
    policy: {
      freeAllowed: true,
      subscriptionIncluded: true,
      couponEligible: false,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'FER-006',
    code: 'FER-006',
    name: 'Tarot e Cabala Express',
    nameEn: 'Kabbalah & Tarot Express',
    description: 'Tiragem hermética conectada às 22 trilhas da Árvore da Vida.',
    descriptionEn: 'Hermetic reading connected to the 22 paths of the Tree of Life.',
    category: 'ferramentas',
    type: 'TOOL',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 0,
      baseCurrency: 'BRL',
      creditPrice: 3,
      allowsCreditPurchase: true,
      allowsFiatPurchase: false,
    },
    entitlement: {
      type: 'USAGE_LIMITED',
      usageLimit: 1,
      targetScope: 'matrix',
    },
    policy: {
      freeAllowed: true,
      subscriptionIncluded: true,
      couponEligible: false,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'AST-001',
    code: 'AST-001',
    name: 'Dossiê Mapa Astral Natal Completo',
    nameEn: 'Natal Chart Complete Dossier',
    description: 'Análise aprofundada de todas as forças, casas e aspectos com geração permanente.',
    descriptionEn: 'In-depth analysis of all forces, sectors and harmonic aspects stored permanently.',
    category: 'perfil-astrologia',
    type: 'LIBRARY_ITEM',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 2900, // R$ 29,00
      baseCurrency: 'BRL',
      creditPrice: 100,
      allowsCreditPurchase: true,
      allowsFiatPurchase: true,
    },
    entitlement: {
      type: 'PERMANENT',
      targetScope: 'library',
    },
    policy: {
      freeAllowed: true,
      subscriptionIncluded: false,
      couponEligible: true,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CAB-001',
    code: 'CAB-001',
    name: 'Dossiê Árvore da Vida Pessoal',
    nameEn: 'Personal Tree of Life Dossier',
    description: 'Mapeamento cabalístico com as 10 sephiroth pessoais e 22 caminhos da sabedoria.',
    descriptionEn: 'Kabbalistic mapping of the 10 personal sephiroth and 22 wisdom paths.',
    category: 'perfil-cabala',
    type: 'LIBRARY_ITEM',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 3900, // R$ 39,00
      baseCurrency: 'BRL',
      creditPrice: 150,
      allowsCreditPurchase: true,
      allowsFiatPurchase: true,
    },
    entitlement: {
      type: 'PERMANENT',
      targetScope: 'library',
    },
    policy: {
      freeAllowed: true,
      subscriptionIncluded: false,
      couponEligible: true,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'NUM-001',
    code: 'NUM-001',
    name: 'Dossiê Numerológico Completo',
    nameEn: 'Complete Numerology Dossier',
    description: 'Cálculo analítico dos operadores de destino, expressão, alma e lições cármicas.',
    descriptionEn: 'Analytical calculation of destiny, soul, personality and karmic lesson operators.',
    category: 'perfil-numerologia',
    type: 'LIBRARY_ITEM',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 2500, // R$ 25,00
      baseCurrency: 'BRL',
      creditPrice: 80,
      allowsCreditPurchase: true,
      allowsFiatPurchase: true,
    },
    entitlement: {
      type: 'PERMANENT',
      targetScope: 'library',
    },
    policy: {
      freeAllowed: true,
      subscriptionIncluded: false,
      couponEligible: true,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CHV-001',
    code: 'CHV-001',
    name: 'Chave Mestra Síntese Suprema',
    nameEn: 'Supreme Master Key Synthesis',
    description: 'Convergência holística unindo Astrologia, Cabala, Numerologia e Biorritmo em um dossiê monumental.',
    descriptionEn: 'Holistic convergence joining Astrology, Kabbalah, Numerology and Biorhythm in a monumental dossier.',
    category: 'perfil-chave-mestra',
    type: 'LIBRARY_ITEM',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 8900, // R$ 89,00
      baseCurrency: 'BRL',
      creditPrice: 350,
      allowsCreditPurchase: true,
      allowsFiatPurchase: true,
    },
    entitlement: {
      type: 'PERMANENT',
      targetScope: 'library',
    },
    policy: {
      freeAllowed: true,
      subscriptionIncluded: false,
      couponEligible: true,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'MEN-001',
    code: 'MEN-001',
    name: 'Revolução Solar & Trânsitos Mensais',
    nameEn: 'Solar Return & Monthly Transits',
    description: 'Guia de navegação temporal para os próximos 30 dias com datas críticas.',
    descriptionEn: 'Temporal navigation guide for the next 30 days with critical dates.',
    category: 'mensais-anuais',
    type: 'SERVICE',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 1900, // R$ 19,00
      baseCurrency: 'BRL',
      creditPrice: 60,
      allowsCreditPurchase: true,
      allowsFiatPurchase: true,
    },
    entitlement: {
      type: 'TEMPORARY',
      durationDays: 30,
      targetScope: 'library',
    },
    policy: {
      freeAllowed: true,
      subscriptionIncluded: true,
      couponEligible: true,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CRD-PACK-10',
    code: 'CRD-PACK-10',
    name: 'Recarga 10 Créditos',
    nameEn: '10 Credits Top-up',
    description: 'Pacote inicial de 10 créditos individuais para a plataforma.',
    descriptionEn: 'Starter pack of 10 individual credits for the platform.',
    category: 'creditos',
    type: 'CREDIT_GRANT',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 1000, // R$ 10,00
      baseCurrency: 'BRL',
      creditPrice: 0,
      allowsCreditPurchase: false,
      allowsFiatPurchase: true,
    },
    entitlement: {
      type: 'CREDIT_BALANCE',
      usageLimit: 10,
      targetScope: 'global',
    },
    policy: {
      freeAllowed: true,
      subscriptionIncluded: false,
      couponEligible: false,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CRD-PACK-50',
    code: 'CRD-PACK-50',
    name: 'Recarga 50 Créditos (10% Bônus)',
    nameEn: '50 Credits Top-up (10% Bonus)',
    description: 'Pacote intermediário de 50 créditos com desconto de conveniência.',
    descriptionEn: 'Intermediate pack of 50 credits with convenience bonus.',
    category: 'creditos',
    type: 'CREDIT_GRANT',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 4500, // R$ 45,00 (10% desc)
      baseCurrency: 'BRL',
      creditPrice: 0,
      allowsCreditPurchase: false,
      allowsFiatPurchase: true,
    },
    entitlement: {
      type: 'CREDIT_BALANCE',
      usageLimit: 50,
      targetScope: 'global',
    },
    policy: {
      freeAllowed: true,
      subscriptionIncluded: false,
      couponEligible: false,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'CRD-PACK-100',
    code: 'CRD-PACK-100',
    name: 'Recarga 100 Créditos (20% Bônus)',
    nameEn: '100 Credits Top-up (20% Bonus)',
    description: 'Pacote mestre de 100 créditos para desbloqueio amplo de artefatos.',
    descriptionEn: 'Master pack of 100 credits for wide artifact unlocking.',
    category: 'creditos',
    type: 'CREDIT_GRANT',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 8000, // R$ 80,00 (20% desc)
      baseCurrency: 'BRL',
      creditPrice: 0,
      allowsCreditPurchase: false,
      allowsFiatPurchase: true,
    },
    entitlement: {
      type: 'CREDIT_BALANCE',
      usageLimit: 100,
      targetScope: 'global',
    },
    policy: {
      freeAllowed: true,
      subscriptionIncluded: false,
      couponEligible: false,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'PLAN-PRO',
    code: 'PLAN-PRO',
    name: 'Assinatura Pro Mensal',
    nameEn: 'Pro Monthly Subscription',
    description: 'Acesso analítico irrestrito, 20 créditos diários renováveis e recursos mensais liberados.',
    descriptionEn: 'Unrestricted analytical access, 20 daily renewable credits and unlocked monthly resources.',
    category: 'planos',
    type: 'SUBSCRIPTION',
    status: 'active',
    enabled: true,
    pricing: {
      basePriceInCents: 4900, // R$ 49,00/mês
      baseCurrency: 'BRL',
      creditPrice: 0,
      allowsCreditPurchase: false,
      allowsFiatPurchase: true,
    },
    entitlement: {
      type: 'FEATURE_ACCESS',
      targetScope: 'global',
    },
    policy: {
      freeAllowed: false,
      subscriptionIncluded: true,
      couponEligible: true,
      regionalEligibility: ['*'],
    },
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Canonical regions configuration
const SEED_REGIONS: CommercialRegion[] = [
  {
    code: 'BR',
    name: 'Brasil',
    currency: 'BRL',
    currencySymbol: 'R$',
    multiplier: 0.5,
    discountPercent: 50,
    status: 'active',
    supportedPaymentMethods: ['pix', 'credit_card', 'mercadopago'],
  },
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    multiplier: 1.0,
    discountPercent: 0,
    status: 'active',
    supportedPaymentMethods: ['credit_card'],
  },
  {
    code: 'EU',
    name: 'European Union',
    currency: 'EUR',
    currencySymbol: '€',
    multiplier: 1.0,
    discountPercent: 0,
    status: 'active',
    supportedPaymentMethods: ['credit_card'],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    multiplier: 1.0,
    discountPercent: 0,
    status: 'active',
    supportedPaymentMethods: ['credit_card'],
  },
  {
    code: 'LATAM',
    name: 'América Latina (Paridade)',
    currency: 'USD',
    currencySymbol: '$',
    multiplier: 0.5,
    discountPercent: 50,
    status: 'active',
    supportedPaymentMethods: ['mercadopago', 'credit_card'],
  },
  {
    code: 'GLOBAL_TIER3',
    name: 'Economias em Desenvolvimento (Tier 3)',
    currency: 'USD',
    currencySymbol: '$',
    multiplier: 0.3,
    discountPercent: 70,
    status: 'active',
    supportedPaymentMethods: ['credit_card'],
  },
];

// Canonical initial daily credit commercial rule
const SEED_DAILY_RULE: CommercialDailyCreditRule = {
  baseCredits: 5,
  streakBonusCredits: 5,
  streakRequiredDays: 3,
  maxDailyBenefit: 10,
  isAccumulative: false,
  version: 1,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

// Canonical initial plans
const SEED_PLANS: CommercialPlan[] = [
  {
    id: 'free',
    name: 'Plano Free',
    nameEn: 'Free Plan',
    status: 'active',
    enabled: true,
    priceInCents: 0,
    currency: 'BRL',
    billingPeriod: 'none',
    dailyCredits: 10,
    streakBonus: 5,
    features: [
      '10 créditos renováveis diários (Day Use)',
      'Acesso às ferramentas diárias por débito de créditos',
      'Uso normal da plataforma e registro no Daily Journal',
      'Compra avulsa de artefatos e dossiês que vão para a sua biblioteca',
    ],
    featuresEn: [
      '10 renewable daily credits (Day Use)',
      'Access to daily tools via daily credit deduction',
      'Standard platform use and Daily Journal entries',
      'One-time purchase of artifacts stored in your library',
    ],
    catalogAvailability: 'all',
    discountPolicy: {
      discountPercent: 0,
      masterKeyDiscountPercent: 0,
    },
    couponEligibility: false,
    entitlements: ['day_use_credits', 'daily_tools'],
    version: 1,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'subscription',
    name: 'Plano Assinatura Pro',
    nameEn: 'Pro Subscription',
    status: 'active',
    enabled: true,
    priceInCents: 4900,
    currency: 'BRL',
    billingPeriod: 'monthly',
    dailyCredits: 20,
    streakBonus: 10,
    features: [
      '20 créditos renováveis diários (2x mais capacidade)',
      'Todos os recursos mensais desbloqueados no painel de apoio',
      'Trânsitos do Mês, Retorno Lunar e Progressões integrados ao Daily Journal',
      'Todos os artefatos adquiridos armazenados na biblioteca permanente',
      'Prioridade na geração e descontos exclusivos na Chave Mestra',
    ],
    featuresEn: [
      '20 renewable daily credits (2x daily capacity)',
      'All monthly resources unlocked in the support panel',
      'Monthly transits, lunar returns & progressions integrated in Daily Journal',
      'All purchased artifacts permanently stored in personal library',
      'Priority generation and exclusive discounts on Master Key',
    ],
    catalogAvailability: 'included',
    discountPolicy: {
      discountPercent: 20,
      masterKeyDiscountPercent: 30,
    },
    couponEligibility: true,
    entitlements: ['pro_badge', 'monthly_cycles_unlocked', 'double_daily_credits'],
    version: 1,
    updatedAt: new Date().toISOString(),
  },
];

export class CommercialService {
  private products: Map<string, CommercialProduct> = new Map();
  private regions: Map<string, CommercialRegion> = new Map();
  private dailyCreditRule: CommercialDailyCreditRule = { ...SEED_DAILY_RULE };
  private plans: Map<string, CommercialPlan> = new Map();
  private versions: CommercialConfigVersion[] = [];
  private quotes: Map<string, PriceQuote> = new Map();
  private persistenceFilePath: string;

  constructor() {
    this.persistenceFilePath = path.resolve(process.cwd(), 'data', 'orbie_commercial.json');
    this.loadInitialState();
  }

  public isRuntimeActive(item: {
    status: CommercialProductStatus;
    enabled?: boolean;
    validFrom?: string;
    validUntil?: string;
  }): boolean {
    if (item.status !== 'active') return false;
    if (item.enabled === false) return false;
    const now = Date.now();
    if (item.validFrom) {
      const from = new Date(item.validFrom).getTime();
      if (!isNaN(from) && now < from) return false;
    }
    if (item.validUntil) {
      const until = new Date(item.validUntil).getTime();
      if (!isNaN(until) && now > until) return false;
    }
    return true;
  }

  public async init(): Promise<void> {
    try {
      const snapshot = await commercialRepo.getConfig();
      if (snapshot) {
        if (snapshot.products && Array.isArray(snapshot.products)) {
          this.products.clear();
          for (const p of snapshot.products) this.products.set(p.id, p);
        }
        if (snapshot.regions && Array.isArray(snapshot.regions)) {
          this.regions.clear();
          for (const r of snapshot.regions) this.regions.set(r.code, r);
        }
        if (snapshot.dailyCreditRule) {
          this.dailyCreditRule = snapshot.dailyCreditRule;
        }
        if (snapshot.plans && Array.isArray(snapshot.plans)) {
          this.plans.clear();
          for (const pl of snapshot.plans) this.plans.set(pl.id, pl);
        }
        if (snapshot.versions && Array.isArray(snapshot.versions)) {
          this.versions = snapshot.versions;
        }
      } else {
        await this.persistState();
      }
    } catch (e) {
      console.warn('[CommercialService] Persistence init warning:', e);
    }
  }

  private loadInitialState(): void {
    // 1. Seed in-memory defaults
    for (const prod of SEED_PRODUCTS) {
      this.products.set(prod.id, { ...prod });
    }
    for (const reg of SEED_REGIONS) {
      this.regions.set(reg.code, { ...reg });
    }
    for (const plan of SEED_PLANS) {
      this.plans.set(plan.id, { ...plan });
    }

    // 2. Read from disk if exists
    try {
      if (fs.existsSync(this.persistenceFilePath)) {
        const raw = fs.readFileSync(this.persistenceFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.products && Array.isArray(parsed.products)) {
          for (const p of parsed.products) this.products.set(p.id, p);
        }
        if (parsed.regions && Array.isArray(parsed.regions)) {
          for (const r of parsed.regions) this.regions.set(r.code, r);
        }
        if (parsed.dailyCreditRule) {
          this.dailyCreditRule = parsed.dailyCreditRule;
        }
        if (parsed.plans && Array.isArray(parsed.plans)) {
          for (const pl of parsed.plans) this.plans.set(pl.id, pl);
        }
        if (parsed.versions && Array.isArray(parsed.versions)) {
          this.versions = parsed.versions;
        }
      }
    } catch (e) {
      console.warn('[CommercialService] Disk load warning, using memory defaults:', e);
    }
  }

  public async persistState(): Promise<void> {
    const payload = {
      products: Array.from(this.products.values()),
      regions: Array.from(this.regions.values()),
      dailyCreditRule: this.dailyCreditRule,
      plans: Array.from(this.plans.values()),
      versions: this.versions,
    };
    try {
      const dir = path.dirname(this.persistenceFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.persistenceFilePath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.error('[CommercialService] Error persisting to disk:', e);
    }
    try {
      await commercialRepo.saveConfig(payload);
    } catch (e) {
      console.error('[CommercialService] Error saving to commercialRepo:', e);
    }
  }

  private persistToDisk(): void {
    this.persistState().catch((e) => console.error('[CommercialService] Background persist error:', e));
  }

  private recordVersion(
    entityType: 'product' | 'plan' | 'daily_credits' | 'regional_policy',
    entityId: string,
    version: number,
    dataSnapshot: any,
    changeSummary: string,
    modifiedBy: string,
    validFrom?: string,
    validUntil?: string
  ): void {
    const versionRecord: CommercialConfigVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entityType,
      entityId,
      version,
      dataSnapshot: JSON.parse(JSON.stringify(dataSnapshot)),
      changeSummary,
      validFrom: validFrom || new Date().toISOString(),
      validUntil,
      modifiedBy,
    };
    this.versions.unshift(versionRecord);
    this.persistToDisk();
  }

  // ==========================================
  // PRODUCTS & CATALOG
  // ==========================================
  public async getProducts(): Promise<CommercialProduct[]> {
    return Array.from(this.products.values());
  }

  public async getActiveProducts(): Promise<CommercialProduct[]> {
    return Array.from(this.products.values()).filter((p) => this.isRuntimeActive(p));
  }

  public async getProduct(idOrCode: string): Promise<CommercialProduct | null> {
    if (this.products.has(idOrCode)) {
      return this.products.get(idOrCode)!;
    }
    for (const p of this.products.values()) {
      if (p.code === idOrCode) return p;
    }
    return null;
  }

  public async createProduct(
    data: Partial<CommercialProduct>,
    adminUid: string = 'system'
  ): Promise<CommercialProduct> {
    if (!data.name || !data.name.trim()) {
      throw new Error('Nome do produto é obrigatório.');
    }
    const id = data.id || data.code || `PROD-${Date.now()}`;
    const code = data.code || id;

    if (this.products.has(id)) {
      throw new Error(`Produto com ID/Código ${id} já existe.`);
    }

    const now = new Date().toISOString();
    const newProduct: CommercialProduct = {
      id,
      code,
      name: data.name.trim(),
      nameEn: data.nameEn,
      description: data.description || '',
      descriptionEn: data.descriptionEn,
      category: data.category || 'ferramentas',
      type: data.type || 'TOOL',
      status: data.status || 'active',
      enabled: data.enabled !== false,
      pricing: {
        basePriceInCents: Math.max(0, Math.round(Number(data.pricing?.basePriceInCents || 0))),
        baseCurrency: (data.pricing?.baseCurrency || 'BRL').toUpperCase(),
        creditPrice: Math.max(0, Math.round(Number(data.pricing?.creditPrice || 0))),
        allowsCreditPurchase: Boolean(data.pricing?.allowsCreditPurchase),
        allowsFiatPurchase: Boolean(data.pricing?.allowsFiatPurchase),
      },
      entitlement: {
        type: data.entitlement?.type || 'PERMANENT',
        durationDays: data.entitlement?.durationDays,
        usageLimit: data.entitlement?.usageLimit,
        targetScope: data.entitlement?.targetScope || 'matrix',
      },
      policy: {
        freeAllowed: data.policy?.freeAllowed !== false,
        subscriptionIncluded: Boolean(data.policy?.subscriptionIncluded),
        couponEligible: Boolean(data.policy?.couponEligible),
        regionalEligibility: data.policy?.regionalEligibility || ['*'],
      },
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    this.products.set(id, newProduct);
    this.recordVersion('product', id, 1, newProduct, 'Criação do produto comercial', adminUid);
    return newProduct;
  }

  public async updateProduct(
    id: string,
    data: Partial<CommercialProduct>,
    adminUid: string = 'system'
  ): Promise<CommercialProduct> {
    const existing = await this.getProduct(id);
    if (!existing) {
      throw new Error(`Produto ${id} não encontrado.`);
    }

    const nextVersion = existing.version + 1;
    const now = new Date().toISOString();

    const updated: CommercialProduct = {
      ...existing,
      ...data,
      id: existing.id,
      code: data.code || existing.code,
      pricing: {
        ...existing.pricing,
        ...(data.pricing || {}),
        basePriceInCents:
          data.pricing?.basePriceInCents !== undefined
            ? Math.max(0, Math.round(Number(data.pricing.basePriceInCents)))
            : existing.pricing.basePriceInCents,
        creditPrice:
          data.pricing?.creditPrice !== undefined
            ? Math.max(0, Math.round(Number(data.pricing.creditPrice)))
            : existing.pricing.creditPrice,
      },
      entitlement: {
        ...existing.entitlement,
        ...(data.entitlement || {}),
      },
      policy: {
        ...existing.policy,
        ...(data.policy || {}),
      },
      version: nextVersion,
      updatedAt: now,
    };

    this.products.set(existing.id, updated);
    this.recordVersion(
      'product',
      existing.id,
      nextVersion,
      updated,
      `Atualização comercial (v${nextVersion})`,
      adminUid
    );
    return updated;
  }

  public async updateProductStatus(
    id: string,
    status: CommercialProductStatus,
    adminUid: string = 'system'
  ): Promise<CommercialProduct> {
    const existing = await this.getProduct(id);
    if (!existing) {
      throw new Error(`Produto ${id} não encontrado.`);
    }
    return this.updateProduct(id, { status, enabled: status === 'active' }, adminUid);
  }

  // ==========================================
  // REGIONS & REGIONAL PRICING
  // ==========================================
  public async getRegions(): Promise<CommercialRegion[]> {
    return Array.from(this.regions.values());
  }

  public async getRegion(code: string): Promise<CommercialRegion | null> {
    const upper = (code || '').toUpperCase();
    return this.regions.get(upper) || null;
  }

  public async updateRegion(
    code: string,
    data: Partial<CommercialRegion>,
    adminUid: string = 'system'
  ): Promise<CommercialRegion> {
    const upper = code.toUpperCase();
    const existing = this.regions.get(upper);
    if (!existing) {
      throw new Error(`Região comercial ${upper} não encontrada.`);
    }

    const updated: CommercialRegion = {
      ...existing,
      ...data,
      code: upper,
      multiplier: data.multiplier !== undefined ? Number(data.multiplier) : existing.multiplier,
      discountPercent:
        data.discountPercent !== undefined
          ? Math.min(100, Math.max(0, Number(data.discountPercent)))
          : existing.discountPercent,
    };

    this.regions.set(upper, updated);
    this.recordVersion(
      'regional_policy',
      upper,
      1,
      updated,
      `Atualização da política regional de ${upper}`,
      adminUid
    );
    return updated;
  }

  // ==========================================
  // DAILY CREDIT RULES (COMMERCIAL SEPARATION)
  // ==========================================
  public async getDailyCreditRule(): Promise<CommercialDailyCreditRule> {
    return { ...this.dailyCreditRule };
  }

  public async updateDailyCreditRule(
    data: Partial<CommercialDailyCreditRule>,
    adminUid: string = 'system'
  ): Promise<CommercialDailyCreditRule> {
    const nextVersion = this.dailyCreditRule.version + 1;
    const now = new Date().toISOString();

    const updated: CommercialDailyCreditRule = {
      ...this.dailyCreditRule,
      baseCredits:
        data.baseCredits !== undefined ? Math.max(1, Number(data.baseCredits)) : this.dailyCreditRule.baseCredits,
      streakBonusCredits:
        data.streakBonusCredits !== undefined
          ? Math.max(0, Number(data.streakBonusCredits))
          : this.dailyCreditRule.streakBonusCredits,
      streakRequiredDays:
        data.streakRequiredDays !== undefined
          ? Math.max(1, Number(data.streakRequiredDays))
          : this.dailyCreditRule.streakRequiredDays,
      maxDailyBenefit:
        data.maxDailyBenefit !== undefined
          ? Math.max(1, Number(data.maxDailyBenefit))
          : this.dailyCreditRule.maxDailyBenefit,
      isAccumulative: Boolean(data.isAccumulative),
      version: nextVersion,
      updatedAt: now,
      updatedBy: adminUid,
    };

    this.dailyCreditRule = updated;
    this.recordVersion(
      'daily_credits',
      'global',
      nextVersion,
      updated,
      `Regra comercial de créditos diários atualizada (Base: ${updated.baseCredits}, Streak: +${updated.streakBonusCredits})`,
      adminUid
    );
    return updated;
  }

  // ==========================================
  // PLANS (FREE & SUBSCRIPTION)
  // ==========================================
  public async getPlans(): Promise<CommercialPlan[]> {
    return Array.from(this.plans.values());
  }

  public async getPlan(id: string): Promise<CommercialPlan | null> {
    return this.plans.get(id) || null;
  }

  public async updatePlan(
    id: string,
    data: Partial<CommercialPlan>,
    adminUid: string = 'system'
  ): Promise<CommercialPlan> {
    const existing = this.plans.get(id);
    if (!existing) {
      throw new Error(`Plano ${id} não encontrado.`);
    }

    const nextVersion = existing.version + 1;
    const now = new Date().toISOString();

    const updated: CommercialPlan = {
      ...existing,
      ...data,
      id: existing.id,
      priceInCents:
        data.priceInCents !== undefined ? Math.max(0, Math.round(Number(data.priceInCents))) : existing.priceInCents,
      dailyCredits:
        data.dailyCredits !== undefined ? Math.max(0, Number(data.dailyCredits)) : existing.dailyCredits,
      streakBonus:
        data.streakBonus !== undefined ? Math.max(0, Number(data.streakBonus)) : existing.streakBonus,
      version: nextVersion,
      updatedAt: now,
    };

    this.plans.set(id, updated);
    this.recordVersion(
      'plan',
      id,
      nextVersion,
      updated,
      `Atualização comercial do plano ${existing.name} (v${nextVersion})`,
      adminUid
    );
    return updated;
  }

  // ==========================================
  // VERSIONING & AUDIT
  // ==========================================
  public async getVersions(entityType?: string, entityId?: string): Promise<CommercialConfigVersion[]> {
    return this.versions.filter((v) => {
      if (entityType && v.entityType !== entityType) return false;
      if (entityId && v.entityId !== entityId) return false;
      return true;
    });
  }

  // ==========================================
  // PRICING ENGINE & QUOTE RESOLUTION
  // ==========================================
  /**
   * Explicit server-authoritative pricing resolution sequence:
   * 1. BASE PRICE (in integer cents)
   *      ↓
   * 2. REGIONAL POLICY (lookup region by billingCountry > selectedCountry > detectedCountry)
   *      ↓
   * 3. CURRENCY (applicable currency from regional policy)
   *      ↓
   * 4. REGIONAL PRICE (apply regional multiplier, rounded in minor integer cents)
   *      ↓
   * 5. DISCOUNT (apply regional discount percentage, avoiding ambiguous stacking)
   *      ↓
   * 6. FINAL PRICE (server-authoritative calculated result)
   */
  public async quotePrice(request: PriceQuoteRequest): Promise<PriceQuote> {
    const product = await this.getProduct(request.productId);
    if (!product) {
      throw new Error(`Produto ${request.productId} não encontrado para cotação.`);
    }

    if (!this.isRuntimeActive(product)) {
      throw new Error(`Produto ${product.id} não está ativo ou vigente para compra (status: ${product.status}).`);
    }

    const detectedCountry = (request.detectedCountry || 'BR').toUpperCase();
    const selectedCountry = (request.selectedCountry || detectedCountry).toUpperCase();
    const billingCountry = (request.billingCountry || selectedCountry).toUpperCase();

    // 1. BASE PRICE
    const basePriceInCents = product.pricing.basePriceInCents;
    const baseCurrency = product.pricing.baseCurrency || 'BRL';

    // 2. REGIONAL POLICY
    // Look up region configuration prioritizing billingCountry
    let region = await this.getRegion(billingCountry);
    if (!region) {
      // Fallbacks
      if (billingCountry === 'BR') region = this.regions.get('BR') || null;
      else if (['US', 'CA'].includes(billingCountry)) region = this.regions.get('US') || null;
      else if (['GB'].includes(billingCountry)) region = this.regions.get('GB') || null;
      else if (['DE', 'FR', 'IT', 'ES', 'PT'].includes(billingCountry)) region = this.regions.get('EU') || null;
      else if (['MX', 'AR', 'CL', 'CO', 'PE'].includes(billingCountry)) region = this.regions.get('LATAM') || null;
      else region = this.regions.get('GLOBAL_TIER3') || this.regions.get('US') || null;
    }

    const regionalMultiplier = region?.multiplier ?? 1.0;
    const regionalDiscountPercent = region?.discountPercent ?? 0;
    const currency = region?.currency || baseCurrency;
    const currencySymbol = region?.currencySymbol || (currency === 'BRL' ? 'R$' : '$');

    // 3 & 4. REGIONAL PRICE CALCULATION
    // If base price is already in BRL and region is BR, regional multiplier is base
    let regionalPriceInCents = Math.round(basePriceInCents * regionalMultiplier);
    if (basePriceInCents > 0 && regionalPriceInCents === 0) {
      regionalPriceInCents = 100; // minimum 1 unit in cents if non-zero
    }

    const regionalAdjustmentInCents = basePriceInCents - regionalPriceInCents;

    // 5. DISCOUNT (calculated from regional price)
    let discountInCents = 0;
    let discountReason: string | undefined = undefined;
    if (regionalDiscountPercent > 0 && regionalMultiplier >= 1.0) {
      discountInCents = Math.round((regionalPriceInCents * regionalDiscountPercent) / 100);
      discountReason = `Desconto regional de ${regionalDiscountPercent}%`;
    }

    // 5b. COUPON DISCOUNT (Integrate with Phase 4E Coupon Engine)
    let appliedCoupon: { code: string; discountInCents: number; description?: string } | undefined = undefined;
    if (request.couponCode && request.couponCode.trim()) {
      if (!product.policy.couponEligible) {
        discountReason = discountReason ? `${discountReason} (Produto não elegível para cupom)` : 'Produto não elegível para cupom promocional';
      } else {
        try {
          const couponRes = await couponService.validateCoupon({
            code: request.couponCode.trim(),
            userId: request.userId,
            orderAmountCents: regionalPriceInCents,
          });
          if (couponRes.valid && couponRes.discountAmountCents) {
            const couponDiscount = Math.min(regionalPriceInCents - discountInCents, couponRes.discountAmountCents);
            discountInCents += couponDiscount;
            appliedCoupon = {
              code: request.couponCode.trim().toUpperCase(),
              discountInCents: couponDiscount,
              description: couponRes.campaignName || 'Cupom promocional validado',
            };
          }
        } catch (e) {
          console.warn('[CommercialService] Coupon validation warning in quote:', e);
        }
      }
    }

    // 6. FINAL PRICE
    const finalPriceInCents = Math.max(0, regionalPriceInCents - discountInCents);
    const finalFloat = finalPriceInCents / 100;
    const finalPriceFormatted = `${currencySymbol} ${finalFloat.toFixed(2).replace('.', ',')}`;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 min validity

    const quote: PriceQuote = {
      quoteId: `quote-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: product.id,
      productName: product.name,
      basePriceInCents,
      baseCurrency,
      detectedCountry,
      selectedCountry,
      billingCountry,
      currency,
      currencySymbol,
      regionalMultiplier,
      regionalAdjustmentInCents,
      discountInCents,
      discountReason,
      appliedCoupon,
      finalPriceInCents,
      finalPriceFormatted,
      allowsCreditPurchase: product.pricing.allowsCreditPurchase,
      creditPrice: product.pricing.creditPrice,
      couponEligible: product.policy.couponEligible,
      createdAt: now.toISOString(),
      expiresAt,
    };

    this.quotes.set(quote.quoteId, quote);
    return quote;
  }

  public getQuote(quoteId: string): PriceQuote | null {
    return this.quotes.get(quoteId) || null;
  }

  public validateQuote(quoteId: string): PriceQuote {
    const quote = this.quotes.get(quoteId);
    if (!quote) {
      throw new Error(`Cotação de preço não encontrada ou inválida: ${quoteId}`);
    }
    if (new Date(quote.expiresAt).getTime() < Date.now()) {
      throw new Error(`Cotação de preço expirada em ${quote.expiresAt}. Por favor solicite um novo cálculo.`);
    }
    return quote;
  }

  // ==========================================
  // SERVER-AUTHORITATIVE CREDIT PURCHASE
  // ==========================================
  public async purchaseWithCredits(
    userUid: string,
    productId: string,
    profileId?: string
  ): Promise<{
    success: boolean;
    product: CommercialProduct;
    creditsDeducted: number;
    newBalance: number;
    entitlementGranted: string;
    message: string;
  }> {
    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error(`Produto comercial ${productId} não encontrado.`);
    }

    if (!this.isRuntimeActive(product)) {
      throw new Error(`Produto comercial ${product.name} não está ativo ou disponível no momento (status: ${product.status}).`);
    }

    if (!product.pricing.allowsCreditPurchase) {
      throw new Error(`O produto ${product.name} não aceita aquisição por créditos.`);
    }

    // Authoritative credit price from the product record
    const creditPrice = product.pricing.creditPrice;
    if (creditPrice <= 0) {
      throw new Error(`Preço em créditos inválido configurado para o produto.`);
    }

    // Check user balance
    const wallet = walletService.getWallet(userUid);
    if (wallet.balance < creditPrice) {
      throw new Error(
        `Saldo insuficiente (${wallet.balance} ◎). Este item requer ${creditPrice} ◎. Adquira mais créditos ou utilize o bônus diário.`
      );
    }

    // Execute authoritative spend via walletService
    const spendResult = walletService.spendCredits(
      userUid,
      creditPrice,
      product.code,
      `Aquisição de ${product.name}`,
      product.entitlement.targetScope === 'profile' ? 'profile' : 'matrix',
      profileId
    );

    // If product is a library item, persist to user's profile unlocked items
    try {
      const primaryProfile = await profileRepo.getPrimary(userUid);
      if (primaryProfile) {
        const currentUnlocked = primaryProfile.unlockedItems || [];
        if (!currentUnlocked.includes(product.code)) {
          primaryProfile.unlockedItems = [...currentUnlocked, product.code];
          await profileRepo.save(primaryProfile);
        }
      }
    } catch (e) {
      console.warn('[CommercialService] Warning updating profile unlockedItems:', e);
    }

    return {
      success: true,
      product,
      creditsDeducted: creditPrice,
      newBalance: spendResult.wallet.balance,
      entitlementGranted: product.entitlement.type,
      message: `Você adquiriu "${product.name}" por ${creditPrice} créditos com sucesso!`,
    };
  }

  // ==========================================
  // CONFIG SNAPSHOT IMPORT / EXPORT / ROLLBACK
  // ==========================================
  public async exportConfig(): Promise<{
    version: string;
    exportedAt: string;
    products: CommercialProduct[];
    regions: CommercialRegion[];
    dailyCreditRule: CommercialDailyCreditRule;
    plans: CommercialPlan[];
    auditVersions: CommercialConfigVersion[];
  }> {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products: Array.from(this.products.values()),
      regions: Array.from(this.regions.values()),
      dailyCreditRule: { ...this.dailyCreditRule },
      plans: Array.from(this.plans.values()),
      auditVersions: [...this.versions],
    };
  }

  public async importConfig(snapshot: any, adminUid: string = 'system'): Promise<void> {
    if (!snapshot || typeof snapshot !== 'object') {
      throw new Error('Snapshot de configuração inválido.');
    }
    if (snapshot.products && Array.isArray(snapshot.products)) {
      this.products.clear();
      for (const p of snapshot.products) {
        if (p && p.id) this.products.set(p.id, p);
      }
    }
    if (snapshot.regions && Array.isArray(snapshot.regions)) {
      this.regions.clear();
      for (const r of snapshot.regions) {
        if (r && r.code) this.regions.set(r.code.toUpperCase(), r);
      }
    }
    if (snapshot.dailyCreditRule) {
      this.dailyCreditRule = { ...snapshot.dailyCreditRule };
    }
    if (snapshot.plans && Array.isArray(snapshot.plans)) {
      this.plans.clear();
      for (const pl of snapshot.plans) {
        if (pl && pl.id) this.plans.set(pl.id, pl);
      }
    }
    this.recordVersion('daily_credits', 'config_import', 1, snapshot, 'Importação de configuração comercial', adminUid);
    await this.persistState();
  }

  public async rollbackVersion(versionId: string, adminUid: string = 'system'): Promise<CommercialConfigVersion> {
    const target = this.versions.find((v) => v.id === versionId);
    if (!target) {
      throw new Error(`Versão de auditoria ${versionId} não encontrada.`);
    }

    if (target.entityType === 'product') {
      this.products.set(target.entityId, target.dataSnapshot);
    } else if (target.entityType === 'regional_policy') {
      this.regions.set(target.entityId, target.dataSnapshot);
    } else if (target.entityType === 'plan') {
      this.plans.set(target.entityId, target.dataSnapshot);
    } else if (target.entityType === 'daily_credits') {
      this.dailyCreditRule = target.dataSnapshot;
    }

    this.recordVersion(
      target.entityType,
      target.entityId,
      target.version + 1,
      target.dataSnapshot,
      `Rollback para v${target.version} (${versionId})`,
      adminUid
    );
    await this.persistState();
    return target;
  }

  public resetForTest(): void {
    this.products.clear();
    this.regions.clear();
    this.plans.clear();
    this.versions = [];
    this.quotes.clear();
    this.dailyCreditRule = { ...SEED_DAILY_RULE };
    this.loadInitialState();
  }
}

export const commercialService = new CommercialService();
