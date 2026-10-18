import React, { useState } from 'react';
import { X, Search, FileText, Download, ExternalLink, Filter, Sparkles, BookOpen } from 'lucide-react';
import { sound } from '../services/audioEngine';
import { LIBRARY_DATA } from '../data/libraryData';

export default function LibraryModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('papers'); // 'papers' | 'notes'
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const papers = LIBRARY_DATA.pastPapers || [];
  const notes = LIBRARY_DATA.notes || [];

  const filteredPapers = papers.filter(p => {
    const matchSub = subjectFilter === 'all' || p.subject === subjectFilter;
    const matchQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.year.includes(searchQuery);
    return matchSub && matchQuery;
  });

  const filteredNotes = notes.filter(n => {
    const matchSub = subjectFilter === 'all' || n.subject === subjectFilter;
    const matchQuery = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSub && matchQuery;
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="portal-modal" style={{ maxWidth: '960px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={22} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                ඩිජිටල් වාණිජ පුස්තකාලය (Commerce Resource Vault)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                පසුගිය විභාග ප්‍රශ්න පත්‍ර 90ක් (2010-2026) සහ නිබන්ධන 194ක්
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div style={{ padding: '16px 28px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Resource Category Tabs */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            <button
              onClick={() => { sound.playClick(); setActiveTab('papers'); }}
              className={`eval-tab-btn ${activeTab === 'papers' ? 'active' : ''}`}
            >
              <FileText size={15} />
              <span>පසුගිය ප්‍රශ්න පත්‍ර & ලකුණු දීමේ පටිපාටි (90)</span>
            </button>
            <button
              onClick={() => { sound.playClick(); setActiveTab('notes'); }}
              className={`eval-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            >
              <BookOpen size={15} />
              <span>පාඩම් නිබන්ධන & කෙටි සටහන් (194)</span>
            </button>
          </div>

          {/* Subject Pills */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'all', label: 'සියල්ල' },
              { id: 'accounting', label: 'ගිණුම්කරණය' },
              { id: 'business', label: 'ව්‍යාපාර අධ්‍යයනය' },
              { id: 'economics', label: 'ආර්ථික විද්‍යාව' }
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => { sound.playClick(); setSubjectFilter(sub.id); }}
                style={{
                  background: subjectFilter === sub.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: subjectFilter === sub.id ? '#fff' : '#94a3b8',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sinhala)'
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 28px 0' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="වසර, විෂය හෝ පාඩමේ නම අනුව සොයන්න..."
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'var(--font-sinhala)'
              }}
            />
          </div>
        </div>

        {/* Content List */}
        <div className="modal-content-body">
          {activeTab === 'papers' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {filteredPapers.map(paper => (
                <div key={paper.id} className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '4px' }}>
                        {paper.year} A/L
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {paper.lang}
                      </span>
                    </div>
                    <h5 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', fontFamily: 'var(--font-sinhala)', lineHeight: 1.5 }}>
                      {paper.title}
                    </h5>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <a
                      href={paper.path}
                      target="_blank"
                      rel="noreferrer"
                      className="hud-btn"
                      style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', fontSize: '0.8rem' }}
                    >
                      <Download size={14} />
                      <span>පේපරය</span>
                    </a>
                    {paper.schemePath && (
                      <a
                        href={paper.schemePath}
                        target="_blank"
                        rel="noreferrer"
                        className="hud-btn"
                        style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981', color: '#34d399' }}
                      >
                        <ExternalLink size={14} />
                        <span>විවරණය/Scheme</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {filteredNotes.map(note => (
                <div key={note.id} className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', padding: '2px 8px', borderRadius: '4px' }}>
                        {note.type}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>
                        {note.subject}
                      </span>
                    </div>
                    <h5 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', fontFamily: 'var(--font-sinhala)', lineHeight: 1.5 }}>
                      {note.title}
                    </h5>
                  </div>

                  <a
                    href={note.path}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ justifyContent: 'center', textDecoration: 'none', fontSize: '0.85rem', padding: '10px' }}
                  >
                    <Download size={15} />
                    <span>PDF සටහන විවෘත කරන්න</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
