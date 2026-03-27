import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  ArrowLeft,
  ThumbsUp,
  Skull,
  Heart,
  Smile,
  Eye,
  Users,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  Radio,
  Flame
} from 'lucide-react';
import axios from 'axios';

// Configure axios
axios.defaults.baseURL = 'http://localhost:8000';

const Header = () => (
  <header className="header">
    <div className="container header-content">
      <Link to="/" className="logo">
        CCHAT<span>.</span>
      </Link>
      <div className="live-status">
        <Radio size={16} color="#FF4B5C" /> 6 LIVE
      </div>
    </div>
  </header>
);

const getInitials = (name) => {
  if (!name || name === 'ShadowWave') return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getAvatarStyle = (username, index) => {
  if (username === 'ShadowWave' || index > 1) {
    return {
      background: '#F3F4F6',
      color: '#9CA3AF',
      border: '2px dashed #D1D5DB',
    };
  }
  return {
    background: index === 0 ? 'var(--accent-color)' : '#000000',
    color: '#ffffff',
    border: 'none',
  };
};

const ThreadCard = ({ thread }) => {
  const participants = thread.chatters || [];
  const latestMessages = thread.messages ? thread.messages.slice(-6) : [];

  return (
    <Link to={`/chat/${thread.conversation_id}`} className="thread-card">
      <div className="thread-header">
        <span>THREAD #{String(thread.conversation_id).padStart(3, '0')}</span>
        <span style={{ opacity: 0.6 }}>{thread.created_at || 'active'}</span>
      </div>
      <div className="thread-participants">
        {participants.map((p, i) => (
          <React.Fragment key={i}>
            <div className="participant" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                className="avatar"
                style={{
                  ...getAvatarStyle(p.username, i),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem'
                }}
              >
                {getInitials(p.username)}
              </div>
              <span className="participant-name">{p.username}</span>
            </div>
            {i < participants.length - 1 && <span style={{ opacity: 0.3, fontWeight: 900, margin: '0 0.5rem' }}>×</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="thread-preview">
        {latestMessages.map((msg, i) => (
          <div key={i} className="preview-line">
            <span style={{ color: 'var(--accent-color)' }}>
              {msg.sender_username?.toUpperCase() || msg.sender?.toUpperCase() || 'ANON'}:
            </span> {msg.text}
          </div>
        ))}
      </div>
      <div className="thread-footer">
        <div className="reactions">
          <div className="reaction-pill"><Flame size={14} fill="#F97316" color="#F97316" /> {thread.likes || 26}</div>
          <div className="reaction-pill"><Skull size={14} /> {thread.dislikes || 16}</div>
          <div className="reaction-pill"><Heart size={14} fill="#FF4B5C" color="#FF4B5C" /> {thread.caps || 36}</div>
        </div>
        <div className="thread-meta">
          <Eye size={14} /> {thread.views || '3,872'}
        </div>
      </div>
    </Link>
  );
};

const mockThreads = [
  {
    conversation_id: 1,
    chatters: [{ username: 'Alex Chen' }, { username: 'NeonWraith' }],
    messages: [
      { sender_username: 'ALEX', text: 'should we switch to rust for the backend?' },
      { sender_username: 'ANON', text: 'the memory safety alone makes it worth considering' },
      { sender_username: 'ALEX', text: 'but the learning curve for the team...' },
      { sender_username: 'ANON', text: 'we could start with one microservice' },
      { sender_username: 'ALEX', text: 'good call. let\'s prototype the auth service' },
      { sender_username: 'ANON', text: 'I\'ll set up the repo tonight' }
    ],
    created_at: '6 days ago',
    likes: 12, dislikes: 5, caps: 31, views: 560
  },
  {
    conversation_id: 4,
    chatters: [{ username: 'StealthCipher' }, { username: 'PixelLynx' }],
    messages: [
      { sender_username: 'ANON', text: 'did you see the new quantum processor specs?' },
      { sender_username: 'ANON', text: 'yeah 2048 qubits is insane' },
      { sender_username: 'ANON', text: 'imagine running ML models on that' },
      { sender_username: 'ANON', text: 'we\'d need to rethink our entire architecture' }
    ],
    created_at: '5 days ago',
    likes: 20, dislikes: 25, caps: 69, views: '4,554'
  },
  {
    conversation_id: 7,
    chatters: [{ username: 'SarahV' }, { username: 'CodeNinja' }],
    messages: [
      { sender_username: 'SARAH', text: 'CSS grid or flexbox for the new dashboard?' },
      { sender_username: 'NINJA', text: 'grid for the overall layout, flexbox for components inside' },
      { sender_username: 'SARAH', text: 'makes sense. getting tired of nested divs' },
      { sender_username: 'NINJA', text: 'CSS subgrid is shipping in all browsers now though' },
      { sender_username: 'SARAH', text: 'Wait really? Finally!' }
    ],
    created_at: '2 hrs ago',
    likes: 45, dislikes: 2, caps: 88, views: '1,200'
  },
  {
    conversation_id: 12,
    chatters: [{ username: 'UX_Master' }, { username: 'DevOpsDan' }],
    messages: [
      { sender_username: 'UX', text: 'the deployment pipeline is taking 45 minutes now...' },
      { sender_username: 'DAN', text: 'I know, the test suite bloated up' },
      { sender_username: 'DAN', text: 'I am splitting it into parallel jobs today' },
      { sender_username: 'UX', text: 'thank god, I can\'t iterate fast enough' }
    ],
    created_at: '12 mins ago',
    likes: 104, dislikes: 12, caps: 201, views: '8,900'
  },
  {
    conversation_id: 15,
    chatters: [{ username: 'RogueOne' }, { username: 'Echo' }],
    messages: [
      { sender_username: 'ROGUE', text: 'is the staging server down?' },
      { sender_username: 'ECHO', text: 'restarting the database, give it 2 mins' }
    ],
    created_at: '1 min ago',
    likes: 3, dislikes: 0, caps: 5, views: '32'
  },
  {
    conversation_id: 19,
    chatters: [{ username: 'VibeCheck' }, { username: 'NullPointer' }],
    messages: [
      { sender_username: 'VIBE', text: 'anyone else feel like AI is moving too fast?' },
      { sender_username: 'NULL', text: 'we literally can\'t keep up with the papers anymore' },
      { sender_username: 'VIBE', text: 'I gave up reading arxiv daily, it\'s overwhelming' },
      { sender_username: 'NULL', text: 'just follow the summaries on twitter honestly' },
      { sender_username: 'VIBE', text: 'fair. but then you miss the details that matter' },
      { sender_username: 'NULL', text: 'true... pick your battles I guess' },
      { sender_username: 'VIBE', text: 'the next 6 months are going to be wild though' }
    ],
    created_at: 'just now',
    likes: 87, dislikes: 4, caps: 120, views: '6,210'
  }
];

const LandingPage = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await axios.get('/api/chats/recommended/');
        if (response.data && response.data.length > 0) {
          setThreads(response.data);
        } else {
          setThreads(mockThreads);
        }
      } catch (error) {
        console.error("Error fetching threads:", error);
        setThreads(mockThreads);
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, []);

  return (
    <div style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
      <Header />
      <div className="container">
        <section className="hero">
          <div>
            <span className="hero-tag">Public Conversations</span>
            <h1 className="hero-title">
              READ<br />
              WHAT PEOPLE<br />
              <span style={{ color: 'var(--accent-color)' }}>ACTUALLY</span><br />
              SAY.
            </h1>
          </div>
          <div className="hero-card">
            <p className="hero-description">
              Browse real conversations between real people. Some choose to go public, others stay anonymous. React, scroll, discover.
            </p>
            <div className="hero-badges">
              <div className="badge" style={{ transform: 'rotate(-2deg)' }}>UNFILTERED</div>
              <div className="badge" style={{ transform: 'rotate(-2deg)' }}>REAL-TIME</div>
              <div className="badge" style={{ transform: 'rotate(-2deg)' }}>ANONYMOUS</div>
            </div>
          </div>
        </section>

        <div className="thread-grid">
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', fontWeight: 900 }}>LOADING PULSES...</div>
          ) : (
            threads.map(thread => (
              <ThreadCard key={thread.conversation_id} thread={thread} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const mockChatData = {
  1: {
    participants: [
      { username: 'Alex Chen', handle: '@alexchen', avatar: 'AC', color: 'var(--accent-color)' },
      { username: 'NeonWraith', handle: '@neonwraith', avatar: 'NE', color: '#000' }
    ],
    messages: [
      { sender: 'ALEX', text: 'should we switch to rust for the backend?' },
      { sender: 'ANON', text: 'the memory safety alone makes it worth considering' },
      { sender: 'ALEX', text: 'but the learning curve for the team...' },
      { sender: 'ANON', text: 'we could start with one microservice' },
      { sender: 'ALEX', text: 'good call. let\'s prototype the auth service' },
      { sender: 'ANON', text: 'I\'ll set up the repo tonight' }
    ],
    status: 'HEATING UP',
    created_at: '6 days ago',
    visibility: 'PUBLIC',
    likes: 5, dislikes: 9, caps: 69, smiles: 34, views: '1,176', watching: 139,
    otherChats: {
      left: [{ id: 7, username: 'Taylor Kim', handle: '@taylorkim', avatar: 'TK', color: '#000' }, { id: 12, username: 'Sam Rivera', handle: '@samrivera', avatar: 'SR', color: '#6B7280' }],
      right: [{ id: 4, username: 'Casey Nguyen', handle: '@caseynguyen', avatar: 'CN', color: '#8B5CF6' }, { id: 19, username: 'Jordan Blake', handle: '@jordanblake', avatar: 'JB', color: 'var(--accent-color)' }]
    }
  },
  4: {
    participants: [
      { username: 'NeonWraith', handle: '@neonwraith', avatar: 'NE', color: '#000' },
      { username: 'Casey Nguyen', handle: '@caseynguyen', avatar: 'CN', color: '#8B5CF6' }
    ],
    messages: [
      { sender: 'NEON', text: 'Casey, have you seen the new quantum encryption protocol?' },
      { sender: 'CN', text: 'yeah, it is pretty impressive. 0.01ms latency.' },
      { sender: 'NEON', text: 'insane. we should integrate it into the core engine.' }
    ],
    status: 'ACTIVE',
    created_at: '5 days ago',
    visibility: 'PUBLIC',
    likes: 8, dislikes: 3, caps: 22, smiles: 15, views: '4,554', watching: 87,
    otherChats: {
      left: [{ id: 1, username: 'Alex Chen', handle: '@alexchen', avatar: 'AC', color: 'var(--accent-color)' }, { id: 19, username: 'Jordan Blake', handle: '@jordanblake', avatar: 'JB', color: 'var(--accent-color)' }],
      right: [{ id: 15, username: 'RogueOne', handle: '@rogueone', avatar: 'RO', color: 'var(--accent-color)' }]
    }
  },
  7: {
    participants: [
      { username: 'Alex Chen', handle: '@alexchen', avatar: 'AC', color: 'var(--accent-color)' },
      { username: 'Taylor Kim', handle: '@taylorkim', avatar: 'TK', color: '#000' }
    ],
    messages: [
      { sender: 'ALEX', text: 'Taylor, are we still on for the code review at 3?' },
      { sender: 'TK', text: 'yep, almost done with the auth module.' },
      { sender: 'ALEX', text: 'great, I found some interesting patterns in the middleware.' },
      { sender: 'TK', text: 'sweet, show me then.' }
    ],
    status: 'FRESH',
    created_at: '2 hrs ago',
    visibility: 'PUBLIC',
    likes: 12, dislikes: 1, caps: 45, smiles: 20, views: '1,200', watching: 56,
    otherChats: {
      left: [{ id: 1, username: 'NeonWraith', handle: '@neonwraith', avatar: 'NE', color: '#000' }, { id: 12, username: 'Sam Rivera', handle: '@samrivera', avatar: 'SR', color: '#6B7280' }],
      right: [{ id: 19, username: 'Jordan Blake', handle: '@jordanblake', avatar: 'JB', color: 'var(--accent-color)' }]
    }
  },
  12: {
    participants: [
      { username: 'Alex Chen', handle: '@alexchen', avatar: 'AC', color: 'var(--accent-color)' },
      { username: 'Sam Rivera', handle: '@samrivera', avatar: 'SR', color: '#6B7280' }
    ],
    messages: [
      { sender: 'ALEX', text: 'hey Sam, did you check the new design for the delivery map?' },
      { sender: 'SR', text: 'just looking at it now. the orange route looks much cleaner.' },
      { sender: 'ALEX', text: 'yeah, I think it helps with readability in the sun.' },
      { sender: 'SR', text: 'definitely. we should apply this aesthetic to the rest of the app.' }
    ],
    status: 'ACTIVE',
    created_at: '12 mins ago',
    visibility: 'PUBLIC',
    likes: 20, dislikes: 5, caps: 104, smiles: 12, views: '8,900', watching: 310,
    otherChats: {
      left: [{ id: 1, username: 'NeonWraith', handle: '@neonwraith', avatar: 'NE', color: '#000' }, { id: 7, username: 'Taylor Kim', handle: '@taylorkim', avatar: 'TK', color: '#000' }],
      right: [{ id: 4, username: 'Casey Nguyen', handle: '@caseynguyen', avatar: 'CN', color: '#8B5CF6' }]
    }
  },
  15: {
    participants: [
      { username: 'Casey Nguyen', handle: '@caseynguyen', avatar: 'CN', color: '#8B5CF6' },
      { username: 'RogueOne', handle: '@rogueone', avatar: 'RO', color: 'var(--accent-color)' }
    ],
    messages: [
      { sender: 'ROGUE', text: 'is the staging server down?' },
      { sender: 'ECHO', text: 'restarting the database, give it 2 mins' }
    ],
    status: 'ACTIVE',
    created_at: '1 min ago',
    visibility: 'PUBLIC',
    likes: 1, dislikes: 0, caps: 3, smiles: 2, views: '32', watching: 8,
    otherChats: {
      left: [{ id: 4, username: 'NeonWraith', handle: '@neonwraith', avatar: 'NE', color: '#000' }],
      right: [{ id: 1, username: 'Alex Chen', handle: '@alexchen', avatar: 'AC', color: 'var(--accent-color)' }]
    }
  },
  19: {
    participants: [
      { username: 'NeonWraith', handle: '@neonwraith', avatar: 'NE', color: '#000' },
      { username: 'Jordan Blake', handle: '@jordanblake', avatar: 'JB', color: 'var(--accent-color)' }
    ],
    messages: [
      { sender: 'NEON', text: 'Jordan, the AI models are evolving way too fast.' },
      { sender: 'JB', text: 'tell me about it. the new papers are coming out every hour.' },
      { sender: 'NEON', text: 'I am taking a break from Arxiv, just following the summaries now.' },
      { sender: 'JB', text: 'wise choice. let the dust settle first.' }
    ],
    status: 'HEATING UP',
    created_at: 'just now',
    visibility: 'PUBLIC',
    likes: 22, dislikes: 3, caps: 87, smiles: 14, views: '6,210', watching: 201,
    otherChats: {
      left: [{ id: 1, username: 'Alex Chen', handle: '@alexchen', avatar: 'AC', color: 'var(--accent-color)' }, { id: 4, username: 'Casey Nguyen', handle: '@caseynguyen', avatar: 'CN', color: '#8B5CF6' }],
      right: [{ id: 7, username: 'Taylor Kim', handle: '@taylorkim', avatar: 'TK', color: '#000' }]
    }
  }
};

const availableIds = [1, 7, 12, 15, 19];

const NavigationArrows = ({ onNext, onPrev }) => (
  <div className="nav-arrows-container">
    <button className="nav-arrow" onClick={onPrev} aria-label="Previous Chat">
      <ChevronUp size={24} />
    </button>
    <button className="nav-arrow" onClick={onNext} aria-label="Next Chat">
      <ChevronDown size={24} />
    </button>
  </div>
);

const ProfileSidebar = ({ participant, otherChats, messageCount }) => (
  <div className="chat-sidebar">
    <div className="profile-card">
      <div className="profile-avatar-large" style={{ background: participant.color }}>
        {participant.avatar}
      </div>
      <div className="profile-name">{participant.username}</div>
      <div className="profile-handle">{participant.handle}</div>
      <div className="profile-badge">PUBLIC</div>
      <div className="profile-stat">
        <span>MESSAGES</span>
        <span>{messageCount}</span>
      </div>
    </div>
    <div className="other-chats-section">
      <div className="other-chats-title">OTHER CHATS BY {participant.username.split(' ')[0].toUpperCase()}</div>
      {otherChats.map((chat, i) => (
        <Link key={i} to={`/chat/${chat.id}`} className="other-chat-item">
          <div className="other-chat-avatar" style={{ background: chat.color }}>{chat.avatar}</div>
          <div>
            <div className="other-chat-name">{chat.username}</div>
            <div className="other-chat-handle">{chat.handle}</div>
          </div>
        </Link>
      ))}
    </div>
    <div className="ad-card">
      <div className="ad-badge">SPONSOR</div>
      <div className="ad-title">NEO-DRIVE</div>
      <div className="ad-text">Fast. Secure. Brutalist. Get the new SSD now.</div>
    </div>
  </div>
);

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [chatData, setChatData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [direction, setDirection] = useState(1); // 1 = next (down), -1 = prev (up)
  const messagesRef = useRef(null);
  const isNavigatingRef = useRef(false);

  const currentIdIndex = availableIds.indexOf(Number(id));

  const goNext = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setDirection(1);
    const nextIndex = (currentIdIndex + 1) % availableIds.length;
    navigate(`/chat/${availableIds[nextIndex]}`);
    setTimeout(() => { isNavigatingRef.current = false; }, 700);
  };

  const goPrev = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setDirection(-1);
    const prevIndex = (currentIdIndex - 1 + availableIds.length) % availableIds.length;
    navigate(`/chat/${availableIds[prevIndex]}`);
    setTimeout(() => { isNavigatingRef.current = false; }, 700);
  };

  useEffect(() => {
    let pullAmount = 0;
    const threshold = 300; // slightly harder to trigger navigation

    const handleWheel = (e) => {
      if (isNavigatingRef.current) return;
      const el = messagesRef.current;
      if (!el) return;

      if (e.deltaY > 0) {
        // Scrolling down
        const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 8;
        if (atBottom) {
          pullAmount += e.deltaY;
          if (pullAmount > threshold) {
            pullAmount = 0;
            goNext();
          }
        } else {
          pullAmount = 0;
        }
      } else if (e.deltaY < 0) {
        // Scrolling up
        const atTop = el.scrollTop <= 0;
        if (atTop) {
          pullAmount -= e.deltaY; // deltaY is negative, so subtract to add
          if (pullAmount > threshold) {
            pullAmount = 0;
            goPrev();
          }
        } else {
          pullAmount = 0;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [id, currentIdIndex]);

  useEffect(() => {
    const mock = mockChatData[id];
    if (mock) {
      setChatData(mock);
      setMessages(mock.messages || []);
    }

    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/conversations/${id}/`);
        if (response.data.messages?.length > 0) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.log("Using mock data for chat", id);
      }
    };
    fetchMessages();

    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${id}/`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'receive_message') {
        setMessages(prev => [...prev, {
          sender: data.sender_username || 'ANON',
          text: data.text
        }]);
      }
    };
    setSocket(ws);
    return () => ws.close();
  }, [id]);

  if (!chatData) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
      LOADING...
    </div>
  );

  const p1 = chatData.participants[0];
  const p2 = chatData.participants[1];
  const p1MsgCount = messages.filter(m => m.sender === p1.username.split(' ')[0].toUpperCase() || m.sender === p1.avatar).length || messages.length;
  const p2MsgCount = messages.filter(m => m.sender === p2.username.split(' ')[0].toUpperCase() || m.sender === p2.avatar).length || messages.length;

  const slideVariants = {
    enter: (dir) => ({ y: dir > 0 ? '100%' : '-100%', opacity: 1 }),
    center: { y: 0, opacity: 1 },
    exit: (dir) => ({ y: dir > 0 ? '-100%' : '100%', opacity: 1 }),
  };

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: 'var(--bg-color)' }}>
      {/* Sticky header sits outside the animated area */}
      <header className="header chat-header-bar" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" className="back-arrow"><ArrowLeft size={20} /></Link>
            <Link to="/" className="logo">CCHAT<span>.</span></Link>
          </div>
          <div className="live-status">
            <span>{id} / ∞</span>
            <div className="live-indicator">
              <div className="live-dot" /> LIVE
            </div>
          </div>
        </div>
      </header>

      {/* Full-viewport animated slides */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: 'absolute',
            inset: 0,
            paddingTop: '57px', // header height
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="chat-page-layout" style={{ flex: 1, minHeight: 0 }}>

            {/* Left sidebar */}
            <ProfileSidebar participant={p1} otherChats={chatData.otherChats.left} messageCount={p1MsgCount} />

            {/* Center chat column — fills remaining height */}
            <div className="chat-center" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
              <div className="chat-thread-header">
                <div className="chat-thread-participants">
                  <div className="chat-thread-avatar" style={{ background: p1.color }}>{p1.avatar}</div>
                  <span className="chat-thread-name">{p1.username}</span>
                  <span className="chat-vs">vs</span>
                  <div className="chat-thread-avatar" style={{ background: p2.color }}>{p2.avatar}</div>
                  <span className="chat-thread-name">{p2.username}</span>
                </div>
                <div className="chat-thread-meta">
                  <span className="chat-status-badge">{chatData.status}</span>
                  <span className="chat-time">{chatData.created_at.toUpperCase()}</span>
                </div>
              </div>

              {/* Scrollable messages — this is what the user scrolls through */}
              <div
                className="chat-messages-list"
                ref={messagesRef}
                style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}
              >
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    className="chat-message-row"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + (i * 0.04), duration: 0.25 }}
                  >
                    <div className="chat-msg-content">
                      <span className="chat-msg-sender">{msg.sender || msg.sender_username || 'ANON'}:</span>
                      <span className="chat-msg-text">{msg.text}</span>
                    </div>
                    <div className="chat-msg-actions">
                      <span className="chat-action">+ react</span>
                      <MessageCircle size={12} />
                      <span>{Math.floor(Math.random() * 3)} ∨</span>
                    </div>
                  </motion.div>
                ))}

                {/* End marker lives inside the scroll so it's the scroll target */}
                <div className="chat-end-marker">
                  <span>📁 END OF CONVERSATION · scroll to reveal next</span>
                </div>
              </div>

              {/* Reactions bar pinned at bottom of center column */}
              <div className="chat-reactions-bar">
                <div className="reactions">
                  <div className="reaction-pill"><ThumbsUp size={14} /> {chatData.likes}</div>
                  <div className="reaction-pill"><Skull size={14} /> {chatData.dislikes}</div>
                  <div className="reaction-pill active"><Heart size={14} fill="#fff" color="#fff" /> {chatData.caps}</div>
                  <div className="reaction-pill"><Smile size={14} /> {chatData.smiles}</div>
                </div>
                <div className="chat-views-info">
                  <Eye size={14} /> {chatData.views} &nbsp; <Users size={14} /> {chatData.watching} watching
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <ProfileSidebar participant={p2} otherChats={chatData.otherChats.right} messageCount={p2MsgCount} />
          </div>
        </motion.div>
      </AnimatePresence>

      <NavigationArrows onNext={goNext} onPrev={goPrev} />
    </div>
  );
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
