import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Tag, 
  Sparkles, 
  Pin, 
  Calendar,
  Check,
  X
} from 'lucide-react';
import { Note } from '../types';

interface NotesViewProps {
  notes: Note[];
  onAddNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Work' | 'Personal' | 'Ideas' | 'Shopping' | 'Finance'>('Ideas');
  const [tagsInput, setTagsInput] = useState('');

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      (n.tags && n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags.length > 0 ? tags : undefined,
      updatedAt: '2026-09-15',
      pinned: false,
    };

    onAddNote(newNote);
    setIsModalOpen(false);
    setTitle('');
    setContent('');
    setTagsInput('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span>Notes, Ideas & Quick Scratchpad</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Capture thoughts, grocery checklists, engineering sprint ideas, and AI drafts
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes, checklists, tags..."
          className="w-full pl-9 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500"
        />
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`p-4 rounded-2xl border flex flex-col justify-between transition-all space-y-3 ${
              note.pinned
                ? 'bg-neutral-900 border-indigo-500/40 ring-1 ring-indigo-500/20'
                : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-neutral-800 text-neutral-300">
                  {note.category}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onTogglePin(note.id)}
                    className={`p-1 rounded hover:bg-neutral-800 transition-colors ${
                      note.pinned ? 'text-indigo-400' : 'text-neutral-500'
                    }`}
                    title={note.pinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1 rounded text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white tracking-tight">{note.title}</h3>
              <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                {note.content}
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500">
              <span>{note.updatedAt}</span>
              {note.tags && (
                <div className="flex items-center gap-1">
                  {note.tags.map((t, idx) => (
                    <span key={idx} className="text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Create New Note</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grocery list for dinner party"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                  >
                    <option value="Ideas">Ideas</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">Tags</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="sprint, market, recipes"
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">Content</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Note body or bullet items..."
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
