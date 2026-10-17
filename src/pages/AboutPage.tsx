import React from 'react';
import { Search, Bell, Heart, Flame, ShieldCheck, Menu } from 'lucide-react';
import { FooterLinks } from '../components/FooterLinks';

interface AboutPageProps {
  onNavigate?: (nav: string, topic?: string) => void;
  onOpenMenu?: () => void;
}

export function AboutPage({ onNavigate, onOpenMenu }: AboutPageProps) {
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
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">About CCHAT</h2>
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
          {/* Breadcrumb / Tag */}
          <div className="text-[11px] font-bold tracking-wider text-accent uppercase">
            ABOUT CCHAT
          </div>

          {/* Headline & Subhead */}
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Real chats. Main-character energy.
          </h1>
          <p className="text-sm text-ink-muted mt-2 mb-7">
            A little less posting. A lot more plot.
          </p>

          {/* Hero Highlight Card */}
          <div className="rounded-2xl bg-canvas-2 border border-line-2 p-6 mb-7 shadow-lg">
            <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
              A normal private chat app.<br />
              With a public side worth reading.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed mt-3">
              CCHAT is for talking with your people first. When a conversation has a little extra plot, a participant can publish a selected excerpt for everyone else to read. Your inbox is still your inbox.
            </p>
          </div>

          {/* Section 1 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Start private. Keep talking.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Start a chat with someone by name or handle. Send messages, make plans and keep the conversation going in My chats. New messages are private by default. Following a person, saving an excerpt or reacting to a message never joins their private conversation.
            </p>
          </div>

          {/* Section 2 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Publish the plot. Not their identity.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Publication is a separate choice. Select the messages, add a title and topic, then review the public preview. If only one participant publishes, the other person’s name, handle and photo are hidden. Both identities appear only when both participants publish. Future messages are not automatically added to the excerpt.
            </p>
          </div>

          {/* Section 3 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Read a chat. Set the mood.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Discover, Following, Fresh and topic feeds are public reading spaces. Readers can react to individual messages with exactly heart, cap, skull or fire. The leading reaction colors that message: warm rose for heart, blue for cap, neutral gray for skull and warm orange for fire. Reactions add a little atmosphere, not another participant.
            </p>
          </div>

          {/* Section 4 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Anonymous doesn’t mean unrecognizable.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              A hidden profile is not a promise that nobody can guess who wrote a message. Names, locations, workplaces and other clues inside the text can still identify someone. Review an excerpt carefully and leave out personal or sensitive information before publishing.
            </p>
          </div>

          {/* Section 5 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Save the good parts. Leave people alone.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Saved collections are private to you. Public profiles show published chats, never someone’s inbox. Enjoy the conversation without trying to find anonymous participants, contacting them about an excerpt or turning a reaction into a pile-on. Community rules explain the boundaries.
            </p>
          </div>

          {/* Section 6 */}
          <div className="py-6 border-b border-line space-y-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Sponsors are not the story.
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Paid placements are clearly labeled Sponsored and kept separate from organic public chats and editorial picks. Sponsor content belongs on public reading or discovery surfaces, not inside private conversations.
            </p>
          </div>

          {/* Bottom Actions */}
          <div className="pt-7 pb-12 flex items-center gap-3">
            <button
              onClick={() => onNavigate?.('Discover')}
              className="px-5 py-2.5 rounded-xl bg-accent-strong hover:bg-accent text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-accent/20 active:scale-98"
            >
              Discover public chats
            </button>
            <button
              onClick={() => onNavigate?.('Start a chat')}
              className="px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-2 text-ink border border-line-2 font-bold text-xs transition-colors cursor-pointer active:scale-98"
            >
              Start a private chat
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 p-4 lg:p-5 space-y-5 overflow-y-auto bg-canvas-deep border-l border-line">
        {/* You set the mood Card */}
        <div className="p-5 rounded-2xl bg-canvas-2 border border-line-2 space-y-3 shadow-lg">
          <h4 className="text-xs font-bold text-white">You set the mood.</h4>
          <p className="text-[11px] text-ink-muted leading-relaxed">
            React to a message. Its leading reaction colors the bubble.
          </p>
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface border border-line-2 w-[58px]">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span className="text-[10px] text-ink-muted font-medium">Heart</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface border border-line-2 w-[58px]">
              <span className="text-sm leading-none">🧢</span>
              <span className="text-[10px] text-ink-muted font-medium">Cap</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface border border-line-2 w-[58px]">
              <span className="text-sm leading-none">💀</span>
              <span className="text-[10px] text-ink-muted font-medium">Skull</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-surface border border-line-2 w-[58px]">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-[10px] text-ink-muted font-medium">Fire</span>
            </div>
          </div>
        </div>

        {/* Two spaces. One app Card */}
        <div className="p-5 rounded-2xl bg-canvas-2 border border-line-2 space-y-4 shadow-lg">
          <h4 className="text-xs font-bold text-white">Two spaces. One app.</h4>
          <div>
            <div className="text-[10px] font-black tracking-wider text-accent uppercase">MY CHATS</div>
            <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
              Private conversations with the people you choose.
            </p>
          </div>
          <div className="pt-1 border-t border-line">
            <div className="text-[10px] font-black tracking-wider text-accent uppercase pt-2">DISCOVER</div>
            <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
              Published excerpts you can read, save and react to.
            </p>
          </div>
        </div>

        {/* Public chat. Private identity Card */}
        <div className="p-5 rounded-2xl bg-canvas-2 border border-line-2 flex items-start gap-3 shadow-lg">
          <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold text-white">Public chat. Private identity.</h5>
            <p className="text-[11px] text-ink-muted leading-relaxed mt-1">
              One publisher makes the other participant Anonymous. Both identities appear only if both publish.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-ink-faint space-y-1 pt-1 px-1">
          <FooterLinks onNavigate={onNavigate} current="About CCHAT" />
          <div>© 2026 CCHAT. Keep it human.</div>
        </div>
      </aside>
    </div>
  );
}
