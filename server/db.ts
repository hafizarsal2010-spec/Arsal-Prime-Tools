import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  salt: string;
  role: 'admin' | 'staff' | 'customer';
  permissions: string[];
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice: number;
  duration: string;
  deliveryMethod: string;
  warranty: string;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  featured: boolean;
  shortDescription: string;
  description: string;
  features: string[];
  image: string;
  instructions: string;
  rating: number;
  reviewsCount: number;
  isArchived?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  duration: string;
  deliveryMethod: string;
}

export interface OrderTimeline {
  status: string;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface Order {
  id: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryEmail: string;
  whatsappNumber: string;
  deliveryNotes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  total: number;
  currency: 'PKR';
  paymentMethod: 'jazzcash' | 'easypaisa' | 'raast_bank' | 'nayapay' | 'manual_card';
  paymentReference: string;
  paymentProofNote: string;
  status: 'Placed' | 'Payment Pending' | 'Payment Confirmed' | 'Processing' | 'Delivered' | 'Cancelled' | 'Refunded';
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  deliveryCredentials: string | null;
  adminNotes: string | null;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  eligibleCategories: string[];
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  orderId?: string;
  title: string;
  message: string;
  type: 'order_placed' | 'payment_pending' | 'payment_confirmed' | 'processing' | 'delivered' | 'cancelled' | 'refunded' | 'system';
  read: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  targetType: 'order' | 'product' | 'coupon' | 'review' | 'user' | 'settings' | 'auth';
  targetId?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface SiteSettings {
  storeName: string;
  storeTagline: string;
  logoUrl: string;
  whatsappNumber: string;
  supportEmail: string;
  announcementBarText: string;
  announcementBarActive: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  currency: string;
  primaryColor: string;
  paymentInstructions: {
    jazzcash: { title: string; accountTitle: string; accountNumber: string; instructions: string };
    easypaisa: { title: string; accountTitle: string; accountNumber: string; instructions: string };
    raast_bank: { title: string; accountTitle: string; accountNumber: string; instructions: string };
    nayapay: { title: string; accountTitle: string; accountNumber: string; instructions: string };
  };
  termsOfService: string;
  refundPolicy: string;
  privacyPolicy: string;
}

export interface DatabaseSchema {
  users: User[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  notifications: Notification[];
  activities: Activity[];
  contactMessages: ContactMessage[];
  settings: SiteSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const SECRET_KEY = process.env.AUTH_SECRET || 'arsal-prime-tools-secret-key-2026';

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const effectiveSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, effectiveSalt, 64).toString('hex');
  return { hash, salt: effectiveSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
}

export function generateToken(payload: { id: string; email: string; role: string; name: string }): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken(token: string): { id: string; email: string; role: string; name: string } | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(data).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }
    return JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}

// Initial Database Seeding
function createInitialData(): DatabaseSchema {
  const adminSaltHash = hashPassword('Admin@Arsal2026!');
  const customerSaltHash = hashPassword('Customer@123');

  const adminUser: User = {
    id: 'usr_admin_owner',
    name: 'Hafiz Arsal (Owner)',
    email: 'hafizarsal2010@gmail.com',
    phone: '+92 300 1234567',
    passwordHash: adminSaltHash.hash,
    salt: adminSaltHash.salt,
    role: 'admin',
    permissions: ['all'],
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const adminSecondary: User = {
    id: 'usr_admin_prime',
    name: 'Arsal Prime Support',
    email: 'admin@arsalprimetools.com',
    phone: '+92 300 7654321',
    passwordHash: adminSaltHash.hash,
    salt: adminSaltHash.salt,
    role: 'admin',
    permissions: ['all'],
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const testCustomer: User = {
    id: 'usr_customer_demo',
    name: 'Hamza Khan',
    email: 'customer@example.com',
    phone: '+92 321 9876543',
    passwordHash: customerSaltHash.hash,
    salt: customerSaltHash.salt,
    role: 'customer',
    permissions: [],
    status: 'active',
    createdAt: '2026-02-15T10:00:00.000Z',
  };

  const categories: Category[] = [
    { id: 'ai-automation', name: 'AI & Automation', icon: 'Sparkles', description: 'ChatGPT Plus, Claude Pro, Midjourney, and top AI models' },
    { id: 'seo-analytics', name: 'SEO & Analytics', icon: 'Search', description: 'Semrush, Ahrefs, Ubersuggest, and keyword rank trackers' },
    { id: 'design-creative', name: 'Design & Creative', icon: 'Palette', description: 'Canva Pro, Envato Elements, Freepik, and Adobe suites' },
    { id: 'developer-tools', name: 'Developer Tools', icon: 'Terminal', description: 'GitHub Copilot, JetBrains, Claude Code, and cloud environments' },
    { id: 'productivity-office', name: 'Productivity & Office', icon: 'CheckSquare', description: 'Grammarly, Notion Pro, Office 365, and VPN access' },
    { id: 'trading-finance', name: 'Trading & Financial', icon: 'TrendingUp', description: 'TradingView Premium, Bloomberg, and financial analytics' },
  ];

  const products: Product[] = [
    {
      id: 'prod_chatgpt_plus',
      name: 'ChatGPT Plus (GPT-4o & Canvas)',
      slug: 'chatgpt-plus',
      category: 'AI & Automation',
      price: 2499,
      originalPrice: 3500,
      duration: '1 Month Private / Shared Profile',
      deliveryMethod: 'Direct Email Login & Fast Access Link',
      warranty: '30-Day Full Replacement Warranty',
      stockStatus: 'in_stock',
      featured: true,
      shortDescription: 'Unleash OpenAI GPT-4o, DALL·E 3, Canvas, Code Interpreter, and Custom GPTs with zero limits.',
      description: 'Get genuine ChatGPT Plus subscription access. Ideal for developers, content creators, researchers, and students in Pakistan. Includes priority peak-time access, instant responses, advanced data analytics, web browsing, and custom GPT workflows.',
      features: [
        'Full GPT-4o, o1, and DALL-E 3 image generation',
        'Advanced Canvas coding & text editing interface',
        'Custom GPT store access and file uploading',
        '30-day continuous replacement warranty',
        'Instant dispatch within 15-30 minutes of payment'
      ],
      image: '/assets/chatgpt_suite.svg',
      instructions: 'Credentials dispatched via email and WhatsApp. Clear browser cache or use incognito for initial login.',
      rating: 4.9,
      reviewsCount: 38,
      createdAt: '2026-01-10T12:00:00.000Z',
    },
    {
      id: 'prod_claude_pro',
      name: 'Claude Pro (Opus & Sonnet 3.7)',
      slug: 'claude-pro',
      category: 'AI & Automation',
      price: 2899,
      originalPrice: 3800,
      duration: '1 Month Dedicated Profile',
      deliveryMethod: 'Direct Account Credentials',
      warranty: '30-Day Replacement Guarantee',
      stockStatus: 'in_stock',
      featured: true,
      shortDescription: 'Anthropic Claude 3.7 Sonnet and Opus with 200K token context window and Artifacts.',
      description: 'Supercharge your coding, technical analysis, and long-document processing with Claude Pro. Features full Artifacts live preview, high message limits, priority access during peak hours, and early feature access.',
      features: [
        'Access to Claude 3.7 Sonnet and Opus models',
        'Interactive Artifacts live web app coding canvas',
        '200,000 token context window (analyze entire codebases)',
        'Full 30-day warranty against outages',
        'Delivered with private instructions'
      ],
      image: '/assets/claude_suite.svg',
      instructions: 'Login to claude.ai with the provided verified credentials. Do not change primary billing details.',
      rating: 4.95,
      reviewsCount: 29,
      createdAt: '2026-01-12T12:00:00.000Z',
    },
    {
      id: 'prod_semrush_guru',
      name: 'Semrush Guru Plan (Full SEO Suite)',
      slug: 'semrush-guru',
      category: 'SEO & Analytics',
      price: 1999,
      originalPrice: 4500,
      duration: '1 Month Access',
      deliveryMethod: 'Instant 1-Click Extension / Portal',
      warranty: '30-Day Guaranteed Active Service',
      stockStatus: 'in_stock',
      featured: true,
      shortDescription: 'Keyword research, backlink analysis, competitor audit, and rank tracking for agency pros.',
      description: 'The industry-leading SEO toolkit trusted by digital marketers across Pakistan. Unlimited keyword research, site audit with historical data, competitor traffic trends, backlink analytics, and content marketing toolkit.',
      features: [
        'Complete keyword magic tool with search volume & difficulty',
        'Competitor organic research and paid ads audit',
        'Backlink gap analysis and toxicity checker',
        'Site health audit and automated reports',
        'Instant 1-click browser extension access with zero session crashes'
      ],
      image: '/assets/semrush_suite.svg',
      instructions: 'Access provided through the Arsal Prime secure portal extension with high uptime proxy.',
      rating: 4.85,
      reviewsCount: 44,
      createdAt: '2026-01-15T12:00:00.000Z',
    },
    {
      id: 'prod_canva_pro',
      name: 'Canva Pro (1-Year Edu / Team Access)',
      slug: 'canva-pro-1year',
      category: 'Design & Creative',
      price: 999,
      originalPrice: 2200,
      duration: '1 Year Full Subscription',
      deliveryMethod: 'Invitation to Customer Personal Email',
      warranty: '1-Year Full Warranty & Re-invites',
      stockStatus: 'in_stock',
      featured: true,
      shortDescription: 'Upgrade your personal email to Canva Pro with Magic Studio AI, Brand Kits, and premium assets.',
      description: 'Get all premium Canva Pro features activated directly on your personal Gmail or work email address! No shared accounts, completely private projects, brand kit uploads, background remover, and 100M+ stock images, videos, and templates.',
      features: [
        'Delivered directly to YOUR existing personal email account',
        'Magic Studio AI, 1-click background remover, Magic Switch',
        '100+ million premium stock photos, audio, videos, and graphics',
        '1TB cloud storage & unlimited brand fonts and color palettes',
        'Complete 365-day replacement & support warranty'
      ],
      image: '/assets/canva_suite.svg',
      instructions: 'Provide your personal Canva email at checkout. You will receive an official team join link within 15 minutes.',
      rating: 5.0,
      reviewsCount: 82,
      createdAt: '2026-01-18T12:00:00.000Z',
    },
    {
      id: 'prod_envato_elements',
      name: 'Envato Elements Unlimited Downloads',
      slug: 'envato-elements',
      category: 'Design & Creative',
      price: 1499,
      originalPrice: 2800,
      duration: '1 Month Access',
      deliveryMethod: 'One-Click Downloader / Secure Session',
      warranty: '30-Day Active Download Guarantee',
      stockStatus: 'in_stock',
      featured: false,
      shortDescription: 'Unlimited WordPress themes, plugins, stock video templates, 3D graphics, and fonts.',
      description: 'The ultimate asset library for video editors, web developers, and designers. Download unlimited WordPress themes, After Effects templates, Premiere Pro titles, royalty-free audio tracks, and vector mockups.',
      features: [
        'Unlimited downloads without daily download caps',
        'WordPress themes, Elementor templates & WooCommerce plugins',
        'High resolution stock footage, sound effects, and music',
        'High-speed direct servers for Pakistani network connections',
        'Instant delivery with verified portal credentials'
      ],
      image: '/assets/envato_suite.svg',
      instructions: 'Access via our dedicated ultra-fast downloader portal. No download waiting queues.',
      rating: 4.8,
      reviewsCount: 26,
      createdAt: '2026-01-20T12:00:00.000Z',
    },
    {
      id: 'prod_github_copilot',
      name: 'GitHub Copilot Pro / Business',
      slug: 'github-copilot',
      category: 'Developer Tools',
      price: 1899,
      originalPrice: 3200,
      duration: '1 Month Private License',
      deliveryMethod: 'GitHub Account Organization Invite',
      warranty: '30-Day Guaranteed Code Completion',
      stockStatus: 'in_stock',
      featured: true,
      shortDescription: 'AI pair programmer for VS Code, JetBrains, and Neovim with Copilot Chat and multi-file reasoning.',
      description: 'Accelerate your software engineering with GitHub Copilot. Integrates directly with your IDE to suggest whole functions, generate tests, explain legacy code, and answer architecture questions in real time.',
      features: [
        'Delivered directly to your personal GitHub username/email',
        'Works seamlessly in VS Code, IntelliJ, WebStorm, and PyCharm',
        'Copilot Chat with multi-file reasoning & debugging',
        'Full privacy: your proprietary code is never used to train models',
        '30-day uninterrupted replacement warranty'
      ],
      image: '/assets/github_suite.svg',
      instructions: 'Enter your GitHub username at checkout. You will receive an organizational seat invite.',
      rating: 4.9,
      reviewsCount: 31,
      createdAt: '2026-01-22T12:00:00.000Z',
    },
    {
      id: 'prod_midjourney',
      name: 'Midjourney Standard Plan (Fast GPU Hours)',
      slug: 'midjourney-standard',
      category: 'Design & Creative',
      price: 3499,
      originalPrice: 5000,
      duration: '1 Month Access',
      deliveryMethod: 'Discord Server / Direct Bot Access',
      warranty: '30-Day Access Guarantee',
      stockStatus: 'in_stock',
      featured: false,
      shortDescription: 'World-class AI image generation with 15 Fast Hours and unlimited Relax GPU generation.',
      description: 'Create photorealistic renders, commercial branding concepts, UI mockups, and digital illustrations with Midjourney v6. Includes Fast GPU generation, web generation portal access, and commercial usage rights.',
      features: [
        'Midjourney v6 and Niji models with photorealistic prompt styling',
        '15 Fast GPU hours + unlimited Relax hours',
        'Access through dedicated Discord room or web generation UI',
        'Full commercial usage rights on all outputs',
        'Prompt engineering guidelines included with delivery'
      ],
      image: '/assets/midjourney_suite.svg',
      instructions: 'You will receive private Discord server invite or bot credentials with instant generation permissions.',
      rating: 4.88,
      reviewsCount: 22,
      createdAt: '2026-01-25T12:00:00.000Z',
    },
    {
      id: 'prod_grammarly_premium',
      name: 'Grammarly Premium (1-Year Private)',
      slug: 'grammarly-premium',
      category: 'Productivity & Office',
      price: 1299,
      originalPrice: 2500,
      duration: '1 Year Subscription',
      deliveryMethod: 'Customer Email Invitation / Credentials',
      warranty: '1-Year Full Warranty',
      stockStatus: 'in_stock',
      featured: false,
      shortDescription: 'Advanced tone adjustments, plagiarism checker, AI text rewriting, and clarity suggestions.',
      description: 'Ideal for freelance writers, Upwork/Fiverr freelancers, students, and professionals in Pakistan. Eliminate grammatical mistakes, refine tone for US/UK clients, verify plagiarism, and write with confidence.',
      features: [
        'Vocabulary enhancement and clarity rephrasing',
        'Academic and professional plagiarism detector',
        'Browser extensions for Chrome, Word, Google Docs, and Outlook',
        'GrammarlyGO AI rewriting prompts',
        '1-Year guaranteed warranty'
      ],
      image: '/assets/grammarly_suite.svg',
      instructions: 'Credentials provided or email invitation dispatched within 20 minutes.',
      rating: 4.75,
      reviewsCount: 19,
      createdAt: '2026-02-01T12:00:00.000Z',
    },
    {
      id: 'prod_tradingview',
      name: 'TradingView Premium (Real-Time Data)',
      slug: 'tradingview-premium',
      category: 'Trading & Financial',
      price: 2999,
      originalPrice: 5500,
      duration: '1 Month Access',
      deliveryMethod: 'Direct Account Credentials',
      warranty: '30-Day Guaranteed Active Service',
      stockStatus: 'in_stock',
      featured: false,
      shortDescription: '25 indicators per chart, 8 charts per layout, 400 price alerts, and second-based intervals.',
      description: 'The top charting and technical analysis platform for crypto, forex, and Pakistan Stock Exchange (PSX) traders. Unlock second-based candlestick intervals, unlimited custom indicators, and automated alerts.',
      features: [
        '8 charts in a single window layout',
        '25 indicators per chart and indicator-on-indicator calculations',
        '400 server-side price alerts sent via SMS/Webhook',
        'Second-based intervals and tick volume bars',
        'Instant delivery with warranty against session dropouts'
      ],
      image: '/assets/tradingview_suite.svg',
      instructions: 'Private login provided with clean proxy credentials.',
      rating: 4.9,
      reviewsCount: 15,
      createdAt: '2026-02-05T12:00:00.000Z',
    },
    {
      id: 'prod_jetbrains_pack',
      name: 'JetBrains All Products Pack (1-Year License)',
      slug: 'jetbrains-pack',
      category: 'Developer Tools',
      price: 4999,
      originalPrice: 8500,
      duration: '1 Year License Key',
      deliveryMethod: 'Official JetBrains License Key / Account',
      warranty: '365-Day Uninterrupted Warranty',
      stockStatus: 'in_stock',
      featured: false,
      shortDescription: 'WebStorm, IntelliJ IDEA Ultimate, PyCharm Pro, PhpStorm, GoLand, CLion, and DataGrip.',
      description: 'The complete arsenal for software engineers. Access all desktop IDEs from JetBrains with full commercial profiling tools, database clients, Kubernetes integration, and AI coding assistant.',
      features: [
        'Includes IntelliJ IDEA Ultimate, WebStorm, PyCharm, PhpStorm, GoLand, DataGrip',
        'Offline activation key or direct JetBrains account login',
        'Complete updates to all versions during the 1-year duration',
        'Full 365-day warranty with dedicated support',
        'Instant activation via digital key'
      ],
      image: '/assets/jetbrains_suite.svg',
      instructions: 'License key sent to email with step-by-step activation guide for all JetBrains IDEs.',
      rating: 4.95,
      reviewsCount: 14,
      createdAt: '2026-02-10T12:00:00.000Z',
    }
  ];

  const coupons: Coupon[] = [
    {
      id: 'coup_prime2026',
      code: 'PRIME2026',
      type: 'percentage',
      value: 15,
      minOrder: 1500,
      usageLimit: 500,
      usedCount: 42,
      validFrom: '2026-01-01T00:00:00.000Z',
      validUntil: '2026-12-31T23:59:59.000Z',
      isActive: true,
      eligibleCategories: ['all'],
    },
    {
      id: 'coup_welcome10',
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minOrder: 1000,
      usageLimit: 1000,
      usedCount: 119,
      validFrom: '2026-01-01T00:00:00.000Z',
      validUntil: '2026-12-31T23:59:59.000Z',
      isActive: true,
      eligibleCategories: ['all'],
    },
    {
      id: 'coup_save500',
      code: 'SAVE500',
      type: 'fixed',
      value: 500,
      minOrder: 3000,
      usageLimit: 200,
      usedCount: 35,
      validFrom: '2026-01-01T00:00:00.000Z',
      validUntil: '2026-12-31T23:59:59.000Z',
      isActive: true,
      eligibleCategories: ['all'],
    },
  ];

  const sampleOrders: Order[] = [
    {
      id: 'APT-2026-1042',
      userId: 'usr_customer_demo',
      customerName: 'Hamza Khan',
      customerEmail: 'customer@example.com',
      customerPhone: '+92 321 9876543',
      deliveryEmail: 'customer@example.com',
      whatsappNumber: '+92 321 9876543',
      deliveryNotes: 'Please dispatch credentials via WhatsApp as well',
      items: [
        {
          productId: 'prod_chatgpt_plus',
          name: 'ChatGPT Plus (GPT-4o & Canvas)',
          price: 2499,
          quantity: 1,
          duration: '1 Month Private / Shared Profile',
          deliveryMethod: 'Direct Email Login & Fast Access Link',
        }
      ],
      subtotal: 2499,
      discount: 250,
      couponCode: 'WELCOME10',
      total: 2249,
      currency: 'PKR',
      paymentMethod: 'jazzcash',
      paymentReference: 'JC-884910283',
      paymentProofNote: 'Paid Rs 2249 via JazzCash app TID: JC-884910283 from Hamza Khan account',
      status: 'Delivered',
      subscriptionStartDate: '2026-09-01T10:00:00.000Z',
      subscriptionEndDate: '2026-10-01T10:00:00.000Z',
      deliveryCredentials: 'Email: arsal.prime.user42@gmail.com | Pass: PrimeKey#2026! | Access Portal: https://auth.openai.com',
      adminNotes: 'Verified JazzCash transaction on portal. Delivered within 12 mins.',
      timeline: [
        { status: 'Placed', timestamp: '2026-09-01T09:40:00.000Z', actor: 'Hamza Khan', note: 'Order created via checkout' },
        { status: 'Payment Pending', timestamp: '2026-09-01T09:42:00.000Z', actor: 'Hamza Khan', note: 'Submitted TID JC-884910283' },
        { status: 'Payment Confirmed', timestamp: '2026-09-01T09:50:00.000Z', actor: 'Hafiz Arsal (Owner)', note: 'Payment verified in JazzCash Merchant ledger' },
        { status: 'Processing', timestamp: '2026-09-01T09:52:00.000Z', actor: 'Hafiz Arsal (Owner)', note: 'Provisioning ChatGPT Plus private slot' },
        { status: 'Delivered', timestamp: '2026-09-01T10:00:00.000Z', actor: 'Hafiz Arsal (Owner)', note: 'Account credentials sent to email and portal' },
      ],
      createdAt: '2026-09-01T09:40:00.000Z',
      updatedAt: '2026-09-01T10:00:00.000Z',
    },
    {
      id: 'APT-2026-1088',
      userId: 'usr_customer_demo',
      customerName: 'Hamza Khan',
      customerEmail: 'customer@example.com',
      customerPhone: '+92 321 9876543',
      deliveryEmail: 'customer@example.com',
      whatsappNumber: '+92 321 9876543',
      items: [
        {
          productId: 'prod_canva_pro',
          name: 'Canva Pro (1-Year Edu / Team Access)',
          price: 999,
          quantity: 1,
          duration: '1 Year Full Subscription',
          deliveryMethod: 'Invitation to Customer Personal Email',
        }
      ],
      subtotal: 999,
      discount: 0,
      couponCode: null,
      total: 999,
      currency: 'PKR',
      paymentMethod: 'easypaisa',
      paymentReference: 'EP-449102941',
      paymentProofNote: 'Transferred via EasyPaisa TID: EP-449102941',
      status: 'Payment Pending',
      subscriptionStartDate: null,
      subscriptionEndDate: null,
      deliveryCredentials: null,
      adminNotes: null,
      timeline: [
        { status: 'Placed', timestamp: '2026-09-22T14:15:00.000Z', actor: 'Hamza Khan', note: 'Order created' },
        { status: 'Payment Pending', timestamp: '2026-09-22T14:18:00.000Z', actor: 'Hamza Khan', note: 'Customer submitted payment TID EP-449102941' },
      ],
      createdAt: '2026-09-22T14:15:00.000Z',
      updatedAt: '2026-09-22T14:18:00.000Z',
    }
  ];

  const reviews: Review[] = [
    {
      id: 'rev_101',
      productId: 'prod_chatgpt_plus',
      productName: 'ChatGPT Plus (GPT-4o & Canvas)',
      userId: 'usr_customer_demo',
      userName: 'Hamza Khan',
      rating: 5,
      comment: 'Super fast delivery! Received login credentials within 10 minutes of JazzCash payment confirmation. Canvas and GPT-4o working smoothly without issues. 10/10 service for Pakistani developers.',
      status: 'approved',
      createdAt: '2026-09-05T14:30:00.000Z',
    },
    {
      id: 'rev_102',
      productId: 'prod_semrush_guru',
      productName: 'Semrush Guru Plan (Full SEO Suite)',
      userId: 'usr_customer_demo',
      userName: 'Bilal Ahmad (SEO Agency)',
      rating: 5,
      comment: 'Semrush portal works with zero downtime. We use it daily for client keyword audits and rank tracking. Great prices in PKR instead of paying expensive dollar rates.',
      status: 'approved',
      createdAt: '2026-09-10T11:20:00.000Z',
    },
    {
      id: 'rev_103',
      productId: 'prod_canva_pro',
      productName: 'Canva Pro (1-Year Edu / Team Access)',
      userId: 'usr_customer_demo',
      userName: 'Ayesha Tariq',
      rating: 5,
      comment: 'Activated directly onto my personal email address. All Pro fonts, magic background remover, and brand kits unlocked. Highly recommended!',
      status: 'approved',
      createdAt: '2026-09-12T16:00:00.000Z',
    }
  ];

  const notifications: Notification[] = [
    {
      id: 'notif_1',
      userId: 'usr_customer_demo',
      orderId: 'APT-2026-1042',
      title: 'Order Delivered! 🚀',
      message: 'Your ChatGPT Plus subscription credentials have been dispatched. View credentials in your account order history.',
      type: 'delivered',
      read: false,
      createdAt: '2026-09-01T10:00:00.000Z',
    },
    {
      id: 'notif_2',
      userId: 'usr_customer_demo',
      orderId: 'APT-2026-1088',
      title: 'Payment Under Review ⏳',
      message: 'Your EasyPaisa payment TID EP-449102941 for Order #APT-2026-1088 is currently being verified by admin.',
      type: 'payment_pending',
      read: false,
      createdAt: '2026-09-22T14:18:00.000Z',
    }
  ];

  const activities: Activity[] = [
    {
      id: 'act_1',
      userId: 'usr_customer_demo',
      userName: 'Hamza Khan',
      userRole: 'customer',
      action: 'Order Placed',
      details: 'Created Order #APT-2026-1042 for ChatGPT Plus (Rs. 2,249)',
      targetType: 'order',
      targetId: 'APT-2026-1042',
      createdAt: '2026-09-01T09:40:00.000Z',
    },
    {
      id: 'act_2',
      userId: 'usr_admin_owner',
      userName: 'Hafiz Arsal (Owner)',
      userRole: 'admin',
      action: 'Order Delivered',
      details: 'Delivered Order #APT-2026-1042 with 30-day subscription validity',
      targetType: 'order',
      targetId: 'APT-2026-1042',
      createdAt: '2026-09-01T10:00:00.000Z',
    },
    {
      id: 'act_3',
      userId: 'usr_customer_demo',
      userName: 'Hamza Khan',
      userRole: 'customer',
      action: 'Review Submitted',
      details: 'Submitted 5-star review for ChatGPT Plus',
      targetType: 'review',
      targetId: 'rev_101',
      createdAt: '2026-09-05T14:30:00.000Z',
    },
    {
      id: 'act_4',
      userId: 'usr_customer_demo',
      userName: 'Hamza Khan',
      userRole: 'customer',
      action: 'Order Placed',
      details: 'Created Order #APT-2026-1088 for Canva Pro 1-Year (Rs. 999)',
      targetType: 'order',
      targetId: 'APT-2026-1088',
      createdAt: '2026-09-22T14:15:00.000Z',
    }
  ];

  const contactMessages: ContactMessage[] = [
    {
      id: 'msg_1',
      name: 'Saad Farooq',
      email: 'saad.dev@outlook.com',
      phone: '+92 333 4567890',
      subject: 'Inquiry regarding Claude 3.7 Sonnet limit',
      message: 'Hello Arsal Prime team, is Claude Pro account private or shared? And what is the response limit per 5 hours? Looking to purchase for a 5-member dev team.',
      status: 'replied',
      reply: 'Hi Saad! We provide private dedicated profile accounts with high allowance. We also offer custom team bundles. Connecting on WhatsApp!',
      repliedAt: '2026-09-20T11:00:00.000Z',
      createdAt: '2026-09-20T09:30:00.000Z',
    }
  ];

  const settings: SiteSettings = {
    storeName: 'Arsal Prime Tools',
    storeTagline: 'Pakistan’s Premier Digital Tools & Software Subscription Marketplace',
    logoUrl: '',
    whatsappNumber: '+92 300 1234567',
    supportEmail: 'support@arsalprimetools.com',
    announcementBarText: '⚡ LIMITED TIME OFFER: Use voucher code PRIME2026 for 15% OFF all AI & Developer Subscriptions! Instant Dispatch via Email & WhatsApp 🚀',
    announcementBarActive: true,
    heroHeadline: 'Genuine Digital Subscriptions at Pakistani Rupee Rates',
    heroSubheadline: 'Save up to 80% on genuine AI, SEO, design, and developer tools with local JazzCash, EasyPaisa & Raast bank payments and guaranteed replacement warranties.',
    currency: 'PKR',
    primaryColor: '#dc2626',
    paymentInstructions: {
      jazzcash: {
        title: 'JazzCash',
        accountTitle: 'Arsal Prime Tools / Hafiz Arsal',
        accountNumber: '0300-1234567',
        instructions: 'Open your JazzCash app, send money to Mobile Account 0300-1234567, and copy the 10 or 12-digit TID from SMS.',
      },
      easypaisa: {
        title: 'EasyPaisa',
        accountTitle: 'Arsal Prime Services',
        accountNumber: '0345-9876543',
        instructions: 'Open EasyPaisa app, select Send Money to EasyPaisa Mobile 0345-9876543, and enter the Transaction ID below.',
      },
      raast_bank: {
        title: 'Bank Transfer / Raast ID',
        accountTitle: 'Arsal Prime Tools (Meezan Bank Ltd)',
        accountNumber: '0101-0105893201 / Raast: 03001234567',
        instructions: 'Transfer funds from any 1Link bank app via IBFT or instant Raast ID to Meezan Bank, and provide bank reference number.',
      },
      nayapay: {
        title: 'NayaPay / SadaPay',
        accountTitle: 'Arsal Prime',
        accountNumber: 'NayaPay ID: @arsalprime / SadaPay: 03001234567',
        instructions: 'Send money to @arsalprime on NayaPay or SadaPay mobile account, and write down reference note.',
      }
    },
    termsOfService: 'All digital accounts and license keys provided by Arsal Prime Tools come with our stated replacement warranty. Accounts are strictly for personal or business ethical use. Sharing private access links outside the authorized user voids warranty.',
    refundPolicy: 'If a tool cannot be delivered or experiences unresolved issues within the warranty duration, we issue a prompt replacement or prorated refund back to your JazzCash, EasyPaisa, or bank account within 24 business hours.',
    privacyPolicy: 'We respect your confidentiality. Delivery credentials and customer phone/email details are encrypted and strictly protected. We never sell or share customer contact records with third parties.',
  };

  return {
    users: [adminUser, adminSecondary, testCustomer],
    products,
    categories,
    orders: sampleOrders,
    coupons,
    reviews,
    notifications,
    activities,
    contactMessages,
    settings,
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed;
      }
    } catch (e) {
      console.error('Error loading database, initializing fresh seed:', e);
    }
    const initial = createInitialData();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(data: DatabaseSchema) {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public save() {
    this.saveDirect(this.data);
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public set<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]) {
    this.data[key] = value;
    this.save();
  }

  public logActivity(activity: Omit<Activity, 'id' | 'createdAt'>) {
    const newActivity: Activity = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.activities.unshift(newActivity);
    if (this.data.activities.length > 500) {
      this.data.activities = this.data.activities.slice(0, 500);
    }
    this.save();
    return newActivity;
  }

  public addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
    const newNotif: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }
}

export const db = new Database();
