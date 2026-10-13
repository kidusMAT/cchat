import React, { useState } from 'react';
import { 
  CharacterPersona, 
  GenerationSettings 
} from '../types';
import { 
  X, 
  Sliders, 
  Cpu, 
  Brain, 
  Shield, 
  Database, 
  FileText, 
  Save, 
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';

interface InspectorProps {
  character: CharacterPersona;
  settings: GenerationSettings;
  onUpdateSettings: (settings: GenerationSettings) => void;
  onUpdateCharacter: (char: CharacterPersona) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  character,
  settings,
  onUpdateSettings,
  onUpdateCharacter,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'persona' | 'generation' | 'memory'>('persona');
  const [charDraft, setCharDraft] = useState<CharacterPersona>(character);
  const [settingsDraft, setSettingsDraft] = useState<GenerationSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateCharacter(charDraft);
    onUpdateSettings(settingsDraft);
  };

  return (
    <aside className="w-80 bg-[#09080e] border-l border-[#1e1c27] flex flex-col h-full text-slate-300 select-none z-20">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#1b1924]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h3 className="font-bold text-sm text-white">Inspector & Settings</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-[#161520] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-3 pt-2 gap-1 border-b border-[#181622]">
        <button
          onClick={() => setActiveTab('persona')}
          className={`flex-1 pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'persona'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Persona
        </button>
        <button
          onClick={() => setActiveTab('generation')}
          className={`flex-1 pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'generation'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Sampling
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`flex-1 pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'memory'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Memory
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {activeTab === 'persona' && (
          <>
            {/* Character Card Preview */}
            <div className="p-3 rounded-xl bg-[#13121b] border border-[#232030] space-y-2.5">
              <div className="flex items-center gap-3">
                <img
                  src={charDraft.avatar}
                  alt={charDraft.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#3b3650]"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">{charDraft.name}</h4>
                  <p className="text-[11px] text-slate-400">{charDraft.title}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {charDraft.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* System Prompt / Directive */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-blue-400" />
                Character System Prompt
              </label>
              <textarea
                value={charDraft.systemPrompt}
                onChange={(e) => setCharDraft({ ...charDraft, systemPrompt: e.target.value })}
                rows={4}
                className="w-full bg-[#111019] border border-[#222030] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none font-mono"
              />
            </div>

            {/* Scenario */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                World Scenario / Context
              </label>
              <textarea
                value={charDraft.scenario}
                onChange={(e) => setCharDraft({ ...charDraft, scenario: e.target.value })}
                rows={3}
                className="w-full bg-[#111019] border border-[#222030] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Initial Greeting */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                First Message / Hook
              </label>
              <textarea
                value={charDraft.greeting}
                onChange={(e) => setCharDraft({ ...charDraft, greeting: e.target.value })}
                rows={3}
                className="w-full bg-[#111019] border border-[#222030] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </>
        )}

        {activeTab === 'generation' && (
          <>
            {/* Model Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                Language Engine
              </label>
              <select
                value={settingsDraft.model}
                onChange={(e) => setSettingsDraft({ ...settingsDraft, model: e.target.value })}
                className="w-full bg-[#111019] border border-[#222030] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (Default)</option>
                <option value="GPT-4o Omniverse">GPT-4o Omniverse</option>
                <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                <option value="Llama 3 70B Instruct">Llama 3 70B Instruct (Local)</option>
                <option value="Mistral Large 2">Mistral Large 2</option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2 p-3 rounded-lg bg-[#111019] border border-[#201e2e]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-300">Temperature (Creativity)</span>
                <span className="font-mono text-blue-400 font-bold">{settingsDraft.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={settingsDraft.temperature}
                onChange={(e) => setSettingsDraft({ ...settingsDraft, temperature: parseFloat(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Deterministic (0.0)</span>
                <span>Creative (1.0+)</span>
              </div>
            </div>

            {/* Top-P Slider */}
            <div className="space-y-2 p-3 rounded-lg bg-[#111019] border border-[#201e2e]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-300">Top-P (Nucleus Sampling)</span>
                <span className="font-mono text-blue-400 font-bold">{settingsDraft.topP}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settingsDraft.topP}
                onChange={(e) => setSettingsDraft({ ...settingsDraft, topP: parseFloat(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Max Output Tokens */}
            <div className="space-y-2 p-3 rounded-lg bg-[#111019] border border-[#201e2e]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-300">Response Length (Max Tokens)</span>
                <span className="font-mono text-blue-400 font-bold">{settingsDraft.maxTokens}</span>
              </div>
              <input
                type="range"
                min="256"
                max="4096"
                step="256"
                value={settingsDraft.maxTokens}
                onChange={(e) => setSettingsDraft({ ...settingsDraft, maxTokens: parseInt(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Streaming Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#111019] border border-[#201e2e]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-medium text-slate-200">Stream Responses</span>
              </div>
              <input
                type="checkbox"
                checked={settingsDraft.streaming}
                onChange={(e) => setSettingsDraft({ ...settingsDraft, streaming: e.target.checked })}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
            </div>
          </>
        )}

        {activeTab === 'memory' && (
          <>
            {/* Active Character Memory / Lorebook */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Dynamic Memory / Recall Buffer
              </label>
              <textarea
                value={charDraft.activeMemory}
                onChange={(e) => setCharDraft({ ...charDraft, activeMemory: e.target.value })}
                rows={5}
                className="w-full bg-[#111019] border border-[#222030] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none font-mono"
                placeholder="Important facts the assistant remembers across conversations..."
              />
              <p className="text-[10px] text-slate-500">
                Injected into context window on every message exchange.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#111019] border border-[#201e2e] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-300">Context Window Used</span>
                <span className="font-mono text-emerald-400 font-bold">1,420 / 8,192</span>
              </div>
              <div className="w-full bg-[#201e2c] h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[18%]"></div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Save Button */}
      <div className="p-3 border-t border-[#181622] bg-[#0c0b13] flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 cursor-pointer transition-colors active:scale-98"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Apply Changes</span>
        </button>
      </div>
    </aside>
  );
};
