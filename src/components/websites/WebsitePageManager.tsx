import React, { useState } from 'react';
import { Website, Webpage, CanvasNode } from '../../types/canvas';
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
} from 'lucide-react';

interface WebsitePageManagerProps {
  websites: Website[];
  activeWebsiteId: string;
  activePageId: string;
  hasUnsavedChanges: boolean;
  onSelectWebsite: (siteId: string) => void;
  onSelectPage: (pageId: string) => void;
  onCreateWebsite: (newSite: Website) => void;
  onCreatePage: (siteId: string, newPage: Webpage) => void;
  onSaveCurrentPage: () => void;
  onDeletePage?: (siteId: string, pageId: string) => void;
}

export const WebsitePageManager: React.FC<WebsitePageManagerProps> = ({
  websites,
  activeWebsiteId,
  activePageId,
  hasUnsavedChanges,
  onSelectWebsite,
  onSelectPage,
  onCreateWebsite,
  onCreatePage,
  onSaveCurrentPage,
  onDeletePage,
}) => {
  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);
  const [isNewSiteModalOpen, setIsNewSiteModalOpen] = useState(false);
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);

  // New site form state
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteDomain, setNewSiteDomain] = useState('');
  const [newSiteCategory, setNewSiteCategory] = useState<'saas' | 'portfolio' | 'ecommerce' | 'documentation'>('saas');

  // New page form state
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageTemplate, setNewPageTemplate] = useState<'landing' | 'pricing' | 'content' | 'blank'>('landing');

  const activeWebsite = websites.find((w) => w.id === activeWebsiteId) || websites[0];
  const activePage = activeWebsite?.pages.find((p) => p.id === activePageId) || activeWebsite?.pages[0];

  const handleCreateSiteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName) return;

    const siteId = `site-${Date.now()}`;
    const cleanDomain = newSiteDomain || `https://${newSiteName.toLowerCase().replace(/[^a-z0-9]+/g, '')}.io`;

    const defaultHomePage: Webpage = {
      id: `page-${Date.now()}-home`,
      websiteId: siteId,
      title: 'Home',
      slug: 'home',
      description: `Welcome to ${newSiteName}`,
      updatedAt: new Date().toISOString(),
      isPublished: true,
      nodes: [
        {
          id: `node-${Date.now()}-nav`,
          componentId: 'website_navbar',
          props: { brandName: newSiteName, ctaText: 'Get Started' },
        },
        {
          id: `node-${Date.now()}-hero`,
          componentId: 'hero_saas_section',
          props: {
            badgeText: '✨ New Release',
            headline: `Welcome to ${newSiteName}`,
            subheadline: 'Crafted with precision using the schema-driven canvas builder.',
            primaryCta: 'Start Exploring',
            secondaryCta: 'Documentation',
          },
        },
        {
          id: `node-${Date.now()}-features`,
          componentId: 'feature_grid_saas',
          props: { sectionTitle: 'Unmatched speed, reliability, and precision' },
        },
        {
          id: `node-${Date.now()}-cta`,
          componentId: 'cta_banner_saas',
          props: { headline: `Join ${newSiteName} today` },
        },
        {
          id: `node-${Date.now()}-footer`,
          componentId: 'website_footer',
          props: { brandName: newSiteName },
        },
      ],
    };

    const newSite: Website = {
      id: siteId,
      name: newSiteName,
      domain: cleanDomain,
      description: `Modern digital platform for ${newSiteName}`,
      category: newSiteCategory,
      pages: [defaultHomePage],
      activePageId: defaultHomePage.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateWebsite(newSite);
    setIsNewSiteModalOpen(false);
    setNewSiteName('');
    setNewSiteDomain('');
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
            subheadline: 'Learn how our autonomous technology delivers reliable results.',
            primaryCta: 'Get Started',
            secondaryCta: 'Contact Support',
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
    <div className="flex items-center space-x-3 text-xs">
      {/* Active Website Selector */}
      <div className="relative">
        <button
          onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 font-semibold text-zinc-800 shadow-2xs transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-600" />
          <span className="truncate max-w-[140px]">{activeWebsite.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
        </button>

        {isSiteDropdownOpen && (
          <div className="absolute left-0 mt-1.5 w-64 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95">
            <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Websites
            </div>
            {websites.map((site) => (
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
                  <div className="truncate">{site.name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono font-normal">
                    {site.domain} • {site.pages.length} pages
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
                <span>+ Create New Website</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pages Pills Navigation */}
      <div className="flex items-center space-x-1 bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/80 max-w-[380px] overflow-x-auto scrollbar-none">
        {activeWebsite.pages.map((p) => (
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

      {/* Modal: Create New Website */}
      {isNewSiteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-zinc-900">Create New Website</h3>
            </div>

            <form onSubmit={handleCreateSiteSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Website Name
                </label>
                <input
                  type="text"
                  required
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  placeholder="e.g. Acme SaaS Cloud"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Domain (or Subdomain)
                </label>
                <input
                  type="text"
                  value={newSiteDomain}
                  onChange={(e) => setNewSiteDomain(e.target.value)}
                  placeholder="https://www.acmecloud.io"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 font-mono text-zinc-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">Category</label>
                <select
                  value={newSiteCategory}
                  onChange={(e) => setNewSiteCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="saas">SaaS Platform</option>
                  <option value="portfolio">Developer Portfolio</option>
                  <option value="ecommerce">E-Commerce Store</option>
                  <option value="documentation">Documentation Hub</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewSiteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                >
                  Create Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create New Webpage */}
      {isNewPageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-zinc-900">
                Add New Page to {activeWebsite.name}
              </h3>
            </div>

            <form onSubmit={handleCreatePageSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">Page Title</label>
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
                  placeholder="e.g. Solutions, Careers, Docs"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  URL Slug (path)
                </label>
                <div className="flex items-center space-x-1 font-mono text-xs text-zinc-500">
                  <span>/</span>
                  <input
                    type="text"
                    required
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    placeholder="solutions"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 font-mono text-zinc-800"
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
