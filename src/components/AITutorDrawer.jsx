import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  Paperclip, 
  FolderOpen,
  FileText,
  FileImage,
  FileCode,
  Search,
  BookOpen,
  Volume2,
  Sparkles,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { askCommerceTutor, evaluateHandwrittenAnswer, getActiveEngineStatus } from '../services/geminiService';
import { renderMarkdownWithMath } from '../utils/markdownRenderer';
import { voiceHighlighter } from '../services/voiceHighlighterService';
import InteractiveFrameModal from './InteractiveFrameModal';

export default function AITutorDrawer({
  isOpen,
  onClose,
  initialTopic = '',
  catalog = []
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `ආයුබෝවන්! මම ඔබගේ **A/L Commerce AI Master Tutor**.
      
අ.පො.ස. උසස් පෙළ වාණිජ විෂය ධාරාවේ (**ගිණුම්කරණය, ව්‍යාපාර අධ්‍යයනය, ආර්ථික විද්‍යාව**) ඕනෑම සිද්ධාන්ත ගැටලුවක්, ද්විත්ව සටහන්, PESTEL සාධක, PPC වක්‍ර හෝ විභාග ප්‍රශ්න මා වෙත යොමු කරන්න.

✨ **නව විශේෂාංග (New Superpowers):**
1. 🎮 **Interactive Simulations & Frames:** මගෙන් ඕනෑම සංකල්පයකට අන්තර්ක්‍රියාකාරී Quiz, Mind Map හෝ HTML Simulation එකක් හදන්න ඉල්ලන්න. එය යෙදුම තුලම සජීවීව ක්‍රියාත්මක වේ!
2. 🔊 **Synchronized Voice Teacher:** මගේ ඕනෑම පිළිතුරක් සිංහලෙන් හඬ ආධාරයෙන් (Listen) අසන්න.
3. 📎 **ගොනු විශ්ලේෂණය:** ඔබගේ Notes, Past Papers හෝ අතින් ලියූ පිළිතුරු Photos මා වෙත Attach කර නිල Marking Scheme එකට අනුව ලකුණු ලබාගන්න!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [repoSearchQuery, setRepoSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeInteractivePage, setActiveInteractivePage] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, attachedFiles]);

  useEffect(() => {
    if (initialTopic && isOpen) {
      setInputVal(`මට "${initialTopic}" පාඩමට අදාළ A/L විභාගයේදී අසන ප්‍රධාන කරුණු, ද්විත්ව සටහන්/සංකල්ප සහ ලකුණු ලබා ගැනීමේ උපදෙස් පැහැදිලි කරන්න.`);
    }
  }, [initialTopic, isOpen]);

  // Helper to extract <temp_page>...</temp_page> tags from assistant text
  const parseTempPages = (text) => {
    if (!text) return { cleanText: '', tempPages: [] };
    const tempPages = [];
    const regex = /<temp_page\s+type="([^"]+)"\s+title="([^"]+)">([\s\S]*?)<\/temp_page>/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      tempPages.push({
        id: 'page_' + Math.random().toString(36).substr(2, 9),
        type: match[1],
        title: match[2],
        content: match[3].trim()
      });
    }

    const cleanText = text.replace(regex, '').trim();
    return { cleanText, tempPages };
  };

  // Handle local file selection from PC / Mobile device
  const handleLocalFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (file.size > 15 * 1024 * 1024) {
        alert(`${file.name} is larger than 15MB.`);
        return;
      }

      const isText = file.type.startsWith('text/') || file.name.match(/\.(md|txt|json|js|py|html|css)$/i);
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

      const reader = new FileReader();

      reader.onload = () => {
        if (isText) {
          setAttachedFiles(prev => [
            ...prev,
            {
              id: 'file_' + Date.now() + Math.random(),
              name: file.name,
              type: 'text',
              content: reader.result
            }
          ]);
        } else if (isImage || isPdf) {
          const base64Data = reader.result.split(',')[1];
          setAttachedFiles(prev => [
            ...prev,
            {
              id: 'file_' + Date.now() + Math.random(),
              name: file.name,
              type: 'inlineData',
              mimeType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
              data: base64Data,
              previewUrl: isImage ? reader.result : null
            }
          ]);
        }
      };

      if (isText) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });

    e.target.value = '';
  };

  // Attach a file directly from the website's catalog
  const handleAttachCatalogItem = async (item) => {
    setIsRepoModalOpen(false);
    const fileName = item.path.split('/').pop();
    const ext = fileName.split('.').pop().toLowerCase();

    if (['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      try {
        const res = await fetch(`/${item.path}`);
        if (!res.ok) throw new Error('File not found');
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result.split(',')[1];
          setAttachedFiles(prev => [
            ...prev,
            {
              id: 'catalog_' + Date.now() + Math.random(),
              name: fileName,
              type: 'inlineData',
              mimeType: ext === 'pdf' ? 'application/pdf' : blob.type || 'image/jpeg',
              data: base64Data
            }
          ]);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        setAttachedFiles(prev => [
          ...prev,
          {
            id: 'catalog_' + Date.now() + Math.random(),
            name: fileName,
            type: 'text',
            content: `Attached Course Catalog Resource: ${item.path}`
          }
        ]);
      }
    } else {
      try {
        const res = await fetch(`/${item.path}`);
        const text = await res.text();
        setAttachedFiles(prev => [
          ...prev,
          {
            id: 'catalog_' + Date.now() + Math.random(),
            name: fileName,
            type: 'text',
            content: text
          }
        ]);
      } catch (e) {
        setAttachedFiles(prev => [
          ...prev,
          {
            id: 'catalog_' + Date.now() + Math.random(),
            name: fileName,
            type: 'text',
            content: `Attached Course Catalog Resource: ${item.path}`
          }
        ]);
      }
    }
  };

  const handleRemoveAttachment = (id) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSendMessage = async (customPrompt = null) => {
    const textToSend = customPrompt || inputVal;
    if (!textToSend.trim() && attachedFiles.length === 0) return;

    const filesToSend = [...attachedFiles];
    setAttachedFiles([]);
    setInputVal('');

    const userMsg = {
      role: 'user',
      text: textToSend,
      attachments: filesToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const imageFile = filesToSend.find(f => f.type === 'inlineData' && f.mimeType?.startsWith('image/'));
      const isGradingRequest = textToSend.toLowerCase().includes('grade') || 
                               textToSend.toLowerCase().includes('mark') || 
                               textToSend.includes('ලකුණු') || 
                               textToSend.includes('ඇගයීම');

      if (imageFile && isGradingRequest) {
        const evaluation = await evaluateHandwrittenAnswer({
          questionText: textToSend || "Analyze and grade this A/L Commerce answer",
          handwrittenImage: {
            mimeType: imageFile.mimeType,
            data: imageFile.data
          }
        });

        const replyText = `### 📝 Exam Grading Evaluation Report
**Grade:** \`${evaluation.grade}\` (${evaluation.score} / ${evaluation.maxScore} Marks)

**Summary Feedback:**
${evaluation.feedbackSummary}

#### Detailed Rubric Checklist:
${evaluation.rubricChecklist?.map(r => `- **${r.criterion}**: ${r.earned}/${r.max} [${r.status.toUpperCase()}] — *${r.note}*`).join('\n') || ''}

#### 💡 Missing Key Points for A+:
${evaluation.missingPoints?.map(p => `- ${p}`).join('\n') || 'All essential points covered!'}

#### 🎯 Model Answer Key:
${evaluation.modelAnswer || ''}

> ⚠️ **Examiner Tip:** ${evaluation.proExamTip || 'Keep your handwriting legible and use clear headings.'}`;

        setMessages(prev => [...prev, {
          role: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        const reply = await askCommerceTutor({
          question: textToSend || "කරුණාකර අමුණා ඇති ගොනුවේ අන්තර්ගතය විශ්ලේෂණය කර පැහැදිලි කරන්න.",
          subject: "A/L Commerce Stream",
          attachedFiles: filesToSend
        });

        setMessages(prev => [...prev, {
          role: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "සම්බන්ධතාවයේ දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සාහ කරන්න.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCatalogItems = (catalog || []).filter(item => {
    if (item.type !== 'blob') return false;
    const p = item.path.toLowerCase();
    if (p.includes('english') || p.includes('tamil')) return false;
    if (!repoSearchQuery.trim()) return true;
    return p.includes(repoSearchQuery.toLowerCase());
  }).slice(0, 40);

  const engineStatus = getActiveEngineStatus();

  if (!isOpen) return null;

  return (
    <div className="ptm-drawer-backdrop" onClick={onClose}>
      <div className="ptm-ai-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-row">
            <div className="ai-avatar-box">
              <Bot size={22} color="#ffffff" />
            </div>
            <div>
              <h3 className="ai-name">A/L Commerce AI Tutor</h3>
              <p className="ai-status">
                <span className="online-indicator"></span> 
                {engineStatus.model} • 4-Model Fallback Engine • Ready
              </p>
            </div>
          </div>

          <button className="btn-drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="ai-chips-scroll no-scrollbar">
          <button 
            className="ai-chip"
            onClick={() => handleSendMessage("ගිණුම්කරණ සමීකරණය (A = E + L) සහ ද්විත්ව සටහන් රීතිය සරලව පහදන්න.")}
          >
            Accounting Equation (A=E+L)
          </button>
          <button 
            className="ai-chip"
            onClick={() => handleSendMessage("මට CVP (පිරිවැය-ප්‍රමාණ-ලාභ) විශ්ලේෂණය තේරුම් ගන්න කුඩා Interactive HTML Simulation එකක් හදල දෙන්න.")}
          >
            🎮 Build CVP Simulation Frame
          </button>
          <button 
            className="ai-chip"
            onClick={() => handleSendMessage("PESTEL සාර්ව පරිසර සාධක 6 උදාහරණ සහිතව විස්තර කරන්න.")}
          >
            PESTEL Environmental Analysis
          </button>
          <button 
            className="ai-chip"
            onClick={() => handleSendMessage("නිෂ්පාදන ශක්‍යතා වක්‍රය (PPC) සහ අවස්ථා පිරිවැය පැහැදිලි කරන්න.")}
          >
            PPC Curve & Opportunity Cost
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="chat-messages-body">
          {messages.map((msg, index) => {
            const { cleanText, tempPages } = msg.role === 'assistant' 
              ? parseTempPages(msg.text) 
              : { cleanText: msg.text, tempPages: [] };

            return (
              <div key={index} className={`chat-bubble-row ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="chat-avatar bot">
                    <Bot size={16} />
                  </div>
                )}

                <div className="chat-bubble-content">
                  {/* Render Attached Files Preview in User Message */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="msg-attachments-summary">
                      {msg.attachments.map(att => (
                        <span key={att.id || att.name} className="msg-att-chip">
                          {att.mimeType?.startsWith('image/') ? (
                            <FileImage size={13} className="text-amber-400" />
                          ) : (
                            <FileText size={13} className="text-blue-400" />
                          )}
                          <span>{att.name}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Main Bubble Markdown Text */}
                  <div 
                    className="bubble-markdown markdown-body"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(cleanText || msg.text) }}
                  />

                  {/* Generated Interactive Temp Pages (Simulations, Frames, Quizzes) */}
                  {tempPages.length > 0 && (
                    <div className="ai-temp-pages-container">
                      {tempPages.map(page => (
                        <div key={page.id} className="ai-temp-page-card">
                          <div className="temp-card-left">
                            <div className="temp-card-icon">
                              <Sparkles size={16} className="text-amber-400" />
                            </div>
                            <div className="temp-card-info">
                              <span className="temp-card-badge">
                                {page.type === 'html' ? '🎮 Interactive App / Frame' : '📝 Deep Study Guide'}
                              </span>
                              <h4 className="temp-card-title">{page.title}</h4>
                            </div>
                          </div>
                          <button 
                            className="btn-launch-frame"
                            onClick={() => setActiveInteractivePage(page)}
                            title="Open Interactive Sandboxed Frame"
                          >
                            <span>විවෘත කරන්න</span>
                            <ExternalLink size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bubble Footer Bar (Time & Read Aloud) */}
                  <div className="bubble-footer-bar">
                    <span className="bubble-time">{msg.timestamp}</span>

                    {msg.role === 'assistant' && (
                      <button 
                        className="btn-speak-msg"
                        onClick={() => voiceHighlighter.speakText(cleanText || msg.text, { lang: 'si' })}
                        title="Listen to this explanation with AI Voice Teacher"
                      >
                        <Volume2 size={13} />
                        <span>හඬින් අසන්න</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="chat-bubble-row assistant">
              <div className="chat-avatar bot">
                <Bot size={16} />
              </div>
              <div className="chat-bubble-content loading-bubble">
                <span className="dot-pulse">Analyzing Documents & Thinking with Gemini 3.6...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Active Attachments Chips Bar */}
        {attachedFiles.length > 0 && (
          <div className="chat-active-attachments-bar">
            <span className="attach-title-label">Attached to next message ({attachedFiles.length}):</span>
            <div className="attach-chips-wrap">
              {attachedFiles.map((file) => (
                <div key={file.id} className="active-attach-chip">
                  {file.type === 'inlineData' && file.mimeType?.startsWith('image/') ? (
                    <FileImage size={13} className="text-amber-400" />
                  ) : (
                    <FileText size={13} className="text-blue-400" />
                  )}
                  <span className="attach-chip-name" title={file.name}>{file.name}</span>
                  <button 
                    type="button" 
                    className="btn-chip-remove"
                    onClick={() => handleRemoveAttachment(file.id)}
                    title="Remove attachment"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="chat-input-bar">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLocalFileSelect} 
            accept=".txt,.md,.html,.js,.css,.py,.java,.c,.cpp,image/*,application/pdf" 
            multiple
            style={{ display: 'none' }} 
          />

          <button 
            type="button"
            className="input-tool-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach File from PC (PDF, Notes, Images, Answer Photos)"
          >
            <Paperclip size={18} />
          </button>

          <button 
            type="button"
            className="input-tool-btn"
            onClick={() => setIsRepoModalOpen(true)}
            title="Attach Note/Past Paper from Website Catalog"
          >
            <FolderOpen size={18} />
          </button>

          <input 
            type="text" 
            className="chat-text-input" 
            placeholder={attachedFiles.length > 0 ? "Ask about attached documents..." : "Ask a question or request an interactive simulation..."}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />

          <button 
            type="submit"
            className="btn-send-msg"
            onClick={() => handleSendMessage()}
            disabled={isLoading || (!inputVal.trim() && attachedFiles.length === 0)}
          >
            <Send size={18} />
          </button>
        </div>

        {/* ========================================================
            WEBSITE REPOSITORY / CATALOG ATTACH MODAL
        ======================================================== */}
        {isRepoModalOpen && (
          <div className="repo-modal-overlay" onClick={() => setIsRepoModalOpen(false)}>
            <div className="repo-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="repo-modal-header">
                <div className="repo-modal-title">
                  <FolderOpen size={18} className="text-emerald-400" />
                  <span>Attach from Website Catalog</span>
                </div>
                <button className="btn-close-repo-modal" onClick={() => setIsRepoModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="repo-modal-search">
                <Search size={15} className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search notes, past papers, syllabuses (e.g. 2023, accounting)..."
                  value={repoSearchQuery}
                  onChange={(e) => setRepoSearchQuery(e.target.value)}
                  className="repo-search-input"
                  autoFocus
                />
              </div>

              <div className="repo-modal-list no-scrollbar">
                {filteredCatalogItems.map((item, idx) => {
                  const name = item.path.split('/').pop();
                  const isPdf = name.endsWith('.pdf');
                  return (
                    <div 
                      key={idx} 
                      className="repo-item-row"
                      onClick={() => handleAttachCatalogItem(item)}
                    >
                      <div className="repo-item-icon">
                        {isPdf ? <BookOpen size={16} className="text-rose-400" /> : <FileText size={16} className="text-blue-400" />}
                      </div>
                      <div className="repo-item-info">
                        <span className="repo-item-name">{name.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}</span>
                        <span className="repo-item-path">{item.path}</span>
                      </div>
                      <button className="btn-repo-attach-action">
                        Attach
                      </button>
                    </div>
                  );
                })}

                {filteredCatalogItems.length === 0 && (
                  <div className="repo-empty-state">
                    <p>No matching resources found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Interactive Frame Modal for Previewing HTML / Simulations */}
        <InteractiveFrameModal 
          isOpen={!!activeInteractivePage}
          onClose={() => setActiveInteractivePage(null)}
          pageData={activeInteractivePage}
        />
      </div>
    </div>
  );
}
