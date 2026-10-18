import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  CheckCircle2, 
  ArrowLeft,
  Calendar,
  Languages
} from 'lucide-react';

export default function PastPapersView({
  catalog = [],
  onOpenPdf,
  onBack
}) {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedMedium, setSelectedMedium] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  // Filter past papers from catalog
  const pastPapers = catalog.filter(item => {
    if (item.type !== 'blob' || !item.path?.includes('past-papers')) return false;

    if (selectedSubject !== 'all' && !item.path.includes(`/${selectedSubject}/`)) return false;

    if (selectedMedium === 'english' && !item.path.includes('/english/')) return false;
    if (selectedMedium === 'tamil' && !item.path.includes('/tamil/')) return false;
    if (selectedMedium === 'sinhala' && (item.path.includes('/english/') || item.path.includes('/tamil/'))) return false;

    if (selectedYear !== 'all' && !item.path.includes(selectedYear)) return false;

    return true;
  });

  const years = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010'];

  return (
    <div className="ptm-pastpapers-view">
      {/* View Header */}
      <div className="ptm-view-nav">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">Past Examination Papers Archive (2010 - 2026)</span>
      </div>

      <div className="papers-hero-card">
        <span className="papers-tag">OFFICIAL EXAMINATION ARCHIVE</span>
        <h1 className="papers-hero-title">A/L Commerce Past Papers & Marking Schemes</h1>
        <p className="papers-hero-sub">
          Complete 16-year repository of official Department of Examinations G.C.E. A/L question papers and marking schemes in Sinhala, English, and Tamil mediums.
        </p>

        {/* Filter Controls Row */}
        <div className="papers-filter-bar">
          <div className="filter-group">
            <span className="filter-label">Subject:</span>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Subjects (සියලුම විෂයයන්)</option>
              <option value="accounting">Accounting (ගිණුම්කරණය)</option>
              <option value="business-studies">Business Studies (ව්‍යාපාර අධ්‍යයනය)</option>
              <option value="economics">Economics (ආර්ථික විද්‍යාව)</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Medium:</span>
            <select 
              value={selectedMedium} 
              onChange={(e) => setSelectedMedium(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Mediums</option>
              <option value="sinhala">Sinhala Medium</option>
              <option value="english">English Medium</option>
              <option value="tamil">Tamil Medium</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Year:</span>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Years (2010 - 2026)</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="papers-results-header">
        <div>
          <h3 className="results-count-title">{pastPapers.length} Question Papers & Marking Schemes Available</h3>
          <p className="results-count-sub">Click 'View in App' to practice directly, or download the official PDF.</p>
        </div>
      </div>

      {/* Papers Grid */}
      <div className="papers-grid">
        {pastPapers.map((paper, idx) => {
          const isMarking = paper.path.includes('marking');
          const isEnglish = paper.path.includes('/english/');
          const isTamil = paper.path.includes('/tamil/');
          const mediumTag = isEnglish ? 'English' : (isTamil ? 'Tamil' : 'Sinhala');

          let subjectBadge = 'Accounting';
          let badgeColor = 'bg-indigo';
          if (paper.path.includes('business-studies')) {
            subjectBadge = 'Business Studies';
            badgeColor = 'bg-pink';
          } else if (paper.path.includes('economics')) {
            subjectBadge = 'Economics';
            badgeColor = 'bg-emerald';
          }

          return (
            <div key={idx} className="paper-card">
              <div className="paper-card-top">
                <span className={`paper-sub-pill ${badgeColor}`}>{subjectBadge}</span>
                <span className="paper-medium-pill">{mediumTag}</span>
              </div>

              <h4 className="paper-title">{paper.title}</h4>

              <div className="paper-type-row">
                <span className={`paper-badge ${isMarking ? 'scheme' : 'question'}`}>
                  {isMarking ? 'Official Marking Scheme' : 'Examination Question Paper'}
                </span>
                {paper.size > 0 && (
                  <span className="paper-size">{(paper.size / 1024 / 1024).toFixed(1)} MB</span>
                )}
              </div>

              <div className="paper-actions">
                <button 
                  className="btn-view-paper"
                  onClick={() => onOpenPdf(paper.path, paper.title)}
                >
                  View in App
                </button>
                <a 
                  href={`/${paper.path}`} 
                  download 
                  className="btn-download-paper"
                  title="Download PDF"
                >
                  <Download size={16} />
                </a>
              </div>
            </div>
          );
        })}

        {pastPapers.length === 0 && (
          <div className="empty-state-card">
            <FileText size={40} className="text-gray-400" />
            <p>No past papers found matching your filters. Try resetting the subject or medium filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
