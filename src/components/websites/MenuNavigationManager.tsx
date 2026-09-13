import React, { useState } from 'react';
import { Website, NavigationMenuItem, Webpage } from '../../types/canvas';
import {
  Menu,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Check,
  X,
  Link as LinkIcon,
  Sparkles,
  Layers,
} from 'lucide-react';

interface MenuNavigationManagerProps {
  isOpen: boolean;
  website: Website;
  onClose: () => void;
  onSaveMenuItems: (items: NavigationMenuItem[]) => void;
  onNavigateToPage?: (pageId: string) => void;
}

export const MenuNavigationManager: React.FC<MenuNavigationManagerProps> = ({
  isOpen,
  website,
  onClose,
  onSaveMenuItems,
  onNavigateToPage,
}) => {
  // Default menu items if none exist
  const initialItems: NavigationMenuItem[] =
    website.menuItems && website.menuItems.length > 0
      ? website.menuItems
      : website.pages.map((p, idx) => ({
          id: `menu-${p.id}`,
          label: p.title,
          pageId: p.id,
          slug: p.slug,
          order: idx + 1,
          isVisible: true,
        }));

  const [items, setItems] = useState<NavigationMenuItem[]>(initialItems);
  const [newLabel, setNewLabel] = useState('');
  const [newPageId, setNewPageId] = useState<string>(website.pages[0]?.id || '');
  const [newExternalUrl, setNewExternalUrl] = useState('');
  const [linkType, setLinkType] = useState<'page' | 'external'>('page');
  const [hasChanges, setHasChanges] = useState(false);

  if (!isOpen) return null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const selectedPage = website.pages.find((p) => p.id === newPageId);

    const newItem: NavigationMenuItem = {
      id: `menu-item-${Date.now()}`,
      label: newLabel.trim(),
      pageId: linkType === 'page' ? newPageId : undefined,
      slug: linkType === 'page' ? selectedPage?.slug : undefined,
      externalUrl: linkType === 'external' ? newExternalUrl.trim() : undefined,
      order: items.length + 1,
      isVisible: true,
    };

    setItems([...items, newItem]);
    setNewLabel('');
    setNewExternalUrl('');
    setHasChanges(true);
  };

  const handleToggleVisibility = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isVisible: !it.isVisible } : it))
    );
    setHasChanges(true);
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setHasChanges(true);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const newArr = [...items];
    const [moved] = newArr.splice(index, 1);
    newArr.splice(targetIdx, 0, moved);

    // Re-index orders
    const reordered = newArr.map((it, idx) => ({ ...it, order: idx + 1 }));
    setItems(reordered);
    setHasChanges(true);
  };

  const handleSave = () => {
    onSaveMenuItems(items);
    setHasChanges(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-zinc-200 overflow-hidden text-zinc-900">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Menu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Website Navigation Menu Linker</h3>
              <p className="text-xs text-zinc-500">
                Connect and order top menu navigation items across all {website.pages.length} pages in "{website.name}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Visual Menu Preview Bar */}
          <div className="bg-zinc-900 text-white p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
              <span className="font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Live Navbar Preview
              </span>
              <span className="text-[11px] text-zinc-500">Updates across all site pages</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-zinc-800/80 rounded-lg">
              <div className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5">
                <span className="text-indigo-400">⚡</span>
                {website.name}
              </div>
              <div className="flex items-center space-x-3 text-xs">
                {items
                  .filter((it) => it.isVisible)
                  .map((it) => (
                    <span
                      key={it.id}
                      className="text-zinc-300 hover:text-white px-2 py-1 rounded bg-zinc-700/50 cursor-default"
                    >
                      {it.label}
                    </span>
                  ))}
              </div>
              <span className="px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-semibold rounded-md">
                CTA
              </span>
            </div>
          </div>

          {/* Current Navigation Items List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
              <span>Configured Menu Links ({items.length})</span>
              <span className="text-[11px] font-normal text-zinc-400">Reorder with arrows</span>
            </h4>

            {items.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-zinc-200 rounded-xl text-xs text-zinc-500">
                No menu items configured yet. Add your first link below!
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => {
                  const targetPage = website.pages.find((p) => p.id === item.pageId);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        item.isVisible
                          ? 'bg-white border-zinc-200 shadow-2xs hover:border-indigo-200'
                          : 'bg-zinc-50 border-zinc-200/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-mono font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-xs text-zinc-900">{item.label}</span>
                            {!item.isVisible && (
                              <span className="text-[10px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded font-medium">
                                Hidden
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-500 flex items-center space-x-1.5 mt-0.5">
                            {item.pageId ? (
                              <>
                                <FileText className="w-3 h-3 text-indigo-500" />
                                <span>Links to Page:</span>
                                <span className="font-mono text-indigo-600 font-semibold">
                                  /{item.slug || targetPage?.slug || 'page'} ({targetPage?.title || 'Unknown'})
                                </span>
                              </>
                            ) : (
                              <>
                                <ExternalLink className="w-3 h-3 text-amber-500" />
                                <span>External URL:</span>
                                <span className="font-mono text-zinc-600">{item.externalUrl || '#'}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          title="Move up"
                          className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === items.length - 1}
                          title="Move down"
                          className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleVisibility(item.id)}
                          title={item.isVisible ? 'Hide from navbar' : 'Show in navbar'}
                          className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100"
                        >
                          {item.isVisible ? (
                            <Eye className="w-3.5 h-3.5 text-zinc-600" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          title="Remove item"
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add New Menu Item Form */}
          <form onSubmit={handleAddItem} className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                Add New Navigation Menu Item
              </span>
              <div className="flex items-center space-x-1 bg-zinc-200/80 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setLinkType('page')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-all ${
                    linkType === 'page' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-zinc-600'
                  }`}
                >
                  Internal Page
                </button>
                <button
                  type="button"
                  onClick={() => setLinkType('external')}
                  className={`px-2.5 py-0.5 rounded font-medium transition-all ${
                    linkType === 'external' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-zinc-600'
                  }`}
                >
                  External URL
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                  Menu Display Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pricing, Docs, About Us"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {linkType === 'page' ? (
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                    Select Target Webpage
                  </label>
                  <select
                    value={newPageId}
                    onChange={(e) => {
                      setNewPageId(e.target.value);
                      if (!newLabel) {
                        const p = website.pages.find((page) => page.id === e.target.value);
                        if (p) setNewLabel(p.title);
                      }
                    }}
                    className="w-full text-xs px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {website.pages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} (/{p.slug})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">
                    Destination URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://docs.example.com"
                    value={newExternalUrl}
                    onChange={(e) => setNewExternalUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!newLabel.trim()}
              className="w-full py-2 bg-white border border-zinc-300 hover:border-indigo-500 hover:text-indigo-600 text-zinc-700 text-xs font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              + Add to Navigation Menu
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            {hasChanges ? (
              <span className="text-amber-600 font-medium">Unsaved menu changes</span>
            ) : (
              <span>All links in sync with website navbar</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Apply Navigation Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
