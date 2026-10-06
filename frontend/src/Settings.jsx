import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function SettingsPage({ onClose, onDeactivated } = {}) {
  const token = localStorage.getItem('access'); const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const [section, setSection] = useState('profile');
  const [bio, setBio] = useState(''); const [avatar, setAvatar] = useState(null); const [isPublic, setIsPublic] = useState(false); const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState(''); const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  // Sound preference: stored locally, default ON (absence of 'off' means on)
  const [soundsOn, setSoundsOn] = useState(() => localStorage.getItem('cchat_sounds') !== 'off');

  useEffect(() => { axios.get('/api/profile/', { headers }).then(({ data }) => { setBio(data.bio || ''); setIsPublic(Boolean(data.default_conversations_public)); setUsername(data.username || ''); }).catch(() => setMessage('Could not load your settings.')); }, []);

  const saveProfile = async (event) => { event.preventDefault(); const body = new FormData(); body.append('bio', bio); body.append('default_conversations_public', String(isPublic)); if (avatar) body.append('avatar', avatar); await axios.patch('/api/profile/update/', body, { headers }); setMessage('Profile settings saved.'); };
  const changePassword = async (event) => { event.preventDefault(); await axios.post('/api/auth/change-password/', { old_password: oldPassword, new_password: newPassword }, { headers }); setOldPassword(''); setNewPassword(''); setMessage('Password changed.'); };
  const deactivate = async () => { await axios.post('/api/account/deactivate/', {}, { headers }); localStorage.removeItem('access'); localStorage.removeItem('refresh'); if (onDeactivated) { onDeactivated(); return; } window.location.href = '/login'; };

  const toggleSounds = (enabled) => {
    setSoundsOn(enabled);
    if (enabled) { localStorage.removeItem('cchat_sounds'); } else { localStorage.setItem('cchat_sounds', 'off'); }
    setMessage(enabled ? 'Sound effects enabled.' : 'Sound effects disabled.');
  };

  const NAV_SECTIONS = ['profile', 'security', 'privacy', 'sound', 'danger'];

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
              <label>Bio<textarea value={bio} maxLength={500} onChange={(e) => setBio(e.target.value)} /></label>
              <label>Avatar<input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] || null)} /></label>
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
