import React, { useState, useRef, useEffect } from 'react';
import { SendHorizonal, Bot, User, AlertTriangle, Trash2, Leaf } from 'lucide-react';
import { sendToGemini } from '../../../services/aiService';
import { getUserName, getUserRole } from '../../../utils/auth';

// ─── Typing Indicator dots ────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-4">
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #15803d, #22c55e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Bot size={16} color="#fff" />
    </div>
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '18px 18px 18px 4px',
        padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#15803d',
            display: 'inline-block',
            animation: 'dotBounce 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
    <span style={{ fontSize: '0.7rem', color: '#94a3b8', paddingBottom: 2 }}>
      AI is typing…
    </span>
  </div>
);

// ─── Single message bubble ─────────────────────────────────────────────────────
const MessageBubble = ({ msg, userName, userRole }) => {
  const isUser = msg.role === 'user';

  const formattedText = msg.text
    .split('\n')
    .map((line, i) => (
      <span key={i}>
        {line}
        {i < msg.text.split('\n').length - 1 && <br />}
      </span>
    ));

  return (
    <div
      className="flex items-end gap-2 mb-4"
      style={{ flexDirection: isUser ? 'row-reverse' : 'row' }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: isUser
            ? 'linear-gradient(135deg, #064e3b, #065f46)'
            : 'linear-gradient(135deg, #15803d, #22c55e)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        {isUser ? <User size={16} color="#fff" /> : <Bot size={16} color="#fff" />}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '72%' }}>
        <div
          style={{
            fontSize: '0.7rem',
            color: '#94a3b8',
            marginBottom: 4,
            textAlign: isUser ? 'right' : 'left',
            fontWeight: 500,
          }}
        >
          {isUser ? `${userName} (${userRole})` : '🌿 AgriAI Assistant'}
        </div>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: isUser
              ? '18px 18px 4px 18px'
              : '18px 18px 18px 4px',
            background: isUser
              ? 'linear-gradient(135deg, #15803d, #16a34a)'
              : '#fff',
            color: isUser ? '#fff' : '#1e293b',
            border: isUser ? 'none' : '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {formattedText}
        </div>
        <div
          style={{
            fontSize: '0.65rem',
            color: '#cbd5e1',
            marginTop: 3,
            textAlign: isUser ? 'right' : 'left',
          }}
        >
          {new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Main Chat Component ───────────────────────────────────────────────────────
const AiChat = () => {
  const userName = getUserName() || 'User';
  const userRole = getUserRole() || 'FARMER';

  const systemPrompt = `You are AgriAI Assistant, an expert agricultural advisor embedded in the AgriConnect supply chain platform.

The user currently logged in is: ${userName}, who has the role: ${userRole}.

Based on their role, tailor your responses:
- FARMER: Focus on crop cultivation, quality grading, pricing strategies, produce listing tips, harvest management.
- DEALER: Focus on market trends, buying produce, negotiating prices, managing purchases and shipments.
- TRANSPORTER: Focus on route optimization, delivery management, vehicle maintenance, logistics best practices.
- ADMIN: Provide a broad overview covering all roles, platform management, and analytics insights.

Always:
- Be concise, practical, and friendly.
- Use data-driven advice when possible.
- Keep responses focused on agriculture and supply chain topics.
- Use emojis sparingly to keep things warm but professional.
- If asked something outside agriculture/supply chain, politely redirect.`;

  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: `Hello ${userName}! 👋 I'm your AgriAI Assistant. As a ${userRole.toLowerCase()}, I can help you with crop advice, market insights, logistics, and more. What's on your mind today?`,
      timestamp: Date.now(),
    },
  ]);
  const [history, setHistory] = useState([]); // Gemini-format history (no timestamp)
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isTyping) return;

    const userMsg = { role: 'user', text, timestamp: Date.now() };
    const newHistory = [...history, { role: 'user', text }];

    setMessages((prev) => [...prev, userMsg]);
    setHistory(newHistory);
    setInputText('');
    setIsTyping(true);
    setError(null);

    try {
      const reply = await sendToGemini(newHistory, systemPrompt);
      const aiMsg = { role: 'model', text: reply, timestamp: Date.now() };
      setMessages((prev) => [...prev, aiMsg]);
      setHistory((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      setError(err.message || 'Failed to get a response. Please try again.');
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'model',
        text: `Chat cleared! Hello again, ${userName} 👋 How can I help you today?`,
        timestamp: Date.now(),
      },
    ]);
    setHistory([]);
    setError(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        maxWidth: 760,
        margin: '0 auto',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #15803d 0%, #16a34a 60%, #22c55e 100%)',
          borderRadius: '16px 16px 0 0',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(21,128,61,0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Leaf size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
              AgriAI Assistant
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', margin: 0 }}>
              Powered by Gemini · Agriculture Expert
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Online indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#86efac',
                boxShadow: '0 0 6px #86efac',
                display: 'inline-block',
              }}
            />
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem' }}>Online</span>
          </div>
          <button
            onClick={handleClearChat}
            title="Clear chat"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 8,
              padding: '6px 10px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.8rem',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      {/* ── Messages Area ──────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px 8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderTop: 'none',
        }}
      >
        {/* Role context chip */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span
            style={{
              display: 'inline-block',
              background: '#dcfce7',
              color: '#166534',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '3px 12px',
              borderRadius: 20,
              border: '1px solid #bbf7d0',
            }}
          >
            🌾 Context: {userName} · {userRole}
          </span>
        </div>

        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            msg={msg}
            userName={userName}
            userRole={userRole}
          />
        ))}

        {isTyping && <TypingIndicator />}

        {/* Error banner */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 12,
              color: '#dc2626',
              fontSize: '0.85rem',
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input Bar ──────────────────────────────────────────────────────── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderTop: '1px solid #e2e8f0',
          borderRadius: '0 0 16px 16px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 10,
          boxShadow: '0 -2px 12px rgba(0,0,0,0.04)',
        }}
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            // Auto-grow textarea
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
          onKeyDown={handleKeyDown}
          placeholder={`Ask AgriAI anything about ${
            userRole === 'FARMER'
              ? 'crops, pricing, quality…'
              : userRole === 'DEALER'
              ? 'market trends, purchases…'
              : userRole === 'TRANSPORTER'
              ? 'deliveries, routes…'
              : 'the agricultural network…'
          }`}
          disabled={isTyping}
          style={{
            flex: 1,
            resize: 'none',
            border: '1.5px solid #e2e8f0',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            color: '#1e293b',
            background: isTyping ? '#f8fafc' : '#fff',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            minHeight: 44,
            maxHeight: 120,
            overflowY: 'auto',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#15803d';
            e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.12)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        />

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isTyping}
          title="Send (Enter)"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background:
              !inputText.trim() || isTyping
                ? '#d1d5db'
                : 'linear-gradient(135deg, #15803d, #16a34a)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: !inputText.trim() || isTyping ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow:
              !inputText.trim() || isTyping
                ? 'none'
                : '0 4px 12px rgba(21,128,61,0.35)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!inputText.trim() || isTyping) return;
            e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(21,128,61,0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow =
              !inputText.trim() || isTyping
                ? 'none'
                : '0 4px 12px rgba(21,128,61,0.35)';
          }}
        >
          <SendHorizonal size={18} color="#fff" />
        </button>
      </div>

      {/* Enter hint */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '0.7rem',
          color: '#94a3b8',
          marginTop: 6,
        }}
      >
        Press <kbd style={{ fontFamily: 'inherit', fontWeight: 600 }}>Enter</kbd> to send ·{' '}
        <kbd style={{ fontFamily: 'inherit', fontWeight: 600 }}>Shift+Enter</kbd> for new line
      </p>
    </div>
  );
};

export default AiChat;
