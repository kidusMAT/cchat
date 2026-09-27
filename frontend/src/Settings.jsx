import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function SettingsPage({ onClose, onDeactivated } = {}) {
  const token = localStorage.getItem('access');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/api/profile/', { headers }).then(({ data }) => {
      setBio(data.bio || '');
      setIsPublic(Boolean(data.default_conversations_public));
    }).catch(() => setMessage('Could not load your settings.'));
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    const body = new FormData();
    body.append('bio', bio);
    body.append('default_conversations_public', String(isPublic));
    if (avatar) body.append('avatar', avatar);
    await axios.patch('/api/profile/update/', body, { headers });
    setMessage('Profile settings saved.');
  };

  const changePassword = async (event) => {
    event.preventDefault();
    await axios.post('/api/auth/change-password/', { old_password: oldPassword, new_password: newPassword }, { headers });
    setOldPassword(''); setNewPassword(''); setMessage('Password changed.');
  };

  const deactivate = async () => {
    await axios.post('/api/account/deactivate/', {}, { headers });
    localStorage.removeItem('access'); localStorage.removeItem('refresh');
    if (onDeactivated) {
      onDeactivated();
      return;
    }
    window.location.href = '/login';
  };

  const field = { display: 'grid', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12, marginBottom: 14 };
  const input = { padding: 10, border: '2px solid #111', font: 'inherit' };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f0', padding: '32px 16px' }}>
      <section style={{ maxWidth: 720, margin: '0 auto', background: '#fff', border: '3px solid #000', boxShadow: '8px 8px 0 #000', padding: 24, color: '#111' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12 }}>
          <h2 id="settings-title" style={{ fontFamily: 'var(--font-mono)', margin: 0 }}>SETTINGS</h2>
          {onClose ? (
            <button onClick={onClose} aria-label="Close settings" style={{ fontSize: 20, background: 'none', border: 0, cursor: 'pointer' }}>×</button>
          ) : (
            <Link to="/messages" style={{ textDecoration: 'none', color: '#111', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>BACK TO CHAT</Link>
          )}
        </header>

        {message && <p role="status" style={{ marginBottom: 16 }}>{message}</p>}

        <form onSubmit={saveProfile}>
          <label style={field}>BIO<textarea value={bio} maxLength={500} onChange={e => setBio(e.target.value)} style={input} /></label>
          <label style={field}>AVATAR<input type="file" accept="image/*" onChange={e => setAvatar(e.target.files?.[0] || null)} /></label>
          <label style={{ ...field, display: 'flex', alignItems: 'center' }}><input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} /> Make my side of new conversations public by default</label>
          <button type="submit" style={{ ...input, cursor: 'pointer', fontWeight: 800 }}>SAVE PROFILE SETTINGS</button>
        </form>

        <hr style={{ margin: '22px 0' }} />

        <form onSubmit={changePassword}>
          <h3>Change password</h3>
          <label style={field}>CURRENT PASSWORD<input required type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={input} /></label>
          <label style={field}>NEW PASSWORD<input required minLength={8} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={input} /></label>
          <button type="submit" style={{ ...input, cursor: 'pointer', fontWeight: 800 }}>CHANGE PASSWORD</button>
        </form>

        <hr style={{ margin: '22px 0' }} />

        <h3 style={{ color: '#a40016' }}>Deactivate account</h3>
        <p>Deactivation immediately hides your public conversation sides. Your account data will be retained until you choose a deletion policy.</p>
        <label style={field}>Type DEACTIVATE to confirm<input value={confirmation} onChange={e => setConfirmation(e.target.value)} style={input} /></label>
        <button disabled={confirmation !== 'DEACTIVATE'} onClick={deactivate} style={{ ...input, cursor: confirmation === 'DEACTIVATE' ? 'pointer' : 'not-allowed', color: '#a40016', fontWeight: 800 }}>DEACTIVATE ACCOUNT</button>
      </section>
    </div>
  );
}
