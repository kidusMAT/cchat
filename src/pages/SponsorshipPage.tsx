import React, { useState } from 'react';
import { Search, Bell, ChevronDown, CheckCircle2, AlertCircle, Menu } from 'lucide-react';
import { cchatApi } from '../services/api';
import { FooterLinks } from '../components/FooterLinks';

interface SponsorshipPageProps {
  onNavigate?: (nav: string, topic?: string) => void;
  onOpenMenu?: () => void;
}

export function SponsorshipPage({ onNavigate, onOpenMenu }: SponsorshipPageProps) {
  const [name, setName] = useState('Alex Morgan');
  const [brand, setBrand] = useState('After Hours');
  const [email, setEmail] = useState('alex@example.com');
  const [placement, setPlacement] = useState('Discover sponsor card');
  const [idea, setIdea] = useState('Late-night coffee and a playlist for the conversation that keeps going.');
  const [agreed, setAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !email.trim() || !idea.trim()) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await cchatApi.submitInquiry({
        name: name.trim(),
        brand: brand.trim(),
        email: email.trim(),
        placement_interest: placement,
        idea: idea.trim(),
        agreed_terms: agreed,
      });
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit partnership inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex h-full min-w-0">
      {/* Center Scrollable Area */}
      <div className="flex-1 flex flex-col border-r border-line min-w-0 bg-canvas-deep">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-6 md:px-8 border-b border-line flex items-center justify-between shrink-0 bg-canvas-deep/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                className="md:hidden p-1.5 -ml-1 text-ink-muted hover:text-white rounded-lg hover:bg-surface transition-colors cursor-pointer"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">Sponsorship / Learn more</h2>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => onNavigate?.('Search')}
              className="sm:hidden p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative w-48 sm:w-64 md:w-80 hidden sm:block">
              <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats, people, plot twists"
                className="w-full bg-surface border border-line-2 focus:border-accent rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder:text-ink-faint focus:outline-none transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-ink-faint font-mono bg-surface-2 px-1.5 py-0.5 rounded border border-line-strong">⌘ K</span>
            </div>
            <button
              onClick={() => onNavigate?.('Notifications')}
              className="p-2 text-ink-muted hover:text-white rounded-full hover:bg-surface transition-colors cursor-pointer relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 px-4 sm:px-6 md:px-8 py-5 sm:py-7 pb-20 md:pb-7 overflow-y-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="text-[11px] font-bold tracking-wider text-accent uppercase">
            CCHAT / PARTNER PROGRAM
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Support the plot. Don’t interrupt it.
          </h1>
          <p className="text-sm text-ink-muted mt-2 mb-7">
            Thoughtful, clearly labeled partner content for public reading and discovery.
          </p>

          {/* Intro Section */}
          <div className="space-y-2 mb-7">
            <h3 className="text-base font-bold text-white tracking-tight">
              A place for partners, not a disguised conversation.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Sponsorship gives a brand or project a defined, labeled placement alongside the public reading experience. It is separate from organic chat excerpts, public reactions and editorial selections. Paid copy should feel relevant without pretending to be a participant’s private message.
            </p>
          </div>

          {/* Paid Placement Example 1 */}
          <div className="mb-6">
            <div className="text-xs font-bold text-ink-soft mb-2">
              Paid placement example · Discover sponsor card
            </div>
            <div className="rounded-2xl bg-canvas-2 border border-line-2 p-5 shadow-lg flex flex-col md:flex-row gap-5 items-center">
              <div className="w-full md:w-52 h-36 rounded-xl overflow-hidden shrink-0 border border-line-2 relative">
                <img
                  src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80"
                  alt="After Hours"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-accent">
                  SPONSORED · PAID PLACEMENT EXAMPLE
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight">
                  After Hours. Fuel your next conversation.
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Late-night coffee, fresh playlists, better conversations.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate?.('After Hours sponsor detail')}
                    className="px-4 py-2 rounded-xl bg-accent-strong hover:bg-accent text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-accent/20 active:scale-98"
                  >
                    Visit After Hours
                  </button>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-ink-faint mt-2 font-mono">
              Featured partner showcase. Brand partnerships support public reading without interrupting private chats.
            </div>
          </div>

          {/* Paid Placement Example 2 */}
          <div className="mb-8">
            <div className="text-xs font-bold text-ink-soft mb-2">
              Paid placement example · Public reading support
            </div>
            <div className="rounded-2xl bg-canvas-2 border border-line-2 p-5 shadow-lg space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-accent">
                SPONSORED · AD
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Tonight's sponsor
              </h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                This public reading page is supported by After Hours. Keep the conversation going with a late-night coffee or a fresh playlist.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => onNavigate?.('After Hours sponsor detail')}
                  className="text-xs text-accent hover:text-accent-bright hover:underline cursor-pointer block text-left"
                >
                  Sponsor detail: After Hours · Clearly separate from the organic chat
                </button>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Where sponsorship belongs.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Public discovery and reading surfaces can include a labeled sponsor card or page-support placement. Private inboxes, private message threads and composers do not include sponsorship. Tonight’s picks remains an organic editorial destination and is not sold as a sponsor endorsement.
            </p>
          </div>

          {/* Section 2 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              What a responsible partnership needs.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Provide accurate creative, a clearly identified partner and a useful self-contained destination. No deceptive claims, impersonation or requests for sensitive information. Placement scope, creative review and any commercial terms would be agreed separately; this program preview offers no performance guarantee or confirmed inventory.
            </p>
          </div>

          {/* Section 3 */}
          <div className="py-6 border-b border-line space-y-2 mb-10">
            <h3 className="text-base font-bold text-white tracking-tight">
              What happens after an inquiry.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              An inquiry starts a discussion about fit, placement and the proposed creative. It is not a commitment to publish or a purchase. The final service would need to explain review, contact and handling details before accepting a live submission. The example at right shows the information needed to start that conversation.
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-canvas-deep border-l border-line">
        {/* Start a partner conversation card */}
        <div className="p-5 rounded-2xl bg-canvas-2 border border-line-2 space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white">Partner Inquiry</h4>
            <span className="text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full font-semibold">Open</span>
          </div>

          <p className="text-[11px] text-ink-muted leading-relaxed">
            Submit your concept for placement on public discovery and reading feeds.
          </p>

          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Inquiry submitted successfully</p>
                <p className="text-[11px] text-emerald-400/80 mt-1">Our sponsorship team will review your proposal and follow up at {email} within 2 business days.</p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-3 text-[11px] font-bold text-white underline hover:no-underline"
                >
                  Send another inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 pt-1">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-canvas-deep border border-line-2 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                  Brand / project
                </label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-canvas-deep border border-line-2 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                  Work email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-canvas-deep border border-line-2 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                  Placement interest
                </label>
                <div className="relative">
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value)}
                    className="w-full bg-canvas-deep border border-line-2 rounded-xl px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-accent cursor-pointer pr-8"
                  >
                    <option value="Discover sponsor card">Discover sponsor card</option>
                    <option value="Public reading support">Public reading support</option>
                    <option value="Topic partner placement">Topic partner placement</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1">
                  Your idea
                </label>
                <textarea
                  required
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={3}
                  className="w-full bg-canvas-deep border border-line-2 rounded-xl p-3 text-xs text-ink focus:outline-none focus:border-accent resize-none leading-relaxed"
                />
              </div>

              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-line-strong bg-canvas-deep text-accent focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] text-ink-muted leading-snug">
                  I understand sponsored content is clearly labeled and kept out of private chats.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-accent-strong hover:bg-accent disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-accent/20 active:scale-98"
              >
                {submitting ? 'Submitting...' : 'Send inquiry'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-[10px] text-ink-faint space-y-1 pt-1 px-1">
          <FooterLinks onNavigate={onNavigate} />
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}
