import React, { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

interface CommunityRulesPageProps {
  onNavigate?: (nav: string, topic?: string) => void;
}

export function CommunityRulesPage({ onNavigate }: CommunityRulesPageProps) {
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
      <div className="flex-1 flex flex-col border-r border-[#171722] min-w-0 bg-[#09090f]">
        {/* Top Header */}
        <header className="h-16 px-8 border-b border-[#191924] flex items-center justify-between shrink-0 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white tracking-tight">Community rules</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats, people, plot twists"
                className="w-full bg-[#12121c] border border-[#212130] focus:border-blue-500 rounded-full pl-9 pr-12 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono bg-[#1c1c2b] px-1.5 py-0.5 rounded border border-[#29293d]">⌘ K</span>
            </div>
            <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-[#161624] transition-colors cursor-pointer relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 px-8 py-7 overflow-y-auto max-w-4xl">
          {/* Breadcrumb */}
          <div className="text-[11px] font-bold tracking-wider text-blue-400 uppercase">
            CCHAT / KEEP IT HUMAN
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Good plot. Real boundaries.
          </h1>
          <p className="text-sm text-slate-400 mt-2 mb-7">
            Enjoy the chat without turning someone’s life into content at their expense.
          </p>

          {/* Before you publish card */}
          <div className="rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] p-6 mb-7 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Before you publish
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ask: Does this expose someone? Is the title honest? Could the message itself identify them? Would sharing it put someone at risk? If the answer is yes, leave it private.
            </p>
            <div className="text-[10px] text-slate-500 pt-2 font-mono">
              Conceptual community guidance · Product design edition · October 2026
            </div>
          </div>

          {/* Rule 1 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Keep private information private.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Do not publish addresses, phone numbers, financial details, health information, private images or identifying clues about someone who has not agreed to be identified. Hidden names are not enough if the messages reveal who a person is. Review your selection and remove sensitive content before you publish.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              No harassment. No hate. No pile-ons.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Disagreement is not permission to threaten, dehumanize or target someone. Don’t encourage readers to find a participant, contact their workplace or flood their accounts. Hate directed at protected characteristics and threats of harm have no place here. React to the message, not against a person.
            </p>
          </div>

          {/* Rule 3 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Respect consent and boundaries.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Do not use publication to pressure someone to reply, expose intimate content or punish a private disagreement. An anonymous participant is still a person. If an excerpt makes someone unsafe or exposes personal details, stop sharing it and use the reporting controls.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Be honest about what readers are seeing.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Do not impersonate other people, present altered messages as authentic or use a misleading title to manufacture a different story. Add context without revealing private information. Public excerpts should not be used for scams, deceptive promotions or undisclosed paid endorsements.
            </p>
          </div>

          {/* Rule 5 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Keep sexual exploitation and dangerous content out.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Do not post exploitative sexual content, sexual content involving minors, encouragement of self-harm or instructions to harm others. Avoid graphic material shared for shock value. If there is immediate danger, contact appropriate local emergency resources rather than relying on an in-app report.
            </p>
          </div>

          {/* Rule 6 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Don’t spam the plot.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Avoid repetitive promotional messages, reaction manipulation and coordinated targeting. Clearly labeled sponsor placements are separate from organic conversations. Private inboxes are not an advertising channel; respect someone’s choice to block or stop replying.
            </p>
          </div>

          {/* Rule 7 */}
          <div className="py-6 border-b border-[#181824] space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Use the controls without escalating.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hide an excerpt you don’t want to read, mute a private conversation or block an account. Report the specific content and select a reason. Describe what happened in your own words without republishing sensitive details. These are product-design guidelines; they do not promise a response time or a particular enforcement outcome.
            </p>
          </div>

          {/* Bottom link */}
          <div className="pt-7 pb-12">
            <button
              onClick={() => onNavigate?.('Privacy')}
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
            >
              Read Privacy for how public excerpts and anonymous identities work.
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-[300px] shrink-0 p-5 space-y-5 overflow-y-auto bg-[#09090f]">
        {/* Report content card */}
        <div className="p-5 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-3.5 shadow-lg">
          <h4 className="text-xs font-bold text-white">Report content</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Use a chat’s ··· menu to report the specific excerpt. This is the report form preview.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Reason
              </label>
              <div className="relative">
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#0a0a10] border border-[#202030] rounded-xl px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
                >
                  <option value="Privacy / personal information">Privacy / personal information</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Hate speech">Hate speech</option>
                  <option value="Threats of harm">Threats of harm</option>
                  <option value="Impersonation">Impersonation</option>
                  <option value="Spam">Spam</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Context
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                className="w-full bg-[#0a0a10] border border-[#202030] rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
              />
              <div className="text-[10px] text-slate-500 mt-1">
                Only include what’s needed to explain the issue.
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-blue-500/20 active:scale-98"
            >
              {submitted ? 'Report previewed ✓' : 'Submit report'}
            </button>
          </form>

          <div className="text-[10px] text-slate-400/90 pt-1 leading-relaxed">
            Other reasons: harassment · hate · threats · impersonation · spam
          </div>
        </div>

        {/* What you can do now card */}
        <div className="p-5 rounded-2xl bg-[#0f0f18] border border-[#1f1f2e] space-y-2.5 shadow-lg">
          <h4 className="text-xs font-bold text-white mb-1">What you can do now</h4>
          <div className="space-y-1 text-xs text-slate-300">
            <div className="py-1 hover:text-white cursor-pointer transition-colors">Hide this public chat</div>
            <div className="py-1 hover:text-white cursor-pointer transition-colors">Mute a private conversation</div>
            <div className="py-1 hover:text-white cursor-pointer transition-colors">Block an account</div>
            <div className="py-1 hover:text-white cursor-pointer transition-colors">Remove your publication</div>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed pt-2 border-t border-[#181826]">
            Blocking is a personal boundary, not a guarantee that a public excerpt has been removed.
          </p>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-slate-500 space-y-1 pt-1 px-1">
          <div className="flex gap-2">
            <span onClick={() => onNavigate?.('About CCHAT')} className="hover:underline cursor-pointer">About</span>
            <span>·</span>
            <span onClick={() => onNavigate?.('Community rules')} className="hover:underline cursor-pointer text-slate-300">Community rules</span>
            <span>·</span>
            <span onClick={() => onNavigate?.('Privacy')} className="hover:underline cursor-pointer">Privacy</span>
          </div>
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}
