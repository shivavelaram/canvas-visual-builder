import React, { useState } from 'react';
import { Website, Webpage, CanvasNode, AuthUser, NavigationMenuItem } from '../../types/canvas';
import {
  Globe,
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  Save,
  ChevronDown,
  Cloud,
  Database,
  ExternalLink,
  Layers,
  Sparkles,
  Menu as MenuIcon,
  FolderLock,
  Lock,
} from 'lucide-react';

interface WebsitePageManagerProps {
  websites: Website[];
  activeWebsiteId: string;
  activePageId: string;
  hasUnsavedChanges: boolean;
  currentUser: AuthUser | null;
  onSelectWebsite: (siteId: string) => void;
  onSelectPage: (pageId: string) => void;
  onCreateWebsite: (newSite: Website) => void;
  onCreatePage: (siteId: string, newPage: Webpage) => void;
  onSaveCurrentPage: () => void;
  onOpenMenuManager: () => void;
  onDeletePage?: (siteId: string, pageId: string) => void;
}

export const WebsitePageManager: React.FC<WebsitePageManagerProps> = ({
  websites,
  activeWebsiteId,
  activePageId,
  hasUnsavedChanges,
  currentUser,
  onSelectWebsite,
  onSelectPage,
  onCreateWebsite,
  onCreatePage,
  onSaveCurrentPage,
  onOpenMenuManager,
  onDeletePage,
}) => {
  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);
  const [isNewSiteModalOpen, setIsNewSiteModalOpen] = useState(false);
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);

  // New site form state
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteDomain, setNewSiteDomain] = useState('');
  const [newSiteCategory, setNewSiteCategory] = useState<
    'saas' | 'portfolio' | 'ecommerce' | 'documentation' | 'corporate' | 'agency' | 'custom'
  >('ecommerce');
  const [customOneDriveFolder, setCustomOneDriveFolder] = useState('');

  // New page form state
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  // Filter projects by user grant access (Admins see all; others see granted projects)
  const accessibleWebsites = websites.filter((w) => {
    if (!currentUser || currentUser.role === 'admin') return true;
    if (w.ownerId === currentUser.id || w.ownerEmail?.toLowerCase() === currentUser.email?.toLowerCase()) return true;
    if (w.grants?.some((g) => g.userId === currentUser.id || g.userEmail.toLowerCase() === currentUser.email?.toLowerCase())) {
      return true;
    }
    return false;
  });

  const activeWebsite =
    accessibleWebsites.find((w) => w.id === activeWebsiteId) ||
    accessibleWebsites[0] ||
    websites[0];

  const activePage =
    activeWebsite?.pages.find((p) => p.id === activePageId) ||
    activeWebsite?.pages[0];

  // User's role on active project
  const userProjectGrant = activeWebsite?.grants?.find(
    (g) => g.userId === currentUser?.id || g.userEmail.toLowerCase() === currentUser?.email?.toLowerCase()
  );
  const userProjectRole =
    currentUser?.role === 'admin'
      ? 'Platform Admin'
      : userProjectGrant?.role
      ? userProjectGrant.role === 'owner'
        ? 'Project Owner'
        : 'Editor'
      : activeWebsite?.ownerId === currentUser?.id
      ? 'Project Owner'
      : 'Viewer';

  const handleCreateSiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim()) return;

    const siteId = `site-${Date.now()}`;
    const slugName = newSiteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const cleanDomain = newSiteDomain || `https://${slugName}.io`;
    const folderPath = customOneDriveFolder.trim() || `/Apps/CanvasStudio/Projects/${slugName}/`;

    // Multi-page starter generation depending on category
    let starterPages: Webpage[] = [];
    let starterMenu: NavigationMenuItem[] = [];

    if (newSiteCategory === 'ecommerce') {
      const pHomeId = `page-${Date.now()}-home`;
      const pCatalogId = `page-${Date.now()}-catalog`;
      const pAboutId = `page-${Date.now()}-about`;
      const pContactId = `page-${Date.now()}-contact`;

      starterPages = [
        {
          id: pHomeId,
          websiteId: siteId,
          title: 'Home',
          slug: 'home',
          description: `Welcome to ${newSiteName}`,
          updatedAt: new Date().toISOString(),
          isPublished: true,
          nodes: [
            { id: `node-${Date.now()}-nav`, componentId: 'website_navbar', props: { brandName: newSiteName, ctaText: 'View Bag (0)' } },
            { id: `node-${Date.now()}-hero`, componentId: 'hero_saas_section', props: { badgeText: '🛍️ Direct-to-Consumer', headline: `Welcome to ${newSiteName}`, subheadline: 'Handcrafted goods crafted for modern living.', primaryCta: 'Shop Collection', secondaryCta: 'Our Story' } },
            { id: `node-${Date.now()}-features`, componentId: 'feature_grid_saas', props: { sectionTitle: 'Fast fulfillment and verified fair trade' } },
            { id: `node-${Date.now()}-footer`, componentId: 'website_footer', props: { brandName: newSiteName } },
          ],
        },
        {
          id: pCatalogId,
          websiteId: siteId,
          title: 'Products',
          slug: 'products',
          description: 'Full product directory',
          updatedAt: new Date().toISOString(),
          isPublished: true,
          nodes: [
            { id: `node-${Date.now()}-nav2`, componentId: 'website_navbar', props: { brandName: newSiteName, ctaText: 'View Bag (0)' } },
            { id: `node-${Date.now()}-hero2`, componentId: 'hero_saas_section', props: { badgeText: '🌿 Catalog', headline: 'Discover Our Handcrafted Lineup', subheadline: 'Sustainable fabrics and heirloom ceramics.', primaryCta: 'Filter Goods', secondaryCta: 'Bestsellers' } },
            { id: `node-${Date.now()}-kpi`, componentId: 'kpi_metric_card', props: { label: 'In-Stock Styles', value: '48 Items', change: 'New Arrival', positive: true } },
            { id: `node-${Date.now()}-footer2`, componentId: 'website_footer', props: { brandName: newSiteName } },
          ],
        },
        {
          id: pAboutId,
          websiteId: siteId,
          title: 'About Us',
          slug: 'about',
          description: 'Our origins and ethos',
          updatedAt: new Date().toISOString(),
          isPublished: true,
          nodes: [
            { id: `node-${Date.now()}-nav3`, componentId: 'website_navbar', props: { brandName: newSiteName, ctaText: 'Get Started' } },
            { id: `node-${Date.now()}-hero3`, componentId: 'hero_saas_section', props: { badgeText: '📖 Brand Story', headline: 'Mindful Creation from Day One', subheadline: 'Designed with zero waste and natural elements.', primaryCta: 'Read Impact', secondaryCta: 'Contact' } },
            { id: `node-${Date.now()}-footer3`, componentId: 'website_footer', props: { brandName: newSiteName } },
          ],
        },
        {
          id: pContactId,
          websiteId: siteId,
          title: 'Contact',
          slug: 'contact',
          description: 'Support and inquiries',
          updatedAt: new Date().toISOString(),
          isPublished: true,
          nodes: [
            { id: `node-${Date.now()}-nav4`, componentId: 'website_navbar', props: { brandName: newSiteName, ctaText: 'Live Support' } },
            { id: `node-${Date.now()}-cta4`, componentId: 'cta_banner_saas', props: { headline: `Contact the ${newSiteName} team`, buttonText: 'Send Inquiry' } },
            { id: `node-${Date.now()}-footer4`, componentId: 'website_footer', props: { brandName: newSiteName } },
          ],
        },
      ];

      starterMenu = [
        { id: 'm-home', label: 'Home', pageId: pHomeId, slug: 'home', order: 1, isVisible: true },
        { id: 'm-prod', label: 'Products', pageId: pCatalogId, slug: 'products', order: 2, isVisible: true },
        { id: 'm-about', label: 'About Us', pageId: pAboutId, slug: 'about', order: 3, isVisible: true },
        { id: 'm-contact', label: 'Contact', pageId: pContactId, slug: 'contact', order: 4, isVisible: true },
      ];
    } else {
      // Default Multi-Page SaaS / Corporate starter
      const pHomeId = `page-${Date.now()}-home`;
      const pFeaturesId = `page-${Date.now()}-features`;
      const pPricingId = `page-${Date.now()}-pricing`;
      const pContactId = `page-${Date.now()}-contact`;

      starterPages = [
        {
          id: pHomeId,
          websiteId: siteId,
          title: 'Home',
          slug: 'home',
          description: `Welcome to ${newSiteName}`,
          updatedAt: new Date().toISOString(),
          isPublished: true,
          nodes: [
            { id: `node-${Date.now()}-nav`, componentId: 'website_navbar', props: { brandName: newSiteName, ctaText: 'Get Started' } },
            { id: `node-${Date.now()}-hero`, componentId: 'hero_saas_section', props: { badgeText: '✨ New Platform', headline: `Welcome to ${newSiteName}`, subheadline: 'Built with the high-performance visual canvas builder.', primaryCta: 'Get Started', secondaryCta: 'Explore Features' } },
            { id: `node-${Date.now()}-features`, componentId: 'feature_grid_saas', props: { sectionTitle: 'Built for enterprise performance' } },
            { id: `node-${Date.now()}-footer`, componentId: 'website_footer', props: { brandName: newSiteName } },
          ],
        },
        {
          id: pFeaturesId,
          websiteId: siteId,
          title: 'Features',
          slug: 'features',
          description: 'Platform architecture',
          updatedAt: new Date().toISOString(),
          isPublished: true,
          nodes: [
            { id: `node-${Date.now()}-nav2`, componentId: 'website_navbar', props: { brandName: newSiteName, ctaText: 'Get Started' } },
            { id: `node-${Date.now()}-hero2`, componentId: 'hero_saas_section', props: { badgeText: '⚡ Capabilities', headline: 'Unrivaled Speed and Modular Depth', subheadline: 'Deterministic execution and high availability.', primaryCta: 'View Benchmark', secondaryCta: 'Docs' } },
            { id: `node-${Date.now()}-footer2`, componentId: 'website_footer', props: { brandName: newSiteName } },
          ],
        },
        {
          id: pPricingId,
          websiteId: siteId,
          title: 'Pricing',
          slug: 'pricing',
          description: 'Tiered subscriptions',
          updatedAt: new Date().toISOString(),
          isPublished: true,
          nodes: [
            { id: `node-${Date.now()}-nav3`, componentId: 'website_navbar', props: { brandName: newSiteName, ctaText: 'Start Trial' } },
            { id: `node-${Date.now()}-hero3`, componentId: 'hero_saas_section', props: { badgeText: '💰 Transparent Tiers', headline: 'Simple Pricing for Every Team', subheadline: 'Pay only for what your users consume.', primaryCta: 'Start 14-Day Trial', secondaryCta: 'Contact Sales' } },
            { id: `node-${Date.now()}-footer3`, componentId: 'website_footer', props: { brandName: newSiteName } },
          ],
        },
        {
          id: pContactId,
          websiteId: siteId,
          title: 'Contact',
          slug: 'contact',
          description: 'Get in touch',
          updatedAt: new Date().toISOString(),
          isPublished: true,
          nodes: [
            { id: `node-${Date.now()}-nav4`, componentId: 'website_navbar', props: { brandName: newSiteName, ctaText: 'Send Message' } },
            { id: `node-${Date.now()}-cta4`, componentId: 'cta_banner_saas', props: { headline: 'Speak with our solutions architects', buttonText: 'Schedule Consultation' } },
            { id: `node-${Date.now()}-footer4`, componentId: 'website_footer', props: { brandName: newSiteName } },
          ],
        },
      ];

      starterMenu = [
        { id: 'm-home', label: 'Home', pageId: pHomeId, slug: 'home', order: 1, isVisible: true },
        { id: 'm-feat', label: 'Features', pageId: pFeaturesId, slug: 'features', order: 2, isVisible: true },
        { id: 'm-price', label: 'Pricing', pageId: pPricingId, slug: 'pricing', order: 3, isVisible: true },
        { id: 'm-cont', label: 'Contact', pageId: pContactId, slug: 'contact', order: 4, isVisible: true },
      ];
    }

    const newSite: Website = {
      id: siteId,
      name: newSiteName.trim(),
      domain: cleanDomain,
      description: `Production website project for ${newSiteName.trim()}`,
      category: newSiteCategory,
      pages: starterPages,
      activePageId: starterPages[0].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: currentUser?.id || 'user-admin-1',
      ownerEmail: currentUser?.email || 'admin@apexcloud.io',
      oneDriveFolder: folderPath,
      grants: [
        {
          userId: currentUser?.id || 'user-admin-1',
          userEmail: currentUser?.email || 'admin@apexcloud.io',
          role: 'owner',
          grantedAt: new Date().toISOString(),
        },
      ],
      menuItems: starterMenu,
    };

    onCreateWebsite(newSite);
    setIsNewSiteModalOpen(false);
    setNewSiteName('');
    setNewSiteDomain('');
    setCustomOneDriveFolder('');
  };

  const handleCreatePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle || !activeWebsite) return;

    const cleanSlug =
      newPageSlug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') ||
      newPageTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const newPage: Webpage = {
      id: `page-${Date.now()}-${cleanSlug}`,
      websiteId: activeWebsite.id,
      title: newPageTitle,
      slug: cleanSlug,
      description: `Dedicated ${newPageTitle} page for ${activeWebsite.name}`,
      updatedAt: new Date().toISOString(),
      isPublished: true,
      nodes: [
        {
          id: `node-${Date.now()}-nav`,
          componentId: 'website_navbar',
          props: { brandName: activeWebsite.name, ctaText: 'Get Started' },
        },
        {
          id: `node-${Date.now()}-hero`,
          componentId: 'hero_saas_section',
          props: {
            badgeText: `📄 ${newPageTitle}`,
            headline: `${newPageTitle} at ${activeWebsite.name}`,
            subheadline: 'Crafted with precision using the visual builder.',
            primaryCta: 'Get Started',
            secondaryCta: 'Back to Home',
          },
        },
        {
          id: `node-${Date.now()}-features`,
          componentId: 'feature_grid_saas',
          props: { sectionTitle: 'Built for enterprise reliability' },
        },
        {
          id: `node-${Date.now()}-footer`,
          componentId: 'website_footer',
          props: { brandName: activeWebsite.name },
        },
      ],
    };

    onCreatePage(activeWebsite.id, newPage);
    setIsNewPageModalOpen(false);
    setNewPageTitle('');
    setNewPageSlug('');
  };

  return (
    <div className="flex items-center space-x-2 text-xs">
      {/* Active Website Selector */}
      <div className="relative">
        <button
          onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 font-semibold text-zinc-800 shadow-2xs transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-600" />
          <span className="truncate max-w-[130px]">{activeWebsite?.name || 'Select Project'}</span>
          <span className="text-[9px] px-1.5 py-0.2 bg-zinc-100 text-zinc-600 rounded font-mono hidden md:inline">
            {activeWebsite?.category}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        {isSiteDropdownOpen && (
          <div className="absolute left-0 mt-1.5 w-72 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95">
            <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Website Projects ({accessibleWebsites.length})</span>
              <span className="text-indigo-600 font-mono text-[9px]">{userProjectRole}</span>
            </div>
            {accessibleWebsites.map((site) => (
              <button
                key={site.id}
                onClick={() => {
                  onSelectWebsite(site.id);
                  setIsSiteDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  site.id === activeWebsite.id
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <div>
                  <div className="truncate font-semibold">{site.name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono font-normal flex items-center gap-1.5">
                    <span>{site.pages.length} pages</span>
                    <span>•</span>
                    <span className="capitalize">{site.category}</span>
                  </div>
                </div>
                {site.id === activeWebsite.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </button>
            ))}
            <div className="border-t border-zinc-100 mt-1 pt-1">
              <button
                onClick={() => {
                  setIsSiteDropdownOpen(false);
                  setIsNewSiteModalOpen(true);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 flex items-center space-x-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create New Website Project</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pages Pills Navigation */}
      <div className="flex items-center space-x-1 bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/80 max-w-[340px] overflow-x-auto scrollbar-none">
        {activeWebsite?.pages.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPage(p.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              p.id === activePage?.id
                ? 'bg-white text-zinc-900 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <FileText className="w-3 h-3 text-zinc-400" />
            <span>{p.title}</span>
            <span className="text-[10px] text-zinc-400 font-mono">
              /{p.slug === 'home' ? '' : p.slug}
            </span>
          </button>
        ))}

        <button
          onClick={() => setIsNewPageModalOpen(true)}
          title="Add New Webpage"
          className="p-1 text-indigo-600 hover:bg-white rounded-lg transition-colors font-bold text-xs"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Menu Linker Trigger */}
      <button
        onClick={onOpenMenuManager}
        title="Open Navigation Menu Linker: Connect top navigation links across all pages"
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-indigo-50 hover:border-indigo-300 text-zinc-700 hover:text-indigo-700 font-semibold text-xs transition-all shadow-2xs"
      >
        <MenuIcon className="w-3.5 h-3.5 text-indigo-600" />
        <span className="hidden lg:inline">Link Menu</span>
        {activeWebsite?.menuItems && activeWebsite.menuItems.length > 0 && (
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        )}
      </button>

      {/* Save Page Button */}
      <button
        onClick={onSaveCurrentPage}
        title="Save active page to SQLite & OneDrive"
        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-2xs ${
          hasUnsavedChanges
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
            : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200'
        }`}
      >
        <Save className="w-3.5 h-3.5" />
        <span>{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
      </button>

      {/* Modal: Create New Website Project */}
      {isNewSiteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-zinc-200 p-6 space-y-4 text-zinc-900">
            <div className="flex items-center space-x-2 border-b border-zinc-100 pb-3">
              <Globe className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-base font-bold text-zinc-900">Create New Website Development Project</h3>
                <p className="text-xs text-zinc-500">
                  Build any website under Canvas Studio with a dedicated OneDrive folder & SQLite database
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSiteSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">
                  Website Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newSiteName}
                  onChange={(e) => {
                    setNewSiteName(e.target.value);
                    if (!customOneDriveFolder) {
                      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      setCustomOneDriveFolder(`/Apps/CanvasStudio/Projects/${slug}/`);
                    }
                  }}
                  placeholder="e.g. Aura Lifestyle Storefront, Acme Portal, DevDocs"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Category & Type</label>
                  <select
                    value={newSiteCategory}
                    onChange={(e) => setNewSiteCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="ecommerce">E-Commerce Storefront (Catalog, Bag, Story)</option>
                    <option value="saas">SaaS Cloud Platform (Features, Pricing, SLA)</option>
                    <option value="portfolio">Creative / Developer Portfolio</option>
                    <option value="corporate">Corporate Brand Portal</option>
                    <option value="documentation">Documentation Hub</option>
                    <option value="custom">Custom Multi-Page Project</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">
                    Domain / Hostname
                  </label>
                  <input
                    type="text"
                    value={newSiteDomain}
                    onChange={(e) => setNewSiteDomain(e.target.value)}
                    placeholder="https://www.aurastore.io"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono text-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1 flex items-center justify-between">
                  <span>OneDrive Project Folder</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Dedicated cloud storage path</span>
                </label>
                <div className="flex items-center space-x-1 font-mono text-xs text-indigo-600 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
                  <Cloud className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <input
                    type="text"
                    value={customOneDriveFolder}
                    onChange={(e) => setCustomOneDriveFolder(e.target.value)}
                    placeholder="/Apps/CanvasStudio/Projects/my-project/"
                    className="w-full bg-transparent border-none focus:outline-hidden font-mono text-xs text-zinc-800"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Pages, SQLite schema, zero-knowledge passwords, and dynamic data will sync to this OneDrive path.
                </p>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                <span className="text-[11px] font-bold text-zinc-700 block">Starter Kit Preview:</span>
                <span className="text-[11px] text-zinc-500 block">
                  Automatically initializes interconnected pages (Home, Products/Features, About, Contact)
                  and generates a linked navigation menu!
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewSiteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/25"
                >
                  Create Project & Pages
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create New Webpage */}
      {isNewPageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 p-6 space-y-4 text-zinc-900">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-zinc-900">
                Add New Page to {activeWebsite?.name}
              </h3>
            </div>

            <form onSubmit={handleCreatePageSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Page Title</label>
                <input
                  type="text"
                  required
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value);
                    if (!newPageSlug) {
                      setNewPageSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, '')
                      );
                    }
                  }}
                  placeholder="e.g. Solutions, Careers, Docs, Pricing"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">
                  URL Route / Slug
                </label>
                <div className="flex items-center space-x-1 font-mono text-xs text-zinc-500">
                  <span>/</span>
                  <input
                    type="text"
                    required
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    placeholder="solutions"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono text-zinc-800"
                  />
                  <span>.html</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewPageModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                >
                  Create Webpage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
