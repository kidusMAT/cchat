import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AVATAR_SECTIONS = [
  { title: 'Pop culture energy', items: ['arcade-hero', 'indie-director', 'synthwave-star', 'comic-relief', 'noir-detective', 'festival-headliner', 'space-opera', 'pixel-rogue'] },
  { title: 'Civic & politics', items: ['ballot-box', 'town-hall', 'diplomat', 'free-press', 'civic-organizer', 'debate-night', 'public-square', 'new-deal'] },
  { title: 'Chess & strategy', items: ['chess-king', 'chess-queen', 'chess-rook', 'chess-bishop', 'chess-knight', 'chess-pawn', 'endgame', 'grandmaster'] },
  { title: 'Science & space', items: ['lab-notes', 'telescope', 'rocket-science', 'deep-space', 'quantum', 'field-research', 'robotics', 'moon-shot'] },
  { title: 'Nature & retro', items: ['sunrise', 'forest-walker', 'ocean-current', 'desert-radio', 'mountain-air', 'garden-club', 'cassette-day', 'neon-night'] },
];
const AVATAR_STORIES = {
  'arcade-hero': 'They grew up learning that every impossible level has a pattern. Now they bring that same patience to real life.',
  'indie-director': 'They collect unfinished scenes, overheard dialogue, and small human details that most people miss.',
  'synthwave-star': 'They live between midnight ideas and neon possibilities, always chasing the next strange sound.',
  'comic-relief': 'They know a good laugh can open a locked room—and they never waste an opportunity to make one.',
  'noir-detective': 'They notice the clue in the corner of the frame and ask the question everyone else avoided.',
  'ballot-box': 'They believe showing up is its own kind of power, especially when the room expects silence.',
  'town-hall': 'They listen to every side, take careful notes, and still know when it is time to speak clearly.',
  'diplomat': 'They can find the bridge between two stubborn ideas without losing their own point of view.',
  'free-press': 'They follow the paper trail, protect the source, and keep asking who benefits from the story.',
  'civic-organizer': 'They turn scattered voices into a room full of people moving in the same direction.',
  'chess-king': 'They move carefully because every decision changes the whole board. Quiet does not mean passive.',
  'chess-queen': 'They see the open lane before anyone else and use range, timing, and nerve to take it.',
  'chess-rook': 'They trust strong foundations, direct lines, and the power of being exactly where they are needed.',
  'chess-bishop': 'They think diagonally, finding connections across distances other people treat as separate.',
  'chess-knight': 'They take the route nobody expects. The strange move is often the move that changes everything.',
  'chess-pawn': 'They start small, keep moving, and remember that the edge of the board can change who they become.',
  'endgame': 'They do their clearest thinking when the noise is gone and only the meaningful choices remain.',
  'grandmaster': 'They have studied the classics, but their best move is still the one they invent under pressure.',
};
function avatarStory(seed, sectionTitle) {
  return AVATAR_STORIES[seed] || `A ${sectionTitle.toLowerCase()} character with a curious mind, a distinct point of view, and a story still being written.`;
}

