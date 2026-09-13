import React, { useState } from 'react';
import {
  Search,
  Plus,
  Heading,
  LayoutGrid,
  Zap,
  Tag,
  DollarSign,
  MessageSquare,
  Sparkles,
  Layout,
  Menu,
} from 'lucide-react';
import { ComponentDef } from '../../types/canvas';

interface ComponentPaletteProps {
  registry: Record<string, ComponentDef>;
  onAddComponent: (compDef: ComponentDef) => void;
}

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ registry, onAddComponent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const components: ComponentDef[] = Object.values(registry);

  const filteredComponents = components.filter((comp) => {
    const matchesQuery =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase());

    const isMatchCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'header' && comp.id.includes('navbar')) ||
      (selectedCategory === 'hero' && comp.id.includes('hero')) ||
      (selectedCategory === 'features' && (comp.id.includes('feature') || comp.id.includes('showcase') || comp.id.includes('logos'))) ||
      (selectedCategory === 'pricing' && comp.id.includes('pricing')) ||
      (selectedCategory === 'social' && comp.id.includes('testimonial')) ||
      (selectedCategory === 'conversion' && (comp.id.includes('cta') || comp.id.includes('banner'))) ||
      (selectedCategory === 'footer' && comp.id.includes('footer'));

    return matchesQuery && isMatchCategory;
  });

  const getSectionIcon = (id: string) => {
    if (id.includes('navbar')) return <Menu className="w-4 h-4 text-indigo-600" />;
    if (id.includes('hero')) return <Sparkles className="w-4 h-4 text-amber-500" />;
    if (id.includes('showcase')) return <Layout className="w-4 h-4 text-blue-600" />;
    if (id.includes('feature')) return <Zap className="w-4 h-4 text-violet-600" />;
    if (id.includes('pricing')) return <DollarSign className="w-4 h-4 text-emerald-600" />;
    if (id.includes('testimonial')) return <MessageSquare className="w-4 h-4 text-pink-500" />;
    if (id.includes('cta')) return <Tag className="w-4 h-4 text-indigo-600" />;
    return <LayoutGrid className="w-4 h-4 text-zinc-600" />;
  };

  return (
    <div className="w-80 bg-white border-r border-zinc-200 flex flex-col h-full text-zinc-800 shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 bg-zinc-50/60">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
            Website Sections
          </span>
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            SaaS Kit
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search sections (Hero, Pricing...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-zinc-800 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-zinc-400 shadow-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 mt-3 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'header', label: 'Navbar' },
            { id: 'hero', label: 'Hero' },
            { id: 'features', label: 'Features' },
            { id: 'pricing', label: 'Pricing' },
            { id: 'social', label: 'Reviews' },
            { id: 'conversion', label: 'CTA' },
            { id: 'footer', label: 'Footer' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredComponents.map((comp) => {
          return (
            <div
              key={comp.id}
              className="p-3.5 bg-white hover:bg-zinc-50 rounded-xl border border-zinc-200/90 hover:border-indigo-300 transition-all group cursor-pointer shadow-xs hover:shadow-sm"
              onClick={() => onAddComponent(comp)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-zinc-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    {getSectionIcon(comp.id)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                      {comp.name}
                    </h4>
                    <span className="text-[10px] text-zinc-400 capitalize">{comp.taxonomy_level} section</span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  + Add
                </span>
              </div>

              <p className="text-[11px] text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                {comp.description}
              </p>
            </div>
          );
        })}

        {filteredComponents.length === 0 && (
          <div className="text-center py-12 text-zinc-400 text-xs">
            No sections found matching your search.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-zinc-200 text-[11px] text-zinc-500 bg-zinc-50 text-center">
        Click any section to insert it into your SaaS website.
      </div>
    </div>
  );
};
