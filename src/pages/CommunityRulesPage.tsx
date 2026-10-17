import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Menu } from 'lucide-react';
import { FooterLinks } from '../components/FooterLinks';

interface CommunityRulesPageProps {
  onNavigate?: (nav: string, topic?: string) => void;
  onOpenMenu?: () => void;
}

export function CommunityRulesPage({ onNavigate, onOpenMenu }: CommunityRulesPageProps) {
  const [reason, setReason] = useState('Privacy / personal information');
  const [context, setContext] = useState('The excerpt includes an identifying detail.');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
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
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">Community rules</h2>
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
            CCHAT / KEEP IT HUMAN
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Good plot. Real boundaries.
          </h1>
          <p className="text-sm text-ink-muted mt-2 mb-7">
            Enjoy the chat without turning someone’s life into content at their expense.
          </p>

          {/* Before you publish card */}
          <div className="rounded-2xl bg-canvas-2 border border-line-2 p-6 mb-7 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Before you publish
            </h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Ask: Does this expose someone? Is the title honest? Could the message itself identify them? Would sharing it put someone at risk? If the answer is yes, leave it private.
            </p>
            <div className="text-[10px] text-ink-faint pt-2 font-mono">
              Conceptual community guidance · Product design edition · October 2026
            </div>
          </div>

          {/* Rule 1 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Keep private information private.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Do not publish addresses, phone numbers, financial details, health information, private images or identifying clues about someone who has not agreed to be identified. Hidden names are not enough if the messages reveal who a person is. Review your selection and remove sensitive content before you publish.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              No harassment. No hate. No pile-ons.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Disagreement is not permission to threaten, dehumanize or target someone. Don’t encourage readers to find a participant, contact their workplace or flood their accounts. Hate directed at protected characteristics and threats of harm have no place here. React to the message, not against a person.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Respect consent and boundaries.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Do not use publication to pressure someone to reply, expose intimate content or punish a private disagreement. An anonymous participant is still a person. If an excerpt makes someone unsafe or exposes personal details, stop sharing it and use the reporting controls.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Be honest about what readers are seeing.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Do not impersonate other people, present altered messages as authentic or use a misleading title to manufacture a different story. Add context without revealing private information. Public excerpts should not be used for scams, deceptive promotions or undisclosed paid endorsements.
            </p>
          </div>

          {/* Rule 5 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Keep sexual exploitation and dangerous content out.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Do not post exploitative sexual content, sexual content involving minors, encouragement of self-harm or instructions to harm others. Avoid graphic material shared for shock value. If there is immediate danger, contact appropriate local emergency resources rather than relying on an in-app report.
            </p>
          </div>

          {/* Rule 6 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Don’t spam the plot.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Avoid repetitive promotional messages, reaction manipulation and coordinated targeting. Clearly labeled sponsor placements are separate from organic conversations. Private inboxes are not an advertising channel; respect someone’s choice to block or stop replying.
            </p>
          </div>

          {/* Rule 7 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Use the controls without escalating.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Hide an excerpt you don’t want to read, mute a private conversation or block an account. Report the specific content and select a reason. Describe what happened in your own words without republishing sensitive details. These are product-design guidelines; they do not promise a response time or a particular enforcement outcome.
            </p>
          </div>

          {/* Bottom link */}
          <div className="pt-7 pb-12">
            <button
              onClick={() => onNavigate?.('Privacy')}
              className="text-xs text-accent hover:text-accent-bright hover:underline cursor-pointer transition-colors"
            >
              Read Privacy for how public excerpts and anonymous identities work.
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-canvas-deep border-l border-line">
        {/* Report content card */}
        <div className="p-5 rounded-2xl bg-canvas-2 border border-line-2 space-y-3.5 shadow-lg">
          <h4 className="text-xs font-bold text-white">Report content</h4>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            Use a chat’s ··· menu to report the specific excerpt. This is the report form preview.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
                Reason
              </label>
              <div className="relative">
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-canvas-deep border border-line-2 rounded-xl px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-accent cursor-pointer pr-8"
                >
                  <option value="Privacy / personal information">Privacy / personal information</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Hate speech">Hate speech</option>
                  <option value="Threats of harm">Threats of harm</option>
                  <option value="Impersonation">Impersonation</option>
                  <option value="Spam">Spam</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block mb-1.5">
                Context
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                className="w-full bg-canvas-deep border border-line-2 rounded-xl p-3 text-xs text-ink focus:outline-none focus:border-accent resize-none leading-relaxed"
              />
              <div className="text-[10px] text-ink-faint mt-1">
                Only include what’s needed to explain the issue.
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-accent-strong hover:bg-accent text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-accent/20 active:scale-98"
            >
              {submitted ? 'Report previewed ✓' : 'Submit report'}
            </button>
          </form>

          <div className="text-[10px] text-ink-muted/90 pt-1 leading-relaxed">
            Other reasons: harassment · hate · threats · impersonation · spam
          </div>
        </div>

        {/* What you can do now card */}
        <div className="p-5 rounded-2xl bg-canvas-2 border border-line-2 space-y-2.5 shadow-lg">
          <h4 className="text-xs font-bold text-white mb-1">What you can do now</h4>
          <div className="space-y-1 text-xs text-ink-soft">
            <div className="py-1 hover:text-white cursor-pointer transition-colors">Hide this public chat</div>
            <div className="py-1 hover:text-white cursor-pointer transition-colors">Mute a private conversation</div>
            <div className="py-1 hover:text-white cursor-pointer transition-colors">Block an account</div>
            <div className="py-1 hover:text-white cursor-pointer transition-colors">Remove your publication</div>
          </div>
          <p className="text-[10px] text-ink-faint leading-relaxed pt-2 border-t border-line">
            Blocking is a personal boundary, not a guarantee that a public excerpt has been removed.
          </p>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-ink-faint space-y-1 pt-1 px-1">
          <FooterLinks onNavigate={onNavigate} current="Community rules" />
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}
