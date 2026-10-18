import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Video, 
  FileText, 
  Download, 
  ExternalLink, 
  Sparkles, 
  CalendarPlus, 
  Award, 
  HelpCircle, 
  Clock, 
  GitFork, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  Target, 
  GraduationCap,
  Play
} from 'lucide-react';
import { renderMarkdownWithMath } from '../utils/markdownRenderer';
import InteractiveMindMapModal from './InteractiveMindMapModal';
import UnitMCQExamView from './UnitMCQExamView';
import { getPdfSummary } from '../data/pdfSummaries';

export default function UnitDetailView({
  unit,
  subject,
  onBack,
  onPlayVideo,
  onOpenPdf,
  onOpenAITutor,
  onAddToPlanner
}) {
  // activeModule: null (Unit Overview Landing) | 'guide' | 'mindmap' | 'exam' | 'videos' | 'pdfs'
  const [activeModule, setActiveModule] = useState(null);
  const [guideContent, setGuideContent] = useState('');
  const [renderedGuideHtml, setRenderedGuideHtml] = useState('');
  const [isLoadingGuide, setIsLoadingGuide] = useState(true);
  const [pdfFilter, setPdfFilter] = useState('all'); // 'all' | 'ethaksalawa' | 'handouts' | 'interactive'
  const [isMindMapOpen, setIsMindMapOpen] = useState(false);
  const [expandedPdfSummaries, setExpandedPdfSummaries] = useState({});

  // Fetch Master Guide Markdown Content & Render with KaTeX
  useEffect(() => {
    let isMounted = true;
    setIsLoadingGuide(true);
    
    const rawPath = unit.guidePath || `notes/${subject.id}/master-guides/unit-${String(unit.unitNumber).padStart(2, '0')}.md`;
    const cleanGuidePath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    
    fetch(cleanGuidePath)
      .then(res => {
        if (!res.ok) throw new Error('Note not found');
        return res.text();
      })
      .then(text => {
        if (isMounted) {
          setGuideContent(text);
          const html = renderMarkdownWithMath(text);
          setRenderedGuideHtml(html);
          setIsLoadingGuide(false);
        }
      })
      .catch(() => {
        const altPath = `/notes/${subject.id}/unit-${String(unit.unitNumber).padStart(2, '0')}.md`;
        fetch(altPath)
          .then(res => res.ok ? res.text() : Promise.reject())
          .then(text => {
            if (isMounted) {
              setGuideContent(text);
              setRenderedGuideHtml(renderMarkdownWithMath(text));
              setIsLoadingGuide(false);
            }
          })
          .catch(() => {
            if (isMounted) {
              const fallbackText = `# ${unit.title}\n> **PTM Prime Master Study Guide | Unit ${unit.unitNumber}**\n\nStudy resources, downloadable e-Thaksalawa lesson notes, and video lectures are available in the dedicated modules.`;
              setGuideContent(fallbackText);
              setRenderedGuideHtml(renderMarkdownWithMath(fallbackText));
              setIsLoadingGuide(false);
            }
          });
      });

    return () => { isMounted = false; };
  }, [unit, subject]);

  const togglePdfSummary = (idx) => {
    setExpandedPdfSummaries(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Filter out any non-Sinhala files (English and Tamil excluded)
  const isSinhalaFile = (p) => {
    const s = ((p.path || '') + ' ' + (p.title || '')).toLowerCase();
    return !s.includes('english') && !s.includes('tamil');
  };

  const sinhalaPdfs = (unit.pdfs || []).filter(isSinhalaFile);
  const ethaksalawaPdfs = sinhalaPdfs.filter(p => p.isEthaksalawa);
  const standardPdfs = sinhalaPdfs.filter(p => !p.isEthaksalawa);
  const interactiveActivities = unit.interactiveActivities || [];

  const getFilteredPdfs = () => {
    if (pdfFilter === 'ethaksalawa') return ethaksalawaPdfs;
    if (pdfFilter === 'handouts') return standardPdfs;
    if (pdfFilter === 'interactive') return [];
    return sinhalaPdfs;
  };

  const displayedPdfs = getFilteredPdfs();

  const handleSelectModule = (moduleKey) => {
    setActiveModule(moduleKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const moduleShortNames = {
    guide: 'A+ Study Guide',
    mindmap: 'Concept Mind Map',
    exam: '50 MCQ Exam',
    videos: 'Video Lectures',
    pdfs: 'Official Notes'
  };

  const moduleNames = {
    guide: 'A+ Study Guide (සිද්ධාන්ත නෝට්)',
    mindmap: 'Concept Mind Map (D3 මනෝ සිතියම)',
    exam: '50 MCQ Exam (අහඹු ප්‍රශ්නාවලිය)',
    videos: 'Video Lectures (වීඩියෝ දේශන)',
    pdfs: 'Official Notes (නිල සටහන්)'
  };

  return (
    <div className="ptm-unit-detail-view animate-fade-in">
      {/* ========================================================
          PAGE 1: UNIT OVERVIEW LANDING (Hero Card Only)
      ======================================================== */}
      {activeModule === null && (
        <div className="unit-overview-landing">
          {/* Top Navigation Breadcrumb */}
          <div className="ptm-view-nav">
            <button className="btn-back" onClick={onBack}>
              <ArrowLeft size={16} /> Back to {subject.name}
            </button>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">Unit {String(unit.unitNumber).padStart(2, '0')}</span>
          </div>

          {/* Unit Header Hero Card */}
          <div className="unit-header-hero">
            <div className="unit-header-badge-row">
              <span className="unit-number-pill">Unit {String(unit.unitNumber).padStart(2, '0')}</span>
              <span className="subject-tag-pill">{subject.name}</span>
              <span className="guide-status-pill">
                <Sparkles size={12} className="text-amber-400" /> A+ Master Learning Suite
              </span>
            </div>

            <h1 className="unit-header-title">{unit.title}</h1>
            <h2 className="unit-header-subtitle">{unit.englishTitle}</h2>

            <p className="unit-hero-desc">
              මෙම ඒකකයට අදාළ A+ සිද්ධාන්ත නෝට්, අන්තර්ක්‍රියාකාරී D3 Mind Map, ප්‍රශ්න 50ක අහඹු MCQ විභාගය, වීඩියෝ දේශන සහ නිල e-Thaksalawa සටහන් අධ්‍යයනය සඳහා පහත මොඩියුලයක් තෝරන්න:
            </p>

            {/* 5 Distinct Modern Module Destination Cards */}
            <div className="unit-module-cards-grid">
              {/* 1. A+ Study Guide */}
              <button 
                className="unit-nav-card-btn guide-card"
                onClick={() => handleSelectModule('guide')}
              >
                <div className="module-btn-icon icon-guide">
                  <BookOpen size={20} />
                </div>
                <div className="module-btn-text">
                  <span className="module-main-title">A+ Study Guide</span>
                  <span className="module-sub-title">සිද්ධාන්ත නෝට් (.md)</span>
                </div>
                <ChevronRight size={18} className="module-btn-arrow" />
              </button>

              {/* 2. Concept Mind Map */}
              <button 
                className="unit-nav-card-btn mindmap-card"
                onClick={() => handleSelectModule('mindmap')}
              >
                <div className="module-btn-icon icon-mindmap">
                  <GitFork size={20} className="text-emerald-400" />
                </div>
                <div className="module-btn-text">
                  <span className="module-main-title">Concept Mind Map</span>
                  <span className="module-sub-title">D3 මනෝ සිතියම</span>
                </div>
                <ChevronRight size={18} className="module-btn-arrow" />
              </button>

              {/* 3. 50 MCQ Exam Practice */}
              <button 
                className="unit-nav-card-btn exam-card"
                onClick={() => handleSelectModule('exam')}
              >
                <div className="module-btn-icon icon-mcq">
                  <HelpCircle size={20} className="text-amber-400" />
                </div>
                <div className="module-btn-text">
                  <span className="module-main-title">50 MCQ Exam</span>
                  <span className="module-sub-title">අහඹු ප්‍රශ්නාවලිය (50 MCQs)</span>
                </div>
                <ChevronRight size={18} className="module-btn-arrow" />
              </button>

              {/* 4. Video Lectures */}
              <button 
                className="unit-nav-card-btn video-card"
                onClick={() => handleSelectModule('videos')}
              >
                <div className="module-btn-icon icon-video">
                  <Video size={20} />
                </div>
                <div className="module-btn-text">
                  <span className="module-main-title">Video Lectures</span>
                  <span className="module-sub-title">{unit.videoCount || unit.videos?.length || 0} දේශන ආවරණය</span>
                </div>
                <ChevronRight size={18} className="module-btn-arrow" />
              </button>

              {/* 5. Official Notes & Handouts */}
              <button 
                className="unit-nav-card-btn pdf-card"
                onClick={() => handleSelectModule('pdfs')}
              >
                <div className="module-btn-icon icon-pdf">
                  <FileText size={20} />
                </div>
                <div className="module-btn-text">
                  <span className="module-main-title">Official Notes</span>
                  <span className="module-sub-title">{sinhalaPdfs.length} නිල සටහන් & e-Thaksalawa</span>
                </div>
                <ChevronRight size={18} className="module-btn-arrow" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PAGE 2+: DEDICATED MODULE PAGES (Hero Card is HIDDEN!)
      ======================================================== */}
      {activeModule !== null && (
        <div className="dedicated-module-page animate-fade-in">
          {/* Top Sub-Page Navigation Bar */}
          <div className="ptm-view-nav dedicated-page-nav">
            <button className="btn-back" onClick={() => setActiveModule(null)} title="Click to go back to Unit Overview">
              <ArrowLeft size={14} /> Back to Unit {String(unit.unitNumber).padStart(2, '0')}
            </button>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{moduleShortNames[activeModule] || activeModule}</span>
          </div>

          {/* DEDICATED MODULE 1: A+ Master Study Guide */}
          {activeModule === 'guide' && (
            <div className="unit-tab-pane guide-pane">
              <div className="note-clean-header">
                <div className="note-clean-title-group">
                  <span className="note-clean-badge">
                    <BookOpen size={15} /> A+ Master Study Guide
                  </span>
                  <h2 className="dedicated-module-heading">{unit.title}</h2>
                </div>
                <button 
                  className="btn-add-planner-clean"
                  onClick={() => onAddToPlanner({
                    title: `${subject.name}: Master Unit ${unit.unitNumber} (${unit.title})`,
                    subject: subject.name,
                    priority: 'high'
                  })}
                  title="Add to Study Planner"
                >
                  <CalendarPlus size={15} />
                  <span>Add to Planner</span>
                </button>
              </div>

              <div className="master-note-card">
                {isLoadingGuide ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading study note...</p>
                  </div>
                ) : (
                  <div 
                    className="markdown-body ptm-note-content"
                    dangerouslySetInnerHTML={{ __html: renderedGuideHtml }}
                  />
                )}
              </div>
            </div>
          )}

          {/* DEDICATED MODULE 2: Concept Mind Map */}
          {activeModule === 'mindmap' && (
            <div className="unit-tab-pane mindmap-pane">
              <div className="dedicated-page-header mindmap-header-bg">
                <div className="dedicated-header-left">
                  <span className="header-meta-pill emerald">
                    <GitFork size={13} /> D3 Visual Concept Tree
                  </span>
                  <h2 className="dedicated-page-title">{unit.title} — Concept Mind Map</h2>
                  <p className="dedicated-page-sub">
                    විෂය නිර්දේශයේ සංකල්ප අතර සම්බන්ධතා, සූත්‍ර සහ වර්ගීකරණයන් දෘශ්‍යමානව අධ්‍යයනය කරන්න.
                  </p>
                </div>
                <div className="dedicated-header-badge-box">
                  <button 
                    className="btn-launch-mindmap-fullscreen"
                    onClick={() => setIsMindMapOpen(true)}
                  >
                    <Sparkles size={14} /> Fullscreen Interactive Explorer
                  </button>
                </div>
              </div>

              {/* Directly accessible interactive modal/canvas */}
              <InteractiveMindMapModal 
                unit={unit}
                subject={subject}
                guideContent={guideContent}
                onClose={() => setActiveModule(null)}
                onOpenStudyGuide={() => setActiveModule('guide')}
              />
            </div>
          )}

          {/* DEDICATED MODULE 3: 50 MCQ Examination Practice */}
          {activeModule === 'exam' && (
            <div className="unit-tab-pane exam-pane">
              <UnitMCQExamView 
                unit={unit}
                subject={subject}
                onBackToGuide={() => setActiveModule(null)}
              />
            </div>
          )}

          {/* DEDICATED MODULE 4: Video Lectures Archive */}
          {activeModule === 'videos' && (
            <div className="unit-tab-pane videos-pane">
              <div className="dedicated-page-header videos-header-bg">
                <div className="dedicated-header-left">
                  <span className="header-meta-pill rose">
                    <Video size={13} /> Official DP Education Playlists
                  </span>
                  <h2 className="dedicated-page-title">{unit.title} — Video Lectures</h2>
                  <p className="dedicated-page-sub">
                    100% සම්පූර්ණ විෂය නිර්දේශය ආවරණය වන පරිදි පෙළගස්වන ලද වීඩියෝ දේශන.
                  </p>
                </div>
                <div className="dedicated-header-badge-box">
                  <span className="videos-count-badge-large">{unit.videos?.length || 0} Lectures Available</span>
                  <span className="badge-subtitle">Verified Sri Lankan Teachers</span>
                </div>
              </div>

              <div className="unit-videos-grid">
                {(unit.videos || []).map((vid, idx) => (
                  <div 
                    key={idx} 
                    className="unit-video-card"
                    onClick={() => onPlayVideo(vid)}
                  >
                    <div className="unit-thumb-box">
                      <img 
                        src={`https://img.youtube.com/vi/${vid.id}/hqdefault.jpg`} 
                        alt={vid.title} 
                        className="unit-video-thumb"
                        loading="lazy"
                      />
                      <div className="unit-play-overlay">
                        <div className="unit-play-btn">
                          <Play size={22} fill="#ffffff" color="#ffffff" />
                        </div>
                      </div>
                      <span className="unit-video-tag">Part {idx + 1}</span>
                    </div>
                    <div className="unit-video-info">
                      <h4 className="unit-video-title">{vid.title}</h4>
                    </div>
                  </div>
                ))}

                {(!unit.videos || unit.videos.length === 0) && (
                  <div className="empty-state-card">
                    <Video size={40} className="text-gray-400" />
                    <p>No video lectures cataloged for this specific sub-unit yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DEDICATED MODULE 5: Official Notes & Handouts */}
          {activeModule === 'pdfs' && (
            <div className="unit-tab-pane pdfs-pane">
              <div className="dedicated-page-header pdfs-header-bg">
                <div className="dedicated-header-left">
                  <span className="header-meta-pill purple">
                    <FileText size={13} /> Ministry of Education & e-Thaksalawa
                  </span>
                  <h2 className="dedicated-page-title">{unit.title} — Official Notes</h2>
                  <p className="dedicated-page-sub">
                    නිල අමාත්‍යාංශ සටහන්, e-Thaksalawa අත්පොත් සහ විෂය නිර්දේශානුකූල කෙටි සටහන්.
                  </p>
                </div>
                <div className="dedicated-header-badge-box">
                  <span className="notes-count-badge-large">{sinhalaPdfs.length} Notes Available</span>
                  <span className="badge-subtitle">100% Sinhala Medium</span>
                </div>
              </div>

              {/* Sub-Filters */}
              <div className="pdf-filter-bar">
                <button 
                  className={`filter-pill-btn ${pdfFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setPdfFilter('all')}
                >
                  All Notes ({sinhalaPdfs.length})
                </button>
                {ethaksalawaPdfs.length > 0 && (
                  <button 
                    className={`filter-pill-btn ethak ${pdfFilter === 'ethaksalawa' ? 'active' : ''}`}
                    onClick={() => setPdfFilter('ethaksalawa')}
                  >
                    <Award size={14} /> e-Thaksalawa ({ethaksalawaPdfs.length})
                  </button>
                )}
                {standardPdfs.length > 0 && (
                  <button 
                    className={`filter-pill-btn ${pdfFilter === 'handouts' ? 'active' : ''}`}
                    onClick={() => setPdfFilter('handouts')}
                  >
                    <FileText size={14} /> Short Notes & Handouts ({standardPdfs.length})
                  </button>
                )}
              </div>

              {/* PDF Files List */}
              <div className="unit-pdfs-list">
                {displayedPdfs.map((pdf, idx) => {
                  const summaryInfo = getPdfSummary(pdf, { unit, subject });
                  const isSummaryOpen = !!expandedPdfSummaries[idx];

                  return (
                    <div key={idx} className={`pdf-item-wrapper ${pdf.isEthaksalawa ? 'is-ethaksalawa' : ''}`}>
                      <div className="pdf-item-row">
                        <div className="pdf-main-info">
                          <div className="pdf-icon-box">
                            <FileText size={18} className={pdf.isEthaksalawa ? 'text-emerald-400' : 'text-indigo-400'} />
                          </div>
                          <div className="pdf-info">
                            <div className="pdf-title-row">
                              <h4 className="pdf-title">{pdf.title}</h4>
                              {pdf.isEthaksalawa && (
                                <span className="ethak-badge">e-Thaksalawa</span>
                              )}
                            </div>
                            <div className="pdf-meta-row">
                              <span className="pdf-size">
                                {pdf.size ? `${(pdf.size / 1024 / 1024).toFixed(1)} MB` : 'PDF'}
                              </span>
                              {pdf.isEthaksalawa ? (
                                <span className="verified-dot">• නිල අත්පොත</span>
                              ) : (
                                <span className="verified-dot">• විෂය සටහන</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pdf-actions">
                          {/* Toggle Summary Button */}
                          <button 
                            className={`btn-toggle-summary ${isSummaryOpen ? 'active' : ''}`}
                            onClick={() => togglePdfSummary(idx)}
                            title="View Syllabus Summary before opening"
                          >
                            <Info size={13} />
                            <span>{isSummaryOpen ? 'Hide' : 'Summary'}</span>
                            {isSummaryOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>

                          <button 
                            className="btn-view-pdf"
                            onClick={() => {
                              if (pdf.path && pdf.path.toLowerCase().endsWith('.md')) {
                                handleSelectModule('guide');
                              } else {
                                onOpenPdf(pdf.path, pdf.title);
                              }
                            }}
                          >
                            View in App
                          </button>
                          <a 
                            href={`/${pdf.path}`} 
                            download 
                            className="btn-download-pdf"
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </a>
                          {pdf.sourceUrl && (
                            <a 
                              href={pdf.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn-external-link"
                              title="View on e-Thaksalawa Portal"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Expandable Syllabus Intelligence Box */}
                      {isSummaryOpen && summaryInfo && (
                        <div className="pdf-summary-dropdown">
                          <div className="summary-section-header">
                            <Sparkles size={15} className="text-amber-400" />
                            <h5>ලේඛනයේ සාරාංශය සහ විෂය නිර්දේශ ආවරණය</h5>
                          </div>

                          <p className="summary-desc-text">{summaryInfo.summary}</p>

                          {/* Syllabus Key Concepts Tags */}
                          {summaryInfo.topics && summaryInfo.topics.length > 0 && (
                            <div className="summary-topics-strip">
                              {summaryInfo.topics.map((t, tidx) => (
                                <span key={tidx} className="summary-topic-tag">#{t}</span>
                              ))}
                            </div>
                          )}

                          <div className="summary-meta-grid">
                            <div className="summary-meta-card">
                              <span className="meta-card-title"><Target size={13} className="text-emerald-400" /> ඉලක්කගත නිපුණතා:</span>
                              <ul className="meta-list">
                                {(summaryInfo.competencies || []).map((c, cIdx) => (
                                  <li key={cIdx}>{c}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="summary-meta-card">
                              <span className="meta-card-title"><GraduationCap size={14} className="text-indigo-400" /> A/L විභාග වැදගත්කම:</span>
                              <p className="meta-card-val">{summaryInfo.examRelevance}</p>
                              
                              <div className="sub-meta-row mt-2">
                                <span className="sub-tag">📄 {summaryInfo.docType}</span>
                                <span className="sub-tag">⏱️ {summaryInfo.pages}</span>
                                <span className="sub-tag difficulty">🎯 {summaryInfo.difficulty}</span>
                              </div>
                            </div>
                          </div>

                          <div className="summary-footer-actions">
                            <button 
                              className="btn-open-from-summary"
                              onClick={() => onOpenPdf(pdf.path, pdf.title)}
                            >
                              Open this PDF in App
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {displayedPdfs.length === 0 && (
                  <div className="empty-state-card">
                    <FileText size={40} className="text-gray-400" />
                    <p>No files in this category. Select "All Notes" to view available materials.</p>
                  </div>
                )}
              </div>

              {/* Interactive H5P Activities from e-Thaksalawa */}
              {(pdfFilter === 'interactive' || (pdfFilter === 'all' && interactiveActivities.length > 0)) && (
                <div className="interactive-activities-section">
                  <div className="sub-section-header">
                    <Sparkles size={18} className="text-amber-400" />
                    <h4>MOE Official Interactive Activities & Online Quizzes</h4>
                  </div>
                  <div className="interactive-grid">
                    {interactiveActivities.map((act, idx) => (
                      <div key={idx} className="interactive-card">
                        <div className="interactive-card-top">
                          <span className="activity-type-pill">e-Thaksalawa LMS</span>
                          <Sparkles size={15} className="text-amber-400" />
                        </div>
                        <h5 className="interactive-title">{act.title}</h5>
                        <p className="interactive-desc">Official interactive practice module from Ministry of Education.</p>
                        <a 
                          href={act.sourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-launch-activity"
                        >
                          <ExternalLink size={15} /> Launch Activity on e-Thaksalawa
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Interactive Mind Map Modal (if triggered directly from button) */}
      {isMindMapOpen && (
        <InteractiveMindMapModal 
          unit={unit}
          subject={subject}
          guideContent={guideContent}
          onClose={() => setIsMindMapOpen(false)}
          onOpenStudyGuide={() => handleSelectModule('guide')}
        />
      )}
    </div>
  );
}
