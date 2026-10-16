import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Smile, Heart, ThumbsUp, Sparkles, Coffee } from 'lucide-react';

interface EmojiCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  emojis: Array<{ emoji: string; keywords: string[] }>;
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Smileys',
    icon: Smile,
    emojis: [
      { emoji: '😀', keywords: ['grinning', 'smile', 'happy'] },
      { emoji: '😃', keywords: ['smiley', 'happy', 'joy'] },
      { emoji: '😄', keywords: ['smile', 'laugh', 'happy'] },
      { emoji: '😁', keywords: ['beam', 'grin', 'happy'] },
      { emoji: '😆', keywords: ['laughing', 'satisfied', 'haha'] },
      { emoji: '😅', keywords: ['sweat', 'smile', 'nervous'] },
      { emoji: '😂', keywords: ['joy', 'tears', 'laugh', 'lol', 'haha'] },
      { emoji: '🤣', keywords: ['rofl', 'rolling', 'laughing'] },
      { emoji: '🥹', keywords: ['pleading', 'holding', 'tears', 'proud'] },
      { emoji: '☺️', keywords: ['smiling', 'warm', 'content'] },
      { emoji: '😊', keywords: ['blush', 'warm', 'happy'] },
      { emoji: '😇', keywords: ['innocent', 'angel', 'halo'] },
      { emoji: '🙂', keywords: ['slightly', 'smiling'] },
      { emoji: '🙃', keywords: ['upside', 'down', 'silly'] },
      { emoji: '😉', keywords: ['wink', 'flirt'] },
      { emoji: '😌', keywords: ['relieved', 'peaceful'] },
      { emoji: '😍', keywords: ['heart', 'eyes', 'love', 'crush'] },
      { emoji: '🥰', keywords: ['smiling', 'hearts', 'adore'] },
      { emoji: '😘', keywords: ['kiss', 'flirt', 'love'] },
      { emoji: '😗', keywords: ['kissing'] },
      { emoji: '😙', keywords: ['kissing', 'smiling'] },
      { emoji: '😚', keywords: ['kissing', 'closed', 'eyes'] },
      { emoji: '😋', keywords: ['yum', 'delicious', 'tasty'] },
      { emoji: '😛', keywords: ['tongue', 'playful'] },
      { emoji: '😝', keywords: ['squinting', 'tongue', 'prank'] },
      { emoji: '😜', keywords: ['winking', 'tongue', 'crazy'] },
      { emoji: '🤪', keywords: ['zany', 'wild', 'goofy'] },
      { emoji: '🤨', keywords: ['raised', 'eyebrow', 'skeptical'] },
      { emoji: '🧐', keywords: ['monocle', 'curious', 'hmm'] },
      { emoji: '🤓', keywords: ['nerd', 'geek', 'glasses'] },
      { emoji: '😎', keywords: ['cool', 'sunglasses', 'chill'] },
      { emoji: '🤩', keywords: ['star', 'struck', 'excited'] },
      { emoji: '🥳', keywords: ['party', 'celebrate', 'birthday'] },
      { emoji: '😏', keywords: ['smirk', 'suggestive'] },
      { emoji: '😒', keywords: ['unamused', 'annoyed'] },
      { emoji: '😞', keywords: ['disappointed', 'sad'] },
      { emoji: '😔', keywords: ['pensive', 'downcast'] },
      { emoji: '😟', keywords: ['worried', 'concerned'] },
      { emoji: '😕', keywords: ['confused', 'puzzled'] },
      { emoji: '🙁', keywords: ['slightly', 'frowning'] },
      { emoji: '😣', keywords: ['persevering', 'struggling'] },
      { emoji: '😖', keywords: ['confounded', 'distressed'] },
      { emoji: '😫', keywords: ['tired', 'frustrated'] },
      { emoji: '😩', keywords: ['weary', 'exhausted'] },
      { emoji: '🥺', keywords: ['pleading', 'begging', 'puppy'] },
      { emoji: '😢', keywords: ['crying', 'tear', 'sad'] },
      { emoji: '😭', keywords: ['sob', 'crying', 'loudly'] },
      { emoji: '😮‍💨', keywords: ['sigh', 'relief', 'tired'] },
      { emoji: '😤', keywords: ['triumph', 'huff', 'pout'] },
      { emoji: '😠', keywords: ['angry', 'mad', 'grumpy'] },
      { emoji: '😡', keywords: ['pouting', 'rage', 'furious'] },
      { emoji: '🤬', keywords: ['cursing', 'swearing', 'angry'] },
      { emoji: '🤯', keywords: ['exploding', 'mindblown'] },
      { emoji: '😳', keywords: ['flushed', 'embarrassed', 'shock'] },
      { emoji: '🥵', keywords: ['hot', 'sweating', 'spicy'] },
      { emoji: '🥶', keywords: ['cold', 'freezing', 'chill'] },
      { emoji: '😱', keywords: ['scream', 'fear', 'omg'] },
      { emoji: '😨', keywords: ['fearful', 'scared'] },
      { emoji: '😰', keywords: ['anxious', 'nervous'] },
      { emoji: '😥', keywords: ['sad', 'relieved'] },
      { emoji: '😓', keywords: ['downcast', 'sweat'] },
      { emoji: '🤗', keywords: ['hugging', 'warmth', 'embrace'] },
      { emoji: '🫡', keywords: ['salute', 'respect', 'yes'] },
      { emoji: '🤔', keywords: ['thinking', 'hmm', 'wonder'] },
      { emoji: '🫢', keywords: ['open', 'eyes', 'gasp'] },
      { emoji: '🤫', keywords: ['shushing', 'quiet', 'secret'] },
      { emoji: '🤥', keywords: ['lying', 'pinocchio'] },
      { emoji: '😶', keywords: ['speechless', 'silent'] },
      { emoji: '😐', keywords: ['neutral', 'blank'] },
      { emoji: '😑', keywords: ['expressionless', 'meh'] },
      { emoji: '😬', keywords: ['grimace', 'awkward', 'eek'] },
      { emoji: '🙄', keywords: ['rolling', 'eyes', 'eyeroll'] },
      { emoji: '🥱', keywords: ['yawn', 'sleepy', 'bored'] },
      { emoji: '😴', keywords: ['sleeping', 'zzz'] },
      { emoji: '🤤', keywords: ['drooling', 'yummy'] },
      { emoji: '😪', keywords: ['sleepy', 'drowsy'] },
      { emoji: '😵', keywords: ['dizzy', 'fainted'] },
      { emoji: '😵‍💫', keywords: ['spiral', 'dazed'] },
      { emoji: '🤐', keywords: ['zipper', 'mouth', 'quiet'] },
      { emoji: '🥴', keywords: ['woozy', 'tipsy', 'drunk'] },
      { emoji: '🤢', keywords: ['nauseated', 'disgusted'] },
      { emoji: '🤮', keywords: ['vomiting', 'puke'] },
      { emoji: '🤧', keywords: ['sneezing', 'sick'] },
      { emoji: '😷', keywords: ['mask', 'covid', 'ill'] },
      { emoji: '🤒', keywords: ['thermometer', 'fever'] },
      { emoji: '🤕', keywords: ['bandage', 'hurt'] },
      { emoji: '🤑', keywords: ['money', 'mouth', 'rich'] },
      { emoji: '🤠', keywords: ['cowboy', 'hat'] },
      { emoji: '🤡', keywords: ['clown', 'fool'] },
      { emoji: '👻', keywords: ['ghost', 'spooky', 'boo'] },
      { emoji: '💀', keywords: ['skull', 'dead', 'dying', 'skeleton'] },
      { emoji: '☠️', keywords: ['crossbones', 'danger'] },
      { emoji: '👽', keywords: ['alien', 'ufo'] },
      { emoji: '🤖', keywords: ['robot', 'bot', 'ai'] },
      { emoji: '💩', keywords: ['poop', 'crap'] },
    ],
  },
  {
    id: 'gestures',
    name: 'Gestures',
    icon: ThumbsUp,
    emojis: [
      { emoji: '👋', keywords: ['wave', 'hello', 'bye'] },
      { emoji: '🤚', keywords: ['raised', 'back', 'hand'] },
      { emoji: '🖐️', keywords: ['fingers', 'splayed'] },
      { emoji: '✋', keywords: ['high', 'five', 'stop'] },
      { emoji: '🖖', keywords: ['vulcan', 'spock'] },
      { emoji: '👌', keywords: ['ok', 'perfect', 'fine'] },
      { emoji: '🤌', keywords: ['pinched', 'italian', 'chef'] },
      { emoji: '🤏', keywords: ['pinching', 'tiny', 'little'] },
      { emoji: '✌️', keywords: ['peace', 'victory'] },
      { emoji: '🤞', keywords: ['crossed', 'luck', 'hope'] },
      { emoji: '🫰', keywords: ['finger', 'heart', 'kpop'] },
      { emoji: '🤟', keywords: ['love', 'you', 'ily'] },
      { emoji: '🤘', keywords: ['rock', 'horns', 'metal'] },
      { emoji: '🤙', keywords: ['call', 'shaka', 'surf'] },
      { emoji: '👈', keywords: ['point', 'left'] },
      { emoji: '👉', keywords: ['point', 'right'] },
      { emoji: '👆', keywords: ['point', 'up'] },
      { emoji: '👇', keywords: ['point', 'down'] },
      { emoji: '☝️', keywords: ['index', 'up', 'one'] },
      { emoji: '🫵', keywords: ['pointing', 'you'] },
      { emoji: '👍', keywords: ['thumbs', 'up', 'yes', 'approve', 'like'] },
      { emoji: '👎', keywords: ['thumbs', 'down', 'no', 'dislike'] },
      { emoji: '✊', keywords: ['fist', 'power'] },
      { emoji: '👊', keywords: ['punch', 'fistbump'] },
      { emoji: '🤛', keywords: ['left', 'fist'] },
      { emoji: '🤜', keywords: ['right', 'fist'] },
      { emoji: '👏', keywords: ['clap', 'applause', 'bravo'] },
      { emoji: '🙌', keywords: ['hands', 'celebrate', 'praise'] },
      { emoji: '🫶', keywords: ['heart', 'hands', 'love'] },
      { emoji: '👐', keywords: ['open', 'hands'] },
      { emoji: '🤲', keywords: ['palms', 'together', 'pray'] },
      { emoji: '🤝', keywords: ['handshake', 'deal', 'agreement'] },
      { emoji: '🙏', keywords: ['pray', 'thank', 'please', 'namaste'] },
      { emoji: '✍️', keywords: ['writing', 'author', 'pen'] },
      { emoji: '💅', keywords: ['nail', 'polish', 'sass', 'slay'] },
      { emoji: '🤳', keywords: ['selfie', 'phone'] },
      { emoji: '💪', keywords: ['flex', 'bicep', 'muscle', 'strong'] },
      { emoji: '👀', keywords: ['eyes', 'look', 'see', 'peek'] },
      { emoji: '👁️', keywords: ['eye', 'vision'] },
      { emoji: '🧠', keywords: ['brain', 'smart', 'mind'] },
      { emoji: '🫀', keywords: ['heart', 'organ'] },
      { emoji: '🫁', keywords: ['lungs', 'breath'] },
    ],
  },
  {
    id: 'hearts',
    name: 'Hearts & Vibes',
    icon: Heart,
    emojis: [
      { emoji: '❤️', keywords: ['red', 'heart', 'love'] },
      { emoji: '🧡', keywords: ['orange', 'heart'] },
      { emoji: '💛', keywords: ['yellow', 'heart'] },
      { emoji: '💚', keywords: ['green', 'heart'] },
      { emoji: '💙', keywords: ['blue', 'heart'] },
      { emoji: '💜', keywords: ['purple', 'heart'] },
      { emoji: '🖤', keywords: ['black', 'heart'] },
      { emoji: '🤍', keywords: ['white', 'heart'] },
      { emoji: '🤎', keywords: ['brown', 'heart'] },
      { emoji: '💔', keywords: ['broken', 'heart', 'heartbreak'] },
      { emoji: '❤️‍🔥', keywords: ['heart', 'fire', 'passion'] },
      { emoji: '❤️‍🩹', keywords: ['mending', 'heart', 'healing'] },
      { emoji: '💕', keywords: ['two', 'hearts', 'pink'] },
      { emoji: '💞', keywords: ['revolving', 'hearts'] },
      { emoji: '💓', keywords: ['beating', 'heart'] },
      { emoji: '💗', keywords: ['growing', 'heart'] },
      { emoji: '💖', keywords: ['sparkling', 'heart', 'love'] },
      { emoji: '💘', keywords: ['cupid', 'arrow'] },
      { emoji: '💝', keywords: ['gift', 'ribbon', 'heart'] },
      { emoji: '✨', keywords: ['sparkles', 'magic', 'shine', 'glow'] },
      { emoji: '⭐', keywords: ['star', 'favorite'] },
      { emoji: '🌟', keywords: ['glowing', 'star'] },
      { emoji: '💫', keywords: ['dizzy', 'star', 'magic'] },
      { emoji: '🔥', keywords: ['fire', 'flame', 'lit', 'hot'] },
      { emoji: '💥', keywords: ['boom', 'collision', 'bang'] },
      { emoji: '💯', keywords: ['100', 'hundred', 'perfect'] },
      { emoji: '💢', keywords: ['anger', 'mad'] },
      { emoji: '💬', keywords: ['speech', 'bubble', 'chat'] },
      { emoji: '💭', keywords: ['thought', 'bubble'] },
      { emoji: '💤', keywords: ['zzz', 'sleep'] },
    ],
  },
  {
    id: 'reactions',
    name: 'Reactions',
    icon: Sparkles,
    emojis: [
      { emoji: '🔥', keywords: ['fire', 'lit', 'popular'] },
      { emoji: '🧢', keywords: ['cap', 'blue', 'capping', 'lie', 'no cap'] },
      { emoji: '💀', keywords: ['skull', 'dead', 'crying'] },
      { emoji: '💖', keywords: ['sparkle', 'heart'] },
      { emoji: '🎉', keywords: ['party', 'popper', 'congrats', 'yay'] },
      { emoji: '🎊', keywords: ['confetti', 'ball'] },
      { emoji: '🎈', keywords: ['balloon'] },
      { emoji: '🎁', keywords: ['gift', 'present'] },
      { emoji: '🏆', keywords: ['trophy', 'winner', 'first'] },
      { emoji: '🥇', keywords: ['first', 'gold', 'medal'] },
      { emoji: '🎯', keywords: ['target', 'bullseye', 'exact'] },
      { emoji: '🎲', keywords: ['dice', 'game', 'luck'] },
      { emoji: '🎮', keywords: ['video', 'game', 'play'] },
      { emoji: '🎨', keywords: ['palette', 'art', 'draw'] },
      { emoji: '🎬', keywords: ['clapper', 'movie', 'film'] },
      { emoji: '🎤', keywords: ['microphone', 'sing', 'voice'] },
      { emoji: '🎧', keywords: ['headphones', 'music'] },
      { emoji: '🎷', keywords: ['saxophone', 'jazz'] },
      { emoji: '🎸', keywords: ['guitar', 'rock'] },
      { emoji: '⚡', keywords: ['lightning', 'zap', 'fast'] },
      { emoji: '🚀', keywords: ['rocket', 'launch', 'moon'] },
      { emoji: '💎', keywords: ['gem', 'diamond', 'rich'] },
      { emoji: '👑', keywords: ['crown', 'king', 'queen'] },
      { emoji: '🪄', keywords: ['wand', 'magic'] },
      { emoji: '🧿', keywords: ['nazar', 'evil', 'eye', 'protect'] },
    ],
  },
  {
    id: 'food',
    name: 'Food & Life',
    icon: Coffee,
    emojis: [
      { emoji: '☕', keywords: ['coffee', 'tea', 'cafe', 'morning'] },
      { emoji: '🍵', keywords: ['matcha', 'green', 'tea'] },
      { emoji: '🧋', keywords: ['boba', 'bubble', 'tea'] },
      { emoji: '🥤', keywords: ['soda', 'cup', 'drink'] },
      { emoji: '🍺', keywords: ['beer', 'cheers'] },
      { emoji: '🍻', keywords: ['beers', 'clinking'] },
      { emoji: '🥂', keywords: ['champagne', 'toast'] },
      { emoji: '🍷', keywords: ['wine', 'glass'] },
      { emoji: '🍸', keywords: ['cocktail', 'martini'] },
      { emoji: '🍕', keywords: ['pizza', 'slice', 'food'] },
      { emoji: '🍔', keywords: ['burger', 'hamburger', 'fastfood'] },
      { emoji: '🍟', keywords: ['fries', 'french'] },
      { emoji: '🌭', keywords: ['hotdog'] },
      { emoji: '🍿', keywords: ['popcorn', 'movie'] },
      { emoji: '🍩', keywords: ['donut', 'sweet'] },
      { emoji: '🍪', keywords: ['cookie', 'chocolate'] },
      { emoji: '🎂', keywords: ['cake', 'birthday'] },
      { emoji: '🍰', keywords: ['shortcake', 'pastry'] },
      { emoji: '🧁', keywords: ['cupcake', 'sweet'] },
      { emoji: '🍣', keywords: ['sushi', 'japanese'] },
      { emoji: '🍜', keywords: ['ramen', 'noodles', 'soup'] },
      { emoji: '🌮', keywords: ['taco', 'mexican'] },
    ],
  },
];

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  anchorPosition?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onSelectEmoji,
  onClose,
  anchorPosition = 'top-right',
}) => {
  const [activeCategory, setActiveCategory] = useState('smileys');
  const [searchTerm, setSearchTerm] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Filter emojis based on search term
  const filteredEmojis = searchTerm.trim()
    ? EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter((item) =>
        item.keywords.some((kw) => kw.includes(searchTerm.toLowerCase().trim())) ||
        item.emoji.includes(searchTerm.trim())
      )
    : null;

  const currentCategoryObj = EMOJI_CATEGORIES.find((c) => c.id === activeCategory);

  // Positioning classes
  const positionClasses = {
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
  }[anchorPosition];

  return (
    <div
      ref={pickerRef}
      className={`absolute ${positionClasses} z-50 w-72 sm:w-80 rounded-2xl bg-[#0f0f18] border border-[#232338] shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden text-slate-200 select-none animate-in fade-in zoom-in-95 duration-150`}
      style={{ maxHeight: '380px' }}
    >
      {/* Search Header */}
      <div className="p-2.5 border-b border-[#1c1c2e] flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search emoji..."
            autoFocus
            className="w-full bg-[#161624] border border-[#232338] rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1a1a2c] rounded-lg transition-colors cursor-pointer"
          title="Close emoji picker"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category Tabs (shown only when not searching) */}
      {!searchTerm && (
        <div className="flex items-center px-2 py-1.5 gap-1 border-b border-[#171724] bg-[#0c0c14] overflow-x-auto scrollbar-none">
          {EMOJI_CATEGORIES.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              title={name}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
                activeCategory === id
                  ? 'bg-blue-600/20 text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#181827]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="flex-1 overflow-y-auto p-2.5 max-h-56 scrollbar-thin scrollbar-thumb-slate-700">
        {filteredEmojis ? (
          <div>
            <div className="text-[10px] font-semibold text-slate-400 px-1 mb-1.5 uppercase tracking-wider">
              Search Results ({filteredEmojis.length})
            </div>
            {filteredEmojis.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No emojis found for "{searchTerm}"
              </div>
            ) : (
              <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                {filteredEmojis.map(({ emoji, keywords }, idx) => (
                  <button
                    key={`${emoji}-${idx}`}
                    type="button"
                    onClick={() => {
                      onSelectEmoji(emoji);
                      onClose();
                    }}
                    title={keywords[0]}
                    className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-[#1f1f33] active:scale-90 transition-all cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="text-[10px] font-semibold text-slate-400 px-1 mb-1.5 uppercase tracking-wider">
              {currentCategoryObj?.name}
            </div>
            <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
              {currentCategoryObj?.emojis.map(({ emoji, keywords }, idx) => (
                <button
                  key={`${emoji}-${idx}`}
                  type="button"
                  onClick={() => {
                    onSelectEmoji(emoji);
                    onClose();
                  }}
                  title={keywords[0]}
                  className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-[#1f1f33] active:scale-90 transition-all cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Reaction Bar at bottom */}
      <div className="px-2.5 py-1.5 border-t border-[#171724] bg-[#0c0c14] flex items-center justify-between text-xs text-slate-400">
        <span className="text-[10px] text-slate-500 font-medium">Frequently used</span>
        <div className="flex items-center gap-1">
          {['❤️', '🔥', '😂', '👍', '💀', '✨'].map((quickEmoji) => (
            <button
              key={quickEmoji}
              type="button"
              onClick={() => {
                onSelectEmoji(quickEmoji);
                onClose();
              }}
              className="w-6 h-6 flex items-center justify-center text-sm rounded hover:bg-[#1a1a2b] transition-all cursor-pointer active:scale-90"
            >
              {quickEmoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
