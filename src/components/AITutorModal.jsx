import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, HelpCircle, Lightbulb } from 'lucide-react';
import { sound } from '../services/audioEngine';
import { askCommerceTutor } from '../services/geminiService';

export default function AITutorModal({ currentSubjectName, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `ආයුබෝවන්! මම ඔබගේ A/L Commerce AI උපදේශකවරයා. ${currentSubjectName || 'වාණිජ විෂයයන්'} සම්බන්ධයෙන් ඔබට ඇති ඕනෑම අපැහැදිලි සිද්ධාන්තයක්, ගිණුම්කරණ ගැටළුවක් හෝ විභාග උපදෙසක් මෙතැනින් විමසන්න!`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "ගිණුම්කරණ සමීකරණය සරලව පහදන්න",
    "ද්විත්ව සටහන් රන් රීතිය (Golden Rule)",
    "PPC වක්‍රය මූලාරම්භයට අවතල ඇයි?",
    "PESTEL විග්‍රහයේ සාධක 6 මොනවාද?",
    "CVP සූත්‍ර පහසුවෙන් මතක තියාගන්නේ කොහොමද?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    sound.playClick();
    const newMessages = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await askCommerceTutor({
        question: text,
        subject: currentSubjectName
      });
      setMessages([...newMessages, { role: 'assistant', text: response }]);
      sound.playSuccess();
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', text: "සමාවන්න, සේවාදායකයේ කාර්යබහුල බවක් පවතී. කරුණාකර සුළු මොහොතකින් නැවත විමසන්න." }]);
      sound.playError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="portal-modal" style={{ maxWidth: '820px', height: '82vh' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={22} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                සජීවී වාණිජ AI උපදේශක (Commerce AI Mentor)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                0 සිට A+ දක්වා ඕනෑම සංකල්පයක් සරලව අසා දැනගන්න
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#cbd5e1',
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-sinhala)'
              }}
            >
              💡 {q}
            </button>
          ))}
        </div>

        {/* Chat Messages Log */}
        <div className="modal-content-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {m.role === 'assistant' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={18} color="#fff" />
                </div>
              )}

              <div
                style={{
                  background: m.role === 'user' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'rgba(255,255,255,0.06)',
                  border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '0.92rem',
                  lineHeight: 1.65,
                  fontFamily: 'var(--font-sinhala)',
                  whiteSpace: 'pre-line'
                }}
              >
                {m.text}
              </div>

              {m.role === 'user' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={18} color="#fff" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="#fff" />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 18px', borderRadius: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                සිතමින් පවතී... ✍️
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            placeholder="ඕනෑම ගැටළුවක් හෝ ප්‍රශ්නයක් මෙහි ලියන්න..."
            style={{
              flex: 1,
              padding: '12px 18px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.95rem',
              fontFamily: 'var(--font-sinhala)',
              outline: 'none'
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputText.trim()}
            className="btn-primary"
            style={{ padding: '12px 20px' }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
