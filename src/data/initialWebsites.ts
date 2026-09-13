import { Website, CanvasNode } from '../types/canvas';
import { INITIAL_CANVAS_NODES } from './initialState';

export const INITIAL_WEBSITES: Website[] = [
  {
    id: 'site-apex-1',
    name: 'Apex Cloud SaaS Platform',
    domain: 'https://www.apexcloud.io',
    description: 'Enterprise visual builder and autonomous edge delivery platform.',
    category: 'saas',
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-02-01T12:00:00Z',
    activePageId: 'page-apex-home',
    pages: [
      {
        id: 'page-apex-home',
        websiteId: 'site-apex-1',
        title: 'Home',
        slug: 'home',
        description: 'Primary landing page with hero, features, showcase, and pricing.',
        updatedAt: '2025-02-01T12:00:00Z',
        isPublished: true,
        nodes: INITIAL_CANVAS_NODES,
      },
      {
        id: 'page-apex-pricing',
        websiteId: 'site-apex-1',
        title: 'Pricing & Plans',
        slug: 'pricing',
        description: 'Dedicated pricing breakdown with billing calculator and tier comparisons.',
        updatedAt: '2025-01-28T15:30:00Z',
        isPublished: true,
        nodes: [
          INITIAL_CANVAS_NODES.find((n) => n.componentId === 'website_navbar') || {
            id: 'node-nav-p',
            componentId: 'website_navbar',
            props: { brandName: 'Apex Cloud', ctaText: 'Start Free Trial' },
          },
          {
            id: 'node-hero-pricing',
            componentId: 'hero_saas_section',
            props: {
              badgeText: '💰 Transparent Tiered Pricing',
              headline: 'Simple, predictable pricing for teams of any scale',
              subheadline: 'Start free with no credit card required. Upgrade when your bandwidth grows.',
              primaryCta: 'Start 14-Day Free Trial',
              secondaryCta: 'Talk to Sales',
            },
          },
          INITIAL_CANVAS_NODES.find((n) => n.componentId === 'pricing_table_saas') || {
            id: 'node-pricing-p',
            componentId: 'pricing_table_saas',
            props: { sectionTitle: 'Choose the plan that fits your business', starterPrice: '$29', proPrice: '$79' },
          },
          INITIAL_CANVAS_NODES.find((n) => n.componentId === 'testimonial_card_saas') || {
            id: 'node-test-p',
            componentId: 'testimonial_card_saas',
            props: { quote: 'We cut our hosting and deployment infrastructure bills by 42% in month one.' },
          },
          INITIAL_CANVAS_NODES.find((n) => n.componentId === 'cta_banner_saas') || {
            id: 'node-cta-p',
            componentId: 'cta_banner_saas',
            props: { headline: 'Have custom compliance or SLA requirements?', buttonText: 'Contact Enterprise Team' },
          },
          INITIAL_CANVAS_NODES.find((n) => n.componentId === 'website_footer') || {
            id: 'node-foot-p',
            componentId: 'website_footer',
            props: { brandName: 'Apex Cloud' },
          },
        ],
      },
      {
        id: 'page-apex-features',
        websiteId: 'site-apex-1',
        title: 'Features & Edge',
        slug: 'features',
        description: 'Detailed platform architecture and deterministic data transform documentation.',
        updatedAt: '2025-01-25T10:00:00Z',
        isPublished: true,
        nodes: [
          INITIAL_CANVAS_NODES.find((n) => n.componentId === 'website_navbar') || {
            id: 'node-nav-f',
            componentId: 'website_navbar',
            props: { brandName: 'Apex Cloud', ctaText: 'Explore Docs' },
          },
          {
            id: 'node-hero-features',
            componentId: 'hero_saas_section',
            props: {
              badgeText: '⚡ Core Edge Architecture',
              headline: 'Built for sub-millisecond execution and total governance',
              subheadline: 'Eliminate runtime failures with deterministic transforms and schema contracts.',
              primaryCta: 'Deploy First Edge Service',
              secondaryCta: 'View Benchmark Specs',
            },
          },
          INITIAL_CANVAS_NODES.find((n) => n.componentId === 'feature_grid_saas') || {
            id: 'node-feat-f',
            componentId: 'feature_grid_saas',
            props: { sectionTitle: 'Engineered for reliability from the ground up' },
          },
          INITIAL_CANVAS_NODES.find((n) => n.componentId === 'cta_banner_saas') || {
            id: 'node-cta-f',
            componentId: 'cta_banner_saas',
            props: { headline: 'Test edge speed on your domain today' },
          },
          INITIAL_CANVAS_NODES.find((n) => n.componentId === 'website_footer') || {
            id: 'node-foot-f',
            componentId: 'website_footer',
            props: { brandName: 'Apex Cloud' },
          },
        ],
      },
      {
        id: 'page-apex-contact',
        websiteId: 'site-apex-1',
        title: 'Contact',
        slug: 'contact',
        description: 'Sales inquiry, enterprise demo request, and support ticket submission.',
        updatedAt: '2025-01-20T09:00:00Z',
        isPublished: true,
        nodes: [
          INITIAL_CANVAS_NODES.find((n) => n.componentId === 'website_navbar') || {
            id: 'node-nav-c',
            componentId: 'website_navbar',
            props: { brandName: 'Apex Cloud', ctaText: 'Live Chat' },
          },
          INITIAL_CANVAS_NODES.find((n) => n.componentId === 'cta_banner_saas') || {
            id: 'node-cta-c',
            componentId: 'cta_banner_saas',
            props: {
              headline: 'Schedule a tailored enterprise demo',
              subheadline: 'Our solutions engineering team will configure an edge sandbox for your workflow in 24 hours.',
              buttonText: 'Request Demo Session',
            },
          },
          INITIAL_CANVAS_NODES.find((n) => n.componentId === 'testimonial_card_saas') || {
            id: 'node-test-c',
            componentId: 'testimonial_card_saas',
            props: {},
          },
          INITIAL_CANVAS_NODES.find((n) => n.componentId === 'website_footer') || {
            id: 'node-foot-c',
            componentId: 'website_footer',
            props: { brandName: 'Apex Cloud' },
          },
        ],
      },
    ],
  },
  {
    id: 'site-nordic-2',
    name: 'Nordic Fintech Labs',
    domain: 'https://www.nordiclabs.io',
    description: 'Compliant banking and algorithmic payment routing APIs.',
    category: 'saas',
    createdAt: '2025-02-10T11:30:00Z',
    updatedAt: '2025-02-12T14:00:00Z',
    activePageId: 'page-nordic-home',
    pages: [
      {
        id: 'page-nordic-home',
        websiteId: 'site-nordic-2',
        title: 'Home',
        slug: 'home',
        description: 'Fintech infrastructure and compliant banking gateway.',
        updatedAt: '2025-02-12T14:00:00Z',
        isPublished: true,
        nodes: [
          {
            id: 'node-nordic-nav',
            componentId: 'website_navbar',
            props: { brandName: 'Nordic Labs', ctaText: 'API Portal' },
          },
          {
            id: 'node-nordic-hero',
            componentId: 'hero_saas_section',
            props: {
              badgeText: '🛡️ European Banking Framework',
              headline: 'Instant cross-border settlement with algorithmic liquidity',
              subheadline: 'Direct connections to central clearing houses across 30+ jurisdictions.',
              primaryCta: 'Request API Keys',
              secondaryCta: 'Regulatory Specs',
            },
          },
          {
            id: 'node-nordic-feat',
            componentId: 'feature_grid_saas',
            props: {
              sectionTitle: 'High-frequency compliance and zero-leak auditing',
            },
          },
          {
            id: 'node-nordic-cta',
            componentId: 'cta_banner_saas',
            props: {
              headline: 'Build with the gold standard in financial cryptography',
              buttonText: 'Get Production Access',
            },
          },
          {
            id: 'node-nordic-foot',
            componentId: 'website_footer',
            props: { brandName: 'Nordic Fintech Labs' },
          },
        ],
      },
    ],
  },
];
