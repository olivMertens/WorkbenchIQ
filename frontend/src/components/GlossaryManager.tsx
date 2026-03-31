'use client';

import {
  Search,
  Book,
  FolderPlus,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import useGlossaryManager from './glossary/useGlossaryManager';
import GlossaryCategorySection from './glossary/GlossaryCategorySection';
import GlossarySearchResults from './glossary/GlossarySearchResults';

interface GlossaryManagerProps {
  persona: string;
  personaName: string;
}

export default function GlossaryManager({ persona, personaName }: GlossaryManagerProps) {
  const g = useGlossaryManager(persona);

  if (g.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="ml-3 text-slate-600">Loading glossary...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Book className="w-6 h-6 text-indigo-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{personaName} Glossary</h2>
            <p className="text-sm text-slate-600">
              {g.glossary?.total_terms || 0} terms in {g.glossary?.categories.length || 0} categories
            </p>
          </div>
        </div>
        <button onClick={() => g.setShowNewCategoryForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <FolderPlus className="w-4 h-4" />Add Category
        </button>
      </div>

      {/* Messages */}
      {g.error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{g.error}</span>
        </div>
      )}
      {g.success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <Check className="w-5 h-5 flex-shrink-0" /><span>{g.success}</span>
        </div>
      )}

      {/* New category form */}
      {g.showNewCategoryForm && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-slate-800 mb-3">Add New Category</h3>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm text-slate-600 mb-1">Category ID</label>
              <input type="text" value={g.newCategoryData.id}
                onChange={(e) => g.setNewCategoryData(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., cardiovascular" />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-slate-600 mb-1">Display Name</label>
              <input type="text" value={g.newCategoryData.name}
                onChange={(e) => g.setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Cardiovascular" />
            </div>
            <button onClick={g.handleAddCategory} disabled={g.saving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              {g.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Add
            </button>
            <button onClick={() => { g.setShowNewCategoryForm(false); g.setNewCategoryData({ id: '', name: '' }); }}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Search and filter bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={g.searchQuery}
            onChange={(e) => g.setSearchQuery(e.target.value)}
            placeholder="Search terms..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          {g.searching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
          )}
        </div>

        {/* Alphabetic filter */}
        <div className="flex items-center gap-1 flex-wrap">
          <button onClick={() => g.setLetterFilter(null)}
            className={`px-2 py-1 text-xs rounded ${g.letterFilter === null ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            All
          </button>
          {g.availableLetters.map((letter) => (
            <button key={letter} onClick={() => g.setLetterFilter(letter)}
              className={`px-2 py-1 text-xs rounded ${g.letterFilter === letter ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Search results or categories */}
      {g.searchResults ? (
        <GlossarySearchResults
          searchResults={g.searchResults}
          searchQuery={g.searchQuery}
          saving={g.saving}
          onClearSearch={() => { g.setSearchQuery(''); g.setSearchResults(null); }}
          onStartEditTerm={g.startEditingTerm}
          onDeleteTerm={g.handleDeleteTerm}
        />
      ) : (
        <div>
          {g.filteredCategories.map((category) => (
            <GlossaryCategorySection
              key={category.id}
              category={category}
              isExpanded={g.expandedCategories.has(category.id)}
              editingTerm={g.editingTerm}
              editingCategory={g.editingCategory}
              editFormData={g.editFormData}
              editCategoryName={g.editCategoryName}
              showNewTermForm={g.showNewTermForm}
              newTermData={g.newTermData}
              saving={g.saving}
              onToggle={g.toggleCategory}
              onStartEditTerm={g.startEditingTerm}
              onCancelEditTerm={() => { g.setEditingTerm(null); g.setEditFormData({}); }}
              onUpdateTerm={g.handleUpdateTerm}
              onDeleteTerm={g.handleDeleteTerm}
              onShowNewTermForm={g.setShowNewTermForm}
              onCancelNewTerm={() => { g.setShowNewTermForm(null); g.setNewTermData({ abbreviation: '', meaning: '', context: '' }); }}
              onNewTermChange={g.setNewTermData}
              onAddTerm={g.handleAddTerm}
              onStartEditCategory={(id, name) => { g.setEditingCategory(id); g.setEditCategoryName(name); }}
              onCancelEditCategory={() => { g.setEditingCategory(null); g.setEditCategoryName(''); }}
              onEditCategoryNameChange={g.setEditCategoryName}
              onUpdateCategory={g.handleUpdateCategory}
              onDeleteCategory={g.handleDeleteCategory}
              onEditFormDataChange={g.setEditFormData}
              onExpandCategory={(id) => g.setExpandedCategories(prev => new Set(Array.from(prev).concat(id)))}
            />
          ))}
          {g.filteredCategories.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              {g.letterFilter ? `No terms starting with "${g.letterFilter}"` : 'No categories found'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
