import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Upload, 
  Sparkles, 
  Tag, 
  Brain, 
  Sliders, 
  MessageSquare,
  Check
} from 'lucide-react';
import { CharacterPersona } from '../types';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: CharacterPersona) => void;
  characterToEdit?: CharacterPersona | null;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  characterToEdit
}) => {
  const [name, setName] = useState(characterToEdit?.name || '');
  const [title, setTitle] = useState(characterToEdit?.title || '');
  const [avatar, setAvatar] = useState(characterToEdit?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80');
  const [description, setDescription] = useState(characterToEdit?.description || '');
  const [systemPrompt, setSystemPrompt] = useState(characterToEdit?.systemPrompt || '');
  const [scenario, setScenario] = useState(characterToEdit?.scenario || '');
  const [greeting, setGreeting] = useState(characterToEdit?.greeting || '');
  const [tagInput, setTagInput] = useState(characterToEdit?.tags.join(', ') || 'Roleplay, Sci-Fi');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newChar: CharacterPersona = {
      id: characterToEdit?.id || `char-${Date.now()}`,
      name: name || 'New Persona',
      title: title || 'Custom Companion',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      description,
      tags: tagInput.split(',').map(t => t.trim()).filter(Boolean),
      systemPrompt,
      scenario,
      greeting,
      temperature: characterToEdit?.temperature ?? 0.8,
      topP: characterToEdit?.topP ?? 0.9,
      contextLength: 8192,
      activeMemory: characterToEdit?.activeMemory ?? ''
    };
    onSave(newChar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="bg-[#0e0d16] border border-[#262438] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-[#1c1a29]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-white">
              {characterToEdit ? 'Edit Persona Card' : 'Create New AI Character'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1a1827] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Avatar and Basic Details */}
          <div className="flex gap-4 items-start">
            <div className="relative group shrink-0">
              <img
                src={avatar}
                alt="Preview"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#2b273f]"
              />
              <div className="text-[10px] text-center mt-1 text-slate-500">Avatar</div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Character Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vance or Nyx"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#12111b] border border-[#211f30] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Title / Archetype</label>
                <input
                  type="text"
                  placeholder="e.g. Rogue Netrunner or Stellar Cartographer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#12111b] border border-[#211f30] rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Avatar Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-[#12111b] border border-[#211f30] rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500 text-[11px] font-mono"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Short Description</label>
            <textarea
              rows={2}
              placeholder="A brief overview of their background and role in your world..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#12111b] border border-[#211f30] rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              placeholder="Cyberpunk, Roleplay, Detective, Dark"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full bg-[#12111b] border border-[#211f30] rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* System Prompt */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">System Prompt / Persona Rules</label>
            <textarea
              rows={3}
              placeholder="Direct instructions on behavior, tone, accents, and persona..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full bg-[#12111b] border border-[#211f30] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 resize-none font-mono"
            />
          </div>

          {/* First Greeting */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">First Message (Greeting)</label>
            <textarea
              rows={2}
              placeholder="The opening line sent when starting a new chat..."
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full bg-[#12111b] border border-[#211f30] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#1c1a29] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#171524] hover:bg-[#201e30] text-slate-300 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Persona</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
