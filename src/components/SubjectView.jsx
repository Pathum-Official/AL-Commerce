import React, { useState } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Video, 
  FileText, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight,
  Search,
  Eye,
  Layers
} from 'lucide-react';
import { CURRICULUM_DATA } from '../data/curriculumData';

export default function SubjectView({
  subjectId,
  onBack,
  onSelectUnit,
  onOpenPdf,
  catalog = []
}) {
  const subject = CURRICULUM_DATA[subjectId] || CURRICULUM_DATA.accounting;
  const units = subject.units || [];

  // Segmented State: null (initial card view only) | 'units' | 'papers'
  const [activeSection, setActiveSection] = useState(null);
  const [selectedYear, setSelectedYear] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Subject-level master files
  const syllabusPath = `syllabuses/${subjectId}-syllabus.pdf`;
  const fullBookPath = subjectId === 'accounting' 
    ? 'notes/accounting/short-notes/accounting-full-short-note.pdf'
    : (subjectId === 'business-studies' 
        ? 'notes/business-studies/short-notes/bs-full-short-note.pdf'
        : 'notes/economics/short-notes/econ-full-short-note.pdf');

  // Extract all Sinhala past papers for this specific subject (EXCLUDE English & Tamil)
  const subjectPapers = (catalog || []).filter(item => {
    if (item.type !== 'blob' || !item.path?.includes('past-papers')) return false;
    if (!item.path.includes(`/${subjectId}/`)) return false;
    const p = item.path.toLowerCase();
    // 100% Sinhala Medium only
    if (p.includes('english') || p.includes('tamil')) return false;
    return true;
  });

  // Filter papers by Year and Search Query
  const displayedPapers = subjectPapers.filter(item => {
    const p = item.path.toLowerCase();
    if (selectedYear !== 'all' && !p.includes(selectedYear)) return false;
    if (searchQuery && !p.includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const years = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010'];

  // Helper to format paper title cleanly
  const formatPaperTitle = (path) => {
    const filename = path.split('/').pop().replace('.pdf', '');
    const yearMatch = filename.match(/20\d\d/);
    const year = yearMatch ? yearMatch[0] : '';
    const isMarking = filename.includes('scheme') || filename.includes('marking') || filename.includes('marking-scheme');

    const docType = isMarking ? 'නිල ලකුණු දීමේ පටිපාටිය (Marking Scheme)' : 'විභාග ප්‍රශ්න පත්‍රය (Exam Paper)';

    return {
      title: `${year} G.C.E. A/L ${subject.name} - ${docType}`,
      year: year || 'A/L',
      isMarking,
      filename
    };
  };

  const handleToggleSection = (section) => {
    setActiveSection(prev => prev === section ? null : section);
    setTimeout(() => {
      document.getElementById('subject-content-view')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="ptm-subject-view">
      {/* ========================================================
          PAGE 1: SUBJECT OVERVIEW LANDING (Hero Card Only)
      ======================================================== */}
      {activeSection === null && (
        <div className="subject-overview-landing animate-fade-in">
          {/* Top Breadcrumb & Back Action */}
          <div className="ptm-view-nav">
            <button className="btn-back" onClick={onBack}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">{subject.name} ({subject.sinhalaName})</span>
          </div>

          {/* Subject Header Banner */}
          <div className={`subject-hero-card ${subjectId}`}>
            <div className="subject-hero-content">
              <span className="subject-tag">G.C.E. A/L COMMERCE SUITE</span>
              <h1 className="subject-main-title">{subject.name}</h1>
              <h2 className="subject-sinhala-title">{subject.sinhalaName}</h2>
              <p className="subject-desc-full">{subject.description}</p>
              
              {/* Premium 5 Quick Subject Action Buttons */}
              <div className="subject-action-bar modern-grid">
                {/* 1. Official Syllabus PDF */}
                <button 
                  className="sub-action-btn modern-card-btn syllabus-pdf-btn"
                  onClick={() => onOpenPdf(syllabusPath, `${subject.name} Official Syllabus`)}
                >
                  <div className="btn-icon-bubble blue">
                    <Download size={16} />
                  </div>
                  <div className="btn-text-col">
                    <span className="btn-primary-label">Official Syllabus PDF</span>
                    <span className="btn-sub-label">NIE Curriculum Standard</span>
                  </div>
                </button>

                {/* 2. Complete Revision Book */}
                <button 
                  className="sub-action-btn modern-card-btn revision-book-btn"
                  onClick={() => onOpenPdf(fullBookPath, `${subject.name} Full Revision Textbook`)}
                >
                  <div className="btn-icon-bubble white">
                    <BookOpen size={16} />
                  </div>
                  <div className="btn-text-col">
                    <span className="btn-primary-label">Complete Revision Book</span>
                    <span className="btn-sub-label">370+ Pages Comprehensive</span>
                  </div>
                </button>

                {/* 3. 2026 Complete Resource Guide */}
                {subject.resourceGuide && (
                  <button 
                    className="sub-action-btn modern-card-btn resource-guide-btn"
                    onClick={() => onOpenPdf(subject.resourceGuide, `${subject.name} 2026 Complete Resource Guide`)}
                  >
                    <div className="btn-icon-bubble gold">
                      <Sparkles size={16} />
                    </div>
                    <div className="btn-text-col">
                      <span className="btn-primary-label">2026 Complete Resource Guide</span>
                      <span className="btn-sub-label">Master Theory Notes</span>
                    </div>
                  </button>
                )}

                {/* 4. Units & Lessons Dedicated Page Button */}
                <button 
                  className="sub-action-btn modern-card-btn units-nav-card-btn"
                  onClick={() => {
                    setActiveSection('units');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="btn-icon-bubble violet">
                    <Layers size={17} />
                  </div>
                  <div className="btn-text-col">
                    <div className="btn-label-with-badge">
                      <span className="btn-primary-label">විෂය නිර්දේශ ඒකක සහ පාඩම්</span>
                      <span className="btn-count-tag violet">({units.length})</span>
                    </div>
                    <span className="btn-sub-label">සම්පූර්ණ පාඩම් 16 සහ A+ Study Guides</span>
                  </div>
                  <ChevronRight size={18} className="btn-arrow-right" />
                </button>

                {/* 5. Past Papers Dedicated Page Button */}
                <button 
                  className="sub-action-btn modern-card-btn papers-nav-card-btn"
                  onClick={() => {
                    setActiveSection('papers');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="btn-icon-bubble emerald">
                    <FileText size={17} />
                  </div>
                  <div className="btn-text-col">
                    <div className="btn-label-with-badge">
                      <span className="btn-primary-label">පසුගිය විභාග ප්‍රශ්න පත්‍ර සහ Marking Schemes</span>
                      <span className="btn-count-tag emerald">({subjectPapers.length})</span>
                    </div>
                    <span className="btn-sub-label">නිල ප්‍රශ්න පත්‍ර සහ ලකුණු දීමේ පටිපාටි</span>
                  </div>
                  <ChevronRight size={18} className="btn-arrow-right" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          PAGE 2: DEDICATED UNITS PAGE (Hero Card is Hidden!)
      ======================================================== */}
      {activeSection === 'units' && (
        <div className="dedicated-page-container animate-fade-in">
          {/* Top Navigation & Breadcrumb */}
          <div className="ptm-view-nav dedicated-page-nav">
            <button className="btn-back" onClick={() => setActiveSection(null)} title="Click to go back">
              <ArrowLeft size={14} /> Back to {subject.name}
            </button>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">විෂය නිර්දේශ ඒකක ({units.length})</span>
          </div>

          {/* Dedicated Units Page Header */}
          <div className="dedicated-page-header units-header-bg">
            <div className="dedicated-header-left">
              <span className="header-meta-pill violet">
                <BookOpen size={13} /> G.C.E. A/L {subject.name}
              </span>
              <h2 className="dedicated-page-title">විෂය නිර්දේශ ඒකක සහ පාඩම් (Syllabus Units)</h2>
              <p className="dedicated-page-sub">
                ඕනෑම ඒකකයක් තෝරා එම ඒකකයේ සම්පූර්ණ සිද්ධාන්ත නෝට්, D3 Mind Map, ප්‍රශ්න 50 MCQ විභාගය සහ වීඩියෝ දේශන අධ්‍යයනය කරන්න.
              </p>
            </div>
            <div className="dedicated-header-badge-box">
              <span className="units-count-badge-large">{units.length} Units Complete</span>
              <span className="badge-subtitle">100% NIE Curriculum Aligned</span>
            </div>
          </div>

          {/* Units Grid */}
          <div className="units-grid">
            {units.map((unit) => (
              <div 
                key={unit.unitNumber} 
                className="unit-card"
                onClick={() => onSelectUnit(unit)}
              >
                <div className="unit-card-header">
                  <span className="unit-number-pill">Unit {String(unit.unitNumber).padStart(2, '0')}</span>
                  <span className="guide-status-pill">
                    <Sparkles size={12} className="text-amber-400" /> A+ Master Guide
                  </span>
                </div>

                <h4 className="unit-title-sinhala">{unit.title}</h4>
                <p className="unit-title-en">{unit.englishTitle}</p>

                <div className="unit-meta-row">
                  <span className="unit-meta-pill" title="Video Lectures">
                    <Video size={13} /> {unit.videoCount || unit.videos?.length || 0} Videos
                  </span>
                  <span className="unit-meta-pill" title="PDF Documents">
                    <FileText size={13} /> {unit.pdfCount || unit.pdfs?.length || 0} Notes
                  </span>
                  <span className="unit-meta-pill verified" title="Syllabus Verified">
                    <CheckCircle2 size={13} /> 100% Theory
                  </span>
                </div>

                <div className="unit-card-footer">
                  <span className="btn-open-unit">
                    Open Unit Hub <ChevronRight size={15} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          PAGE 3: DEDICATED PAST PAPERS PAGE (Hero Card is Hidden!)
      ======================================================== */}
      {activeSection === 'papers' && (
        <div className="dedicated-page-container animate-fade-in">
          {/* Top Navigation & Breadcrumb */}
          <div className="ptm-view-nav dedicated-page-nav">
            <button className="btn-back" onClick={() => setActiveSection(null)} title="Click to go back">
              <ArrowLeft size={14} /> Back to {subject.name}
            </button>
            <span className="crumb-sep">/</span>
            <span className="crumb-current">පසුගිය ප්‍රශ්න පත්‍ර ({subjectPapers.length})</span>
          </div>

          {/* Dedicated Past Papers Page Header */}
          <div className="dedicated-page-header papers-header-bg">
            <div className="dedicated-header-left">
              <span className="header-meta-pill emerald">
                <FileText size={13} /> G.C.E. A/L {subject.name} Archive
              </span>
              <h2 className="dedicated-page-title">{subject.name} පසුගිය විභාග ප්‍රශ්න පත්‍ර සහ Marking Schemes</h2>
              <p className="dedicated-page-sub">
                2010 සිට 2026 දක්වා නිල විභාග දෙපාර්තමේන්තු සිංහල මාධ්‍ය ප්‍රශ්න පත්‍ර සහ නිල Marking Schemes.
              </p>
            </div>
            <div className="dedicated-header-badge-box">
              <span className="papers-count-badge-large">{displayedPapers.length} Papers Available</span>
              <span className="badge-subtitle">Department of Examinations</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="subject-papers-filter-bar">
            <div className="filter-item-search">
              <Search size={15} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search paper (e.g. 2023, scheme)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="paper-search-input"
              />
            </div>

            <div className="filter-dropdown-row">
              <div className="filter-select-group">
                <span className="filter-label">Year (වර්ෂය):</span>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="paper-select"
                >
                  <option value="all">All Years (2010 - 2026)</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Papers Grid */}
          <div className="subject-papers-grid">
            {displayedPapers.map((paper, idx) => {
              const meta = formatPaperTitle(paper.path);
              return (
                <div key={idx} className="subject-paper-card">
                  <div className="paper-card-top">
                    <span className="paper-year-badge">{meta.year} A/L</span>
                    <span className={`paper-type-badge ${meta.isMarking ? 'marking' : 'paper'}`}>
                      {meta.isMarking ? 'Marking Scheme' : 'Exam Paper'}
                    </span>
                    <span className="paper-medium-badge">සිංහල මාධ්‍යය</span>
                  </div>

                  <h4 className="paper-card-title">{meta.title}</h4>
                  <p className="paper-filename">{meta.filename}.pdf</p>

                  <div className="paper-card-actions">
                    <button 
                      className="btn-paper-action preview"
                      onClick={() => onOpenPdf(paper.path, meta.title)}
                      title="View PDF directly in PTM Prime Reader"
                    >
                      <Eye size={14} /> <span>View in App</span>
                    </button>
                    <a 
                      href={`/${paper.path}`} 
                      download 
                      className="btn-paper-action download"
                      title="Download PDF to device"
                    >
                      <Download size={14} /> <span>Download</span>
                    </a>
                  </div>
                </div>
              );
            })}

            {displayedPapers.length === 0 && (
              <div className="empty-papers-card">
                <FileText size={38} className="text-gray-400" />
                <p>තෝරාගත් නිර්ණායක යටතේ ප්‍රශ්න පත්‍ර හමු නොවීය. වෙනත් වර්ෂයක් තෝරා බලන්න.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
