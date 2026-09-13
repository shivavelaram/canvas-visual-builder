import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Table,
  User,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Link,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Workflow,
  Star,
  Play,
  Check,
} from 'lucide-react';
import { CanvasNode, ComponentDef } from '../../types/canvas';

interface ComponentNodeRendererProps {
  node: CanvasNode;
  compDef?: ComponentDef;
  isSelected?: boolean;
  onSelect?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onMove?: (nodeId: string, direction: 'up' | 'down') => void;
  resolvedProps: Record<string, any>;
  isEditableMode?: boolean;
  depth?: number;
}

export const ComponentNodeRenderer: React.FC<ComponentNodeRendererProps> = ({
  node,
  compDef,
  isSelected = false,
  onSelect,
  onDelete,
  onDuplicate,
  onMove,
  resolvedProps,
  isEditableMode = true,
  depth = 0,
}) => {
  const compId = node.componentId;
  const boundCount = Object.keys(node.bindings || {}).length;

  // Local interactive states for rich SaaS preview elements
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('analytics');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Render individual component types
  const renderInner = () => {
    switch (compId) {
      // 1. SAAS NAVBAR
      case 'website_navbar': {
        const brandName = resolvedProps.brandName || 'Apex Cloud';
        const tagline = resolvedProps.tagline || 'Enterprise Platform';
        const links: string[] = Array.isArray(resolvedProps.links)
          ? resolvedProps.links
          : ['Features', 'Solutions', 'Product Showcase', 'Pricing', 'Changelog'];
        const ctaText = resolvedProps.ctaText || 'Start Free Trial';
        const secondaryText = resolvedProps.secondaryText || 'Sign In';

        return (
          <header className="w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-20 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              {/* Brand Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-indigo-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-base tracking-tight text-zinc-900">{brandName}</span>
                  <span className="hidden sm:inline-block ml-2 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    SaaS 3.0
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-zinc-600">
                {links.map((link, idx) => (
                  <a
                    key={idx}
                    href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={(e) => e.preventDefault()}
                    className="hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {link}
                  </a>
                ))}
              </nav>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  className="text-xs sm:text-sm font-medium text-zinc-700 hover:text-zinc-900 px-3 py-1.5 transition-colors"
                >
                  {secondaryText}
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:shadow-indigo-500/25 active:scale-[0.98]"
                >
                  <span>{ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </header>
        );
      }

      // 2. HERO SAAS SECTION
      case 'hero_saas_section': {
        const badgeText = resolvedProps.badgeText || '✨ Introducing Autonomous AI Workflows 3.0 • Explore announcement →';
        const headline = resolvedProps.headline || 'The modern operating system for scaling modern software';
        const subheadline =
          resolvedProps.subheadline ||
          'Unify workflows, automate customer insights, and scale cloud infrastructure without operational friction. Designed for ambitious engineering and product teams.';
        const primaryCta = resolvedProps.primaryCta || 'Start 14-Day Free Trial';
        const secondaryCta = resolvedProps.secondaryCta || 'Book an Interactive Demo';
        const trustNotes = resolvedProps.trustNotes || '✓ No credit card required  ✓ 5-minute setup  ✓ Enterprise SOC-2 Certified';

        return (
          <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-indigo-50/40 via-white to-white text-center">
            {/* Ambient subtle glow background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-r from-indigo-200/30 via-violet-200/20 to-blue-200/30 blur-3xl pointer-events-none -z-10" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Announcement Badge */}
              {badgeText && (
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold shadow-xs mb-6 hover:bg-indigo-100/60 transition-colors cursor-pointer">
                  <span>{badgeText}</span>
                </div>
              )}

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.15] max-w-4xl mx-auto">
                {headline}
              </h1>

              {/* Subheadline */}
              <p className="mt-6 text-base sm:text-lg text-zinc-600 max-w-3xl mx-auto leading-relaxed">
                {subheadline}
              </p>

              {/* Call to Actions */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
                >
                  <span>{primaryCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-sm border border-zinc-200 shadow-xs transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
                >
                  <Play className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                  <span>{secondaryCta}</span>
                </button>
              </div>

              {/* Trust Subtext */}
              {trustNotes && (
                <p className="mt-6 text-xs text-zinc-600 font-medium tracking-wide">
                  {trustNotes}
                </p>
              )}
            </div>
          </section>
        );
      }

      // 3. SOCIAL PROOF LOGO STRIP
      case 'social_proof_logos': {
        const headline =
          resolvedProps.headline ||
          'Trusted by over 15,000+ engineers and product leaders at fast-growing companies worldwide';
        const companies: string[] = Array.isArray(resolvedProps.companies)
          ? resolvedProps.companies
          : ['Stripe', 'Vercel', 'Linear', 'Supabase', 'Raycast', 'Retool'];

        return (
          <section className="py-8 bg-zinc-50/70 border-y border-zinc-200/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-6">
                {headline}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75">
                {companies.map((company, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-zinc-800 font-bold text-base sm:text-lg tracking-tight">
                    <span className="w-2 h-2 rounded-full bg-zinc-600" />
                    <span>{company}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      // 4. INTERACTIVE PRODUCT SHOWCASE
      case 'product_showcase_section': {
        const title = resolvedProps.title || 'Autonomous Workflow Engine';
        const metricLabel = resolvedProps.metricLabel || 'Global Edge Latency';
        const metricValue = resolvedProps.metricValue || '11.4 ms';
        const trend = resolvedProps.trend || '+42% efficiency gain';

        return (
          <section className="py-12 lg:py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Product Card Container */}
              <div className="rounded-2xl border border-zinc-200/90 shadow-xl overflow-hidden bg-zinc-900 text-zinc-100 ring-1 ring-zinc-800/60">
                {/* Browser Window Header */}
                <div className="h-10 bg-zinc-950 px-4 flex items-center justify-between border-b border-zinc-800 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-3 text-[11px] font-mono text-zinc-400">
                      app.apexcloud.io/studio/live
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Real-time connected</span>
                  </div>
                </div>

                {/* Sub-nav tabs inside showcase */}
                <div className="px-6 pt-4 pb-2 border-b border-zinc-800 flex items-center space-x-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveShowcaseTab('analytics')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      activeShowcaseTab === 'analytics'
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Analytics & Workflows
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveShowcaseTab('governance')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      activeShowcaseTab === 'governance'
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Edge Infrastructure
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveShowcaseTab('models')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      activeShowcaseTab === 'models'
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Data Connectors
                  </button>
                </div>

                {/* Showcase Mockup Body */}
                <div className="p-6 lg:p-8 bg-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left: Highlight metric */}
                  <div className="bg-zinc-950/80 p-5 rounded-xl border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                        <span>{metricLabel}</span>
                        <span className="text-emerald-400 flex items-center space-x-1 text-[11px] font-semibold">
                          <TrendingUp className="w-3 h-3" />
                          <span>{trend}</span>
                        </span>
                      </div>
                      <div className="text-3xl font-extrabold font-mono text-white tracking-tight">{metricValue}</div>
                      <p className="text-xs text-zinc-400 mt-2">
                        Optimized with sub-millisecond edge routing across 38 global points of presence.
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                      <span>Uptime SLA: 99.99%</span>
                      <span className="text-indigo-400 font-medium">SOC-2 Audited</span>
                    </div>
                  </div>

                  {/* Middle & Right: Visual Pipeline flow */}
                  <div className="md:col-span-2 bg-zinc-950/80 p-5 rounded-xl border border-zinc-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
                        <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-indigo-400" />
                          {title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                          Active Stream
                        </span>
                      </div>

                      {/* Visual Pipeline Steps */}
                      <div className="grid grid-cols-3 gap-3 my-3 text-xs">
                        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 block font-mono">STEP 01</span>
                          <span className="font-semibold text-zinc-200 mt-1 block">Ingest & Auth</span>
                          <span className="text-[11px] text-emerald-400 mt-1 block">✓ Validated</span>
                        </div>
                        <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60">
                          <span className="text-[10px] text-indigo-300 block font-mono">STEP 02</span>
                          <span className="font-semibold text-white mt-1 block">Deterministic AI</span>
                          <span className="text-[11px] text-indigo-300 mt-1 block">⚡ 2.4ms Transform</span>
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                          <span className="text-[10px] text-zinc-400 block font-mono">STEP 03</span>
                          <span className="font-semibold text-zinc-200 mt-1 block">Global Publish</span>
                          <span className="text-[11px] text-blue-400 mt-1 block">→ Multi-region CDN</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Total active throughput: <strong className="text-zinc-200">42,500 req/sec</strong></span>
                      <span className="text-emerald-400 font-mono text-[11px]">Zero cold starts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      // 5. SAAS FEATURE GRID
      case 'feature_grid_saas': {
        const sectionBadge = resolvedProps.sectionBadge || 'Core Capabilities';
        const sectionTitle = resolvedProps.sectionTitle || 'Everything your team needs to ship at lightspeed';
        const sectionSubtitle =
          resolvedProps.sectionSubtitle ||
          'Replace brittle scripts and disconnected tools with a unified, governed developer platform.';

        const features = [
          {
            icon: Zap,
            title: 'Sub-Millisecond Edge Delivery',
            description:
              'Execute deterministic transformations at the edge with ultra-low latency, instant replication, and automated cache purging.',
            pill: 'Performance',
          },
          {
            icon: ShieldCheck,
            title: 'Enterprise RBAC & Governance',
            description:
              'Fine-grained role permissions, immutable version history, pre-flight schema validation, and automatic SOC-2 compliance audit logs.',
            pill: 'Security',
          },
          {
            icon: Workflow,
            title: 'Universal Data Integration',
            description:
              'Native schema connectors for PostgreSQL, Stripe, REST APIs, and GraphQL with automatic change synchronization.',
            pill: 'Connectivity',
          },
        ];

        return (
          <section className="py-16 lg:py-24 bg-zinc-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="text-center max-w-3xl mx-auto mb-12">
                <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                  {sectionBadge}
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mt-3">
                  {sectionTitle}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-zinc-600 leading-relaxed">
                  {sectionSubtitle}
                </p>
              </div>

              {/* 3-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {features.map((feat, idx) => {
                  const IconComp = feat.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-6 lg:p-7 border border-zinc-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                            {feat.pill}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                          {feat.title}
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-zinc-600 leading-relaxed">
                          {feat.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                        <span>Explore capabilities</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      // 6. PRICING TABLE SAAS
      case 'pricing_table_saas': {
        const sectionBadge = resolvedProps.sectionBadge || 'Transparent Pricing';
        const sectionTitle = resolvedProps.sectionTitle || 'Predictable plans that scale with your growth';
        const starterPrice = resolvedProps.starterPrice || '$29';
        const proPrice = resolvedProps.proPrice || '$79';
        const enterprisePrice = resolvedProps.enterprisePrice || 'Custom';

        return (
          <section className="py-16 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="text-center max-w-3xl mx-auto mb-10">
                <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                  {sectionBadge}
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mt-3">
                  {sectionTitle}
                </h2>

                {/* Billing Cycle Toggle */}
                <div className="mt-6 inline-flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Billed Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                      billingCycle === 'annual'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <span>Billed Annually</span>
                    <span className="text-[10px] bg-indigo-700/80 text-indigo-100 px-1.5 py-0.5 rounded-full font-bold">
                      SAVE 20%
                    </span>
                  </button>
                </div>
              </div>

              {/* 3 Pricing Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                {/* Starter */}
                <div className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">Starter</h3>
                    <p className="text-xs text-zinc-500 mt-1">Ideal for small engineering teams & startups.</p>
                    <div className="mt-4 flex items-baseline space-x-1">
                      <span className="text-3xl font-extrabold text-zinc-900 font-mono">
                        {billingCycle === 'annual' ? '$24' : starterPrice}
                      </span>
                      <span className="text-xs text-zinc-500">/ user / mo</span>
                    </div>

                    <ul className="mt-6 space-y-3 text-xs text-zinc-600">
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Up to 5 team workspaces</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Standard Postgres & REST sync</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>10,000 monthly transforms</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    className="mt-8 w-full py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-semibold text-xs transition-colors"
                  >
                    Get Started Free
                  </button>
                </div>

                {/* Pro (Featured) */}
                <div className="bg-zinc-900 rounded-2xl p-7 border-2 border-indigo-500 shadow-xl text-white flex flex-col justify-between relative">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    Most Popular
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Pro Scale</h3>
                    <p className="text-xs text-zinc-400 mt-1">For high-growth SaaS applications and scaleups.</p>
                    <div className="mt-4 flex items-baseline space-x-1">
                      <span className="text-3xl font-extrabold font-mono text-white">
                        {billingCycle === 'annual' ? '$64' : proPrice}
                      </span>
                      <span className="text-xs text-zinc-400">/ user / mo</span>
                    </div>

                    <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Unlimited team workspaces</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Sub-millisecond global edge CDN</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Deterministic AI Copilot & diff review</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Full audit log compliance & RBAC</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    className="mt-8 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all active:scale-[0.98]"
                  >
                    Start 14-Day Free Trial
                  </button>
                </div>

                {/* Enterprise */}
                <div className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">Enterprise</h3>
                    <p className="text-xs text-zinc-500 mt-1">Dedicated cloud tenant with custom SLA & security.</p>
                    <div className="mt-4 flex items-baseline space-x-1">
                      <span className="text-3xl font-extrabold text-zinc-900">{enterprisePrice}</span>
                    </div>

                    <ul className="mt-6 space-y-3 text-xs text-zinc-600">
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Custom isolated VPC deployment</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>99.99% uptime SLA guarantee</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>SSO / SAML & custom KMS integration</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>24/7 dedicated engineering support</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    className="mt-8 w-full py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-semibold text-xs transition-colors"
                  >
                    Contact Enterprise Sales
                  </button>
                </div>
              </div>
            </div>
          </section>
        );
      }

      // 7. TESTIMONIAL CARD
      case 'testimonial_card_saas': {
        const quote =
          resolvedProps.quote ||
          '“Migrating our core workflows to this platform cut our release cycle from weeks to minutes. The developer ergonomics, rock-solid uptime, and visual clarity are unmatched in modern software.”';
        const authorName = resolvedProps.authorName || 'Dr. Sarah Jenkins';
        const authorRole = resolvedProps.authorRole || 'Chief Technology Officer';
        const authorCompany = resolvedProps.authorCompany || 'ScaleCloud • Series B';
        const metricCallout = resolvedProps.metricCallout || '64% faster deployment cadence';

        return (
          <section className="py-14 bg-zinc-900 text-white overflow-hidden relative">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              {/* Star Rating */}
              <div className="flex items-center justify-center space-x-1 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-zinc-100 leading-snug max-w-4xl mx-auto">
                {quote}
              </blockquote>

              {/* Author Info */}
              <div className="mt-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                  {authorName.charAt(0)}
                </div>
                <div className="mt-3">
                  <div className="font-bold text-sm text-white">{authorName}</div>
                  <div className="text-xs text-zinc-400">
                    {authorRole} • <span className="text-indigo-400">{authorCompany}</span>
                  </div>
                </div>
                {metricCallout && (
                  <span className="mt-3 text-[11px] font-mono px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                    ✨ Verified Outcome: {metricCallout}
                  </span>
                )}
              </div>
            </div>
          </section>
        );
      }

      // 8. CTA BANNER SAAS
      case 'cta_banner_saas': {
        const headline = resolvedProps.headline || 'Ready to scale your SaaS platform faster?';
        const subheadline =
          resolvedProps.subheadline ||
          'Join over 15,000+ builders shipping better products with less friction. Start your 14-day free trial today.';
        const buttonText = resolvedProps.buttonText || 'Claim Free Access';
        const guarantee = resolvedProps.guarantee || '14-day full feature trial • No credit card required • Instant setup';

        return (
          <section className="py-16 lg:py-20 bg-gradient-to-tr from-indigo-900 via-indigo-950 to-zinc-950 text-white text-center relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {headline}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-indigo-200 max-w-2xl mx-auto leading-relaxed">
                {subheadline}
              </p>

              {/* Interactive Email Form */}
              <div className="mt-8 max-w-md mx-auto">
                {leadSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs flex items-center justify-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Success! Check your inbox for instant onboarding credentials.</span>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (leadEmail.trim()) {
                        setLeadSubmitted(true);
                      }
                    }}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="email"
                      required
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="Enter your work email..."
                      className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] shrink-0"
                    >
                      {buttonText}
                    </button>
                  </form>
                )}
              </div>

              {guarantee && (
                <p className="mt-4 text-[11px] text-indigo-300/80 font-medium">
                  {guarantee}
                </p>
              )}
            </div>
          </section>
        );
      }

      // 9. WEBSITE FOOTER
      case 'website_footer': {
        const brandName = resolvedProps.brandName || 'Apex Cloud';
        const tagline = resolvedProps.tagline || 'The intelligent operating system for scaling modern software.';
        const copyright = resolvedProps.copyright || '© 2026 Apex Cloud Inc. All rights reserved.';

        return (
          <footer className="bg-zinc-950 text-zinc-400 text-xs border-t border-zinc-800/80 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8">
              {/* Brand Col */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2 text-white font-bold text-base">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">
                    ⚡
                  </div>
                  <span>{brandName}</span>
                </div>
                <p className="mt-3 text-zinc-500 max-w-sm leading-relaxed">
                  {tagline}
                </p>
                <div className="mt-4 flex items-center space-x-2 text-[11px] text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>All global edge nodes operational</span>
                </div>
              </div>

              {/* Col 1 */}
              <div>
                <h4 className="font-semibold text-zinc-200 mb-3 text-xs uppercase tracking-wider">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Edge Engine</a></li>
                  <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Data Connectors</a></li>
                  <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Transform Studio</a></li>
                  <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">AI Copilot</a></li>
                </ul>
              </div>

              {/* Col 2 */}
              <div>
                <h4 className="font-semibold text-zinc-200 mb-3 text-xs uppercase tracking-wider">Solutions</h4>
                <ul className="space-y-2">
                  <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Enterprise Cloud</a></li>
                  <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">B2B SaaS</a></li>
                  <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">SOC-2 Compliance</a></li>
                  <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Case Studies</a></li>
                </ul>
              </div>

              {/* Col 3 */}
              <div>
                <h4 className="font-semibold text-zinc-200 mb-3 text-xs uppercase tracking-wider">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Security</a></li>
                  <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-zinc-500 text-[11px]">
              <span>{copyright}</span>
              <div className="flex space-x-4 mt-2 sm:mt-0">
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-zinc-300">Status</a>
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-zinc-300">Security</a>
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-zinc-300">Terms</a>
              </div>
            </div>
          </footer>
        );
      }

      // 10. SECTION HEADER (Clean fallback)
      case 'section_header': {
        const title = resolvedProps.title || 'Untitled Section';
        const subtitle = resolvedProps.subtitle || '';
        const badgeText = resolvedProps.badgeText || '';
        return (
          <div className="py-6 px-4 bg-white border-b border-zinc-100">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">{title}</h2>
                {badgeText && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {badgeText}
                  </span>
                )}
              </div>
            </div>
            {subtitle && <p className="max-w-7xl mx-auto text-xs sm:text-sm text-zinc-500 mt-1">{subtitle}</p>}
          </div>
        );
      }

      // 11. KPI GRID (Clean fallback)
      case 'kpi_grid_section': {
        const gap = node.props.gap === 'tight' ? 'gap-3' : node.props.gap === 'spacious' ? 'gap-6' : 'gap-4';
        const colClass =
          node.variant === 'two_col'
            ? 'grid-cols-1 md:grid-cols-2'
            : node.variant === 'four_col'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-3';

        return (
          <div className={`grid ${colClass} ${gap} w-full my-4 px-4 max-w-7xl mx-auto`}>
            {node.children && node.children.length > 0 ? (
              node.children.map((childNode) => (
                <ComponentNodeRenderer
                  key={childNode.id}
                  node={childNode}
                  compDef={compDef}
                  isSelected={isSelected}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onMove={onMove}
                  resolvedProps={resolvedProps[childNode.id] || childNode.props}
                  isEditableMode={isEditableMode}
                  depth={depth + 1}
                />
              ))
            ) : (
              <div className="col-span-full border-2 border-dashed border-zinc-200 rounded-xl p-8 text-center text-zinc-400 text-xs">
                Drop metric cards into this container
              </div>
            )}
          </div>
        );
      }

      // 12. METRIC CARD (Clean fallback)
      case 'metric_card': {
        const title = resolvedProps.title || 'Active Users';
        const value = resolvedProps.value || '14,280';
        const trend = resolvedProps.trend || '+12.4%';
        const subtitle = resolvedProps.subtitle || 'vs. previous period';

        return (
          <div className="p-5 rounded-xl border border-zinc-200/90 bg-white shadow-xs hover:shadow-sm transition-all">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span className="font-medium">{title}</span>
              {trend && (
                <span className="inline-flex items-center text-emerald-600 text-[11px] font-semibold">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  {trend}
                </span>
              )}
            </div>
            <div className="text-2xl font-extrabold text-zinc-900 font-mono">{value}</div>
            {subtitle && <p className="text-[11px] text-zinc-400 mt-1">{subtitle}</p>}
          </div>
        );
      }

      // 13. DATA TABLE (Clean fallback)
      case 'data_table': {
        const title = resolvedProps.title || 'Dynamic Table';
        const columns = Array.isArray(resolvedProps.columns)
          ? resolvedProps.columns
          : ['Service', 'Status', 'Response Time', 'Uptime'];

        return (
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs my-4 max-w-7xl mx-auto px-4">
            <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
              <div className="flex items-center space-x-2">
                <Table className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
              </div>
            </div>
            <div className="p-4 text-xs text-zinc-500">Table data synchronized.</div>
          </div>
        );
      }

      // 14. ALERT BANNER (Clean fallback)
      case 'alert_banner': {
        const title = resolvedProps.title || 'System Notification';
        const message = resolvedProps.message || 'Notice.';
        return (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 my-4 max-w-7xl mx-auto">
            <div className="font-semibold text-xs">{title}</div>
            <p className="text-xs mt-0.5">{message}</p>
          </div>
        );
      }

      default:
        return (
          <div className="p-4 border border-zinc-200 bg-zinc-50 text-xs rounded-xl text-zinc-600 m-2">
            Allowlisted Component: <span className="font-mono font-semibold">{compId}</span>
          </div>
        );
    }
  };

  if (!isEditableMode) {
    return <div className="w-full">{renderInner()}</div>;
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(node.id);
      }}
      className={`relative group transition-all cursor-pointer ${
        isSelected
          ? 'ring-2 ring-indigo-600 shadow-lg'
          : 'hover:outline-1 hover:outline-dashed hover:outline-indigo-400/80'
      }`}
    >
      {/* Node Inspector Bar */}
      <div
        className={`absolute top-2 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium z-30 transition-opacity ${
          isSelected
            ? 'bg-indigo-600 text-white shadow-md opacity-100'
            : 'bg-zinc-900 text-zinc-200 opacity-0 group-hover:opacity-90'
        }`}
      >
        <span>{node.name || compDef?.name || node.componentId}</span>
        {boundCount > 0 && (
          <span className="flex items-center space-x-0.5 bg-black/30 px-1.5 py-0.2 rounded text-[10px] text-indigo-200">
            <Link className="w-2.5 h-2.5" />
            <span>{boundCount} bound</span>
          </span>
        )}
      </div>

      {/* Action Toolbar when selected */}
      {isSelected && (
        <div className="absolute top-2 right-3 flex items-center space-x-1 bg-zinc-900 text-white px-2 py-1 rounded-lg shadow-xl z-30 border border-zinc-800">
          {onMove && (
            <>
              <button
                type="button"
                title="Move Up"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(node.id, 'up');
                }}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Move Down"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(node.id, 'down');
                }}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white transition-colors"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {onDuplicate && (
            <button
              type="button"
              title="Duplicate Section"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(node.id);
              }}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              title="Delete Section"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="p-1 hover:bg-rose-900 rounded text-rose-300 hover:text-white transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Component content */}
      <div className="w-full">{renderInner()}</div>
    </div>
  );
};
