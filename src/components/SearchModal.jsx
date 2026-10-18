import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Video, 
  FileText, 
  BookOpen, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { getPdfSummary } from '../data/pdfSummaries';

export default function SearchModal({
  isOpen,
  onClose,
  catalog = [],
  onOpenVideo,
  onOpenPdf
}) {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const qLower = query.toLowerCase().trim();
    const matchedItems = [];

    for (let i = 0; i < catalog.length; i++) {
      const item = catalog[i];

      // Type filtering
      if (filterType === 'video' && item.type !== 'yt') continue;
      if (filterType === 'paper' && (!item.path?.includes('past-papers') || item.type !== 'blob')) continue;
      if (filterType === 'note' && (item.type !== 'blob' || item.path?.includes('past-papers'))) continue;

      // Text match on basic properties
      const titleMatch = item.title && item.title.toLowerCase().includes(qLower);
      const pathMatch = item.path && item.path.toLowerCase().includes(qLower);

      let summaryInfo = null;
      let deepMatch = false;

      // For PDFs, consult the deep syllabus knowledge engine
      if (item.type === 'blob') {
        summaryInfo = getPdfSummary(item);
        if (summaryInfo) {
          const sumTitleMatch = summaryInfo.title && summaryInfo.title.toLowerCase().includes(qLower);
          const sumTextMatch = summaryInfo.summary && summaryInfo.summary.toLowerCase().includes(qLower);
          const topicMatch = summaryInfo.topics && summaryInfo.topics.some(t => t.toLowerCase().includes(qLower));
          const keywordMatch = summaryInfo.keywords && summaryInfo.keywords.some(k => k.toLowerCase().includes(qLower));
          const compMatch = summaryInfo.competencies && summaryInfo.competencies.some(c => c.toLowerCase().includes(qLower));
          const examMatch = summaryInfo.examRelevance && summaryInfo.examRelevance.toLowerCase().includes(qLower);

          if (sumTitleMatch || sumTextMatch || topicMatch || keywordMatch || compMatch || examMatch) {
            deepMatch = true;
          }
        }
      }

      if (titleMatch || pathMatch || deepMatch) {
        matchedItems.push({
          ...item,
          matchedSummary: summaryInfo
        });
      }

      if (matchedItems.length >= 40) break; // Limit to top 40 matches
    }

    setResults(matchedItems);
  }, [query, filterType, catalog]);

  if (!isOpen) return null;

  const handleItemClick = (item) => {
    onClose();
    if (item.type === 'yt') {
      onOpenVideo({ id: item.ytId, title: item.title });
    } else if (item.type === 'blob') {
      onOpenPdf(item.path, item.title);
    }
  };

  return (
    <div className="ptm-modal-backdrop" onClick={onClose}>
      <div className="ptm-search-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Box */}
        <div className="search-modal-input-row">
          <Search size={20} className="search-modal-icon" />
          <input 
            type="text" 
            ref={inputRef}
            className="search-modal-input" 
            placeholder="Search 2,300+ lessons, PDFs, LKAS standards, or topics (e.g. උපචිත, PESTEL, 2023)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="btn-clear-query" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
          <kbd className="modal-esc-kbd" onClick={onClose}>ESC</kbd>
        </div>

        {/* Filter Chips */}
        <div className="search-filter-chips no-scrollbar">
          <button 
            className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Resources ({catalog.length})
          </button>
          <button 
            className={`filter-chip ${filterType === 'video' ? 'active' : ''}`}
            onClick={() => setFilterType('video')}
          >
            <Video size={13} /> Video Lectures
          </button>
          <button 
            className={`filter-chip ${filterType === 'paper' ? 'active' : ''}`}
            onClick={() => setFilterType('paper')}
          >
            <FileText size={13} /> Past Papers (2010–2026)
          </button>
          <button 
            className={`filter-chip ${filterType === 'note' ? 'active' : ''}`}
            onClick={() => setFilterType('note')}
          >
            <BookOpen size={13} /> Notes & A+ Guides
          </button>
        </div>

        {/* Search Results List */}
        <div className="search-results-list">
          {results.map((item, idx) => {
            let icon = <FileText size={18} className="text-gray-400" />;
            let badgeText = 'Resource';
            let badgeClass = 'badge-note';

            if (item.type === 'yt') {
              icon = <Video size={18} className="text-red-500" />;
              badgeText = 'YouTube Video';
              badgeClass = 'badge-yt';
            } else if (item.path?.includes('past-papers')) {
              icon = <FileText size={18} className="text-amber-500" />;
              badgeText = 'Past Exam Paper';
              badgeClass = 'badge-paper';
            } else if (item.path?.includes('master-guides')) {
              icon = <Sparkles size={18} className="text-indigo-400" />;
              badgeText = 'A+ Master Guide';
              badgeClass = 'badge-guide';
            } else if (item.isEthaksalawa || item.path?.includes('ethaksalawa')) {
              badgeText = 'e-Thaksalawa';
              badgeClass = 'badge-guide';
            }

            const displayTitle = item.matchedSummary ? item.matchedSummary.title : item.title;
            const snippet = item.matchedSummary?.summary;
            const topics = item.matchedSummary?.topics || [];

            return (
              <div 
                key={idx} 
                className="search-result-row"
                onClick={() => handleItemClick(item)}
              >
                <div className="res-icon-box">
                  {icon}
                </div>
                <div className="res-info">
                  <h4 className="res-title">{displayTitle}</h4>
                  {snippet && (
                    <p className="res-summary-snippet">
                      {snippet.length > 95 ? `${snippet.slice(0, 95)}...` : snippet}
                    </p>
                  )}
                  {topics.length > 0 && (
                    <div className="res-tags-strip">
                      {topics.slice(0, 3).map((t, tidx) => (
                        <span key={tidx} className="res-mini-tag">#{t}</span>
                      ))}
                    </div>
                  )}
                  <span className="res-path">{item.path}</span>
                </div>
                <div className="res-actions">
                  <span className={`res-badge ${badgeClass}`}>{badgeText}</span>
                  <ArrowRight size={16} className="text-gray-400" />
                </div>
              </div>
            );
          })}

          {query.trim() && results.length === 0 && (
            <div className="search-empty-state">
              <Search size={36} className="text-gray-500" />
              <p className="empty-title">No resources found matching "{query}"</p>
              <p className="empty-hint">Try searching for concepts like "උපචිත", "LKAS", "PESTEL", "PPC", "හවුල් ගිණුම්", or "2023".</p>
            </div>
          )}

          {!query.trim() && (
            <div className="search-placeholder-state">
              <Sparkles size={30} className="text-indigo-400" />
              <p className="placeholder-text">Search across 2,346+ video lessons, past papers, notes & LKAS standards.</p>
              <div className="search-suggestions-row no-scrollbar">
                <span className="sugg-tag" onClick={() => setQuery('ගිණුම්කරණ සංකල්ප')}>ගිණුම්කරණ සංකල්ප</span>
                <span className="sugg-tag" onClick={() => setQuery('LKAS')}>LKAS ප්‍රමිති</span>
                <span className="sugg-tag" onClick={() => setQuery('PESTEL')}>PESTEL පරිසරය</span>
                <span className="sugg-tag" onClick={() => setQuery('PPC')}>PPC වක්‍රය</span>
                <span className="sugg-tag" onClick={() => setQuery('හවුල් ගිණුම්')}>හවුල් ගිණුම්</span>
                <span className="sugg-tag" onClick={() => setQuery('සමච්ඡේද')}>සමච්ඡේද (BEP)</span>
                <span className="sugg-tag" onClick={() => setQuery('4Ps')}>4Ps අලෙවිකරණ</span>
                <span className="sugg-tag" onClick={() => setQuery('ජාතික ආදායම')}>ජාතික ආදායම (GDP)</span>
                <span className="sugg-tag" onClick={() => setQuery('2023')}>2023 Past Paper</span>
                <span className="sugg-tag" onClick={() => setQuery('ද්විත්ව සටහන්')}>ද්විත්ව සටහන්</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