export default function SettingsPage({ onClose, onDeactivated } = {}) {
  const token = localStorage.getItem('access'); const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const [section, setSection] = useState('profile');
  const [bio, setBio] = useState(''); const [avatarSeed, setAvatarSeed] = useState(''); const [avatarUrl, setAvatarUrl] = useState(''); const [isPublic, setIsPublic] = useState(false); const [username, setUsername] = useState(''); const [verificationStatus, setVerificationStatus] = useState('UNVERIFIED'); const [verificationText, setVerificationText] = useState(''); const [verificationUrl, setVerificationUrl] = useState('');
  const [selectedAvatarStory, setSelectedAvatarStory] = useState(null);
  const [oldPassword, setOldPassword] = useState(''); const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  // Sound preference: stored locally, default ON (absence of 'off' means on)
  const [soundsOn, setSoundsOn] = useState(() => localStorage.getItem('cchat_sounds') !== 'off');

  useEffect(() => { axios.get('/api/profile/', { headers }).then(({ data }) => { setBio(data.bio || ''); setAvatarSeed(data.avatar_seed || ''); setAvatarUrl(data.avatar_url || ''); setIsPublic(Boolean(data.default_conversations_public)); setUsername(data.username || ''); setVerificationStatus(data.verification_status || 'UNVERIFIED'); setVerificationText(data.verification_text || ''); setVerificationUrl(data.verification_url || ''); }).catch(() => setMessage('Could not load your settings.')); }, []);

  const saveProfile = async (event) => { event.preventDefault(); const body = new FormData(); body.append('bio', bio); body.append('default_conversations_public', String(isPublic)); const { data } = await axios.patch('/api/profile/update/', body, { headers }); setAvatarUrl(data.avatar_url || avatarUrl); setMessage('Profile settings saved.'); };
  const chooseAvatar = async (seed, sectionTitle) => { setSelectedAvatarStory({ seed, sectionTitle }); try { const { data } = await axios.patch('/api/profile/update/', { avatar_seed: seed, avatar: null }, { headers }); setAvatarSeed(seed); setAvatarUrl(data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`); setMessage('Avatar updated.'); } catch { setMessage('Could not update your avatar.'); } };
  const applyForVerification = async (event) => { event.preventDefault(); try { const { data } = await axios.post('/api/verification/apply/', { verification_text: verificationText, verification_url: verificationUrl }, { headers }); setVerificationStatus(data.status || 'PENDING'); setMessage('Verification request submitted.'); } catch (error) { setMessage(error.response?.data?.error || 'Could not submit verification request.'); } };
  const changePassword = async (event) => { event.preventDefault(); await axios.post('/api/auth/change-password/', { old_password: oldPassword, new_password: newPassword }, { headers }); setOldPassword(''); setNewPassword(''); setMessage('Password changed.'); };
  const deactivate = async () => { await axios.post('/api/account/deactivate/', {}, { headers }); localStorage.removeItem('access'); localStorage.removeItem('refresh'); if (onDeactivated) { onDeactivated(); return; } window.location.href = '/login'; };

  const toggleSounds = (enabled) => {
    setSoundsOn(enabled);
    if (enabled) { localStorage.removeItem('cchat_sounds'); } else { localStorage.setItem('cchat_sounds', 'off'); }
    setMessage(enabled ? 'Sound effects enabled.' : 'Sound effects disabled.');
  };

  const NAV_SECTIONS = ['profile', 'security', 'privacy', 'verification', 'sound', 'danger'];

  return (
    <div className="app-shell settings-page">
      <main className="settings-layout container">
        <aside className="settings-nav">
          <span className="eyebrow">CCHAT / ACCOUNT</span>
          <h1>Settings.</h1>
          {NAV_SECTIONS.map((item) => (
            <button
              className={section === item ? 'settings-nav-item is-active' : 'settings-nav-item'}
              onClick={() => { setSection(item); setMessage(''); }}
              key={item}
            >
              {item === 'danger' ? 'Danger zone' : item === 'sound' ? 'Sound' : item}
            </button>
          ))}
          {onClose
            ? <button className="settings-back" onClick={onClose}>Close</button>
            : <Link className="settings-back" to={username ? `/profile/${username}` : '/'}>Back to chat</Link>}
        </aside>

        <section className="settings-panel">
          <div className="settings-panel-head">
            <span className="thread-id">ACCOUNT SETTINGS</span>
            {message && <p className="settings-status" role="status">{message}</p>}
          </div>

          {section === 'profile' && (
            <form onSubmit={saveProfile} className="settings-form">
              <h2>Profile</h2>
              <div className="settings-avatar-picker">
                <div className="settings-avatar-current">
                  {avatarUrl && <img className="settings-avatar-preview" src={/^https?:\/\//i.test(avatarUrl) ? avatarUrl : `${axios.defaults.baseURL}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`} alt="Current profile avatar" />}
                  <span>Choose an avatar</span>
                </div>
                <div className="settings-avatar-sections">
                  {AVATAR_SECTIONS.map((section) => (
                    <section className="settings-avatar-section" key={section.title}>
                      <h3>{section.title}</h3>
                      <div className="settings-avatar-options">
                        {section.items.map((seed) => (
                          <button type="button" key={seed} className={`settings-avatar-option ${avatarSeed === seed ? 'is-selected' : ''}`} onClick={() => chooseAvatar(seed, section.title)} aria-label={`Choose ${section.title} avatar ${seed}`} aria-pressed={avatarSeed === seed}>
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`} alt="" />
                            <span>{seed.replaceAll('-', ' ')}</span>
                          </button>
                        ))}
                      </div>
                      {selectedAvatarStory?.sectionTitle === section.title && <aside className="avatar-story-card" aria-live="polite">
                        <span className="section-kicker">Character story</span>
                        <h3>{selectedAvatarStory.seed.replaceAll('-', ' ')}</h3>
                        <p>{avatarStory(selectedAvatarStory.seed, selectedAvatarStory.sectionTitle)}</p>
                      </aside>}
                    </section>
                  ))}
                </div>
              </div>
              <label>Bio<textarea value={bio} maxLength={500} onChange={(e) => setBio(e.target.value)} /></label>
              <button className="button button-primary" type="submit">Save profile settings</button>
            </form>
          )}

          {section === 'security' && (
            <form onSubmit={changePassword} className="settings-form">
              <h2>Security</h2>
              <label>Current password<input required type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} /></label>
              <label>New password<input required minLength={8} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label>
              <button className="button button-primary" type="submit">Change password</button>
            </form>
          )}

          {section === 'privacy' && (
            <form onSubmit={saveProfile} className="settings-form">
              <h2>Privacy</h2>
              <label className="settings-check">
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                Make my side of new conversations public by default
              </label>
              <button className="button button-primary" type="submit">Save privacy settings</button>
            </form>
          )}

          {section === 'sound' && (
            <div className="settings-form">
              <h2>Sound</h2>
              <p style={{ marginBottom: '1.25rem', opacity: 0.7, fontSize: '0.9rem' }}>
                Controls all in-app sound effects — message send/receive tones, reaction pops, and ambient notifications.
              </p>
              <label className="settings-check">
                <input
                  type="checkbox"
                  checked={soundsOn}
                  onChange={(e) => toggleSounds(e.target.checked)}
                />
                Enable sound effects
              </label>
            </div>
          )}

          {section === 'verification' && (
            <form onSubmit={applyForVerification} className="settings-form">
              <h2>Verification</h2>
              <p className="settings-help">Request a verified badge for your public identity. A moderator will review the information you provide.</p>
              <div className={`verification-status is-${verificationStatus.toLowerCase()}`}>Status: {verificationStatus}</div>
              <label>Why should this account be verified?<textarea value={verificationText} maxLength={2000} onChange={(e) => setVerificationText(e.target.value)} disabled={verificationStatus === 'PENDING' || verificationStatus === 'VERIFIED'} required /></label>
              <label>Proof or public link<input type="url" value={verificationUrl} onChange={(e) => setVerificationUrl(e.target.value)} disabled={verificationStatus === 'PENDING' || verificationStatus === 'VERIFIED'} placeholder="https://example.com" required /></label>
              {verificationStatus !== 'PENDING' && verificationStatus !== 'VERIFIED' && <button className="button button-primary" type="submit">Submit verification request <ArrowUpRight size={16} /></button>}
            </form>
          )}

          {section === 'danger' && (
            <div className="settings-form settings-danger">
              <h2>Danger zone</h2>
              <p>Deactivation immediately hides your public conversation sides. Your account data will be retained until you choose a deletion policy.</p>
              <label>Type DEACTIVATE to confirm<input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></label>
              <button disabled={confirmation !== 'DEACTIVATE'} onClick={deactivate}>Deactivate account</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
