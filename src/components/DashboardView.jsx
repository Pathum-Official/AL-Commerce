import React from 'react';
import { 
  Calculator, 
  Briefcase, 
  TrendingUp, 
  Sparkles, 
  Search,
  Bot,
  CalendarCheck
} from 'lucide-react';
import { CURRICULUM_DATA } from '../data/curriculumData';

export default function DashboardView({
  onSelectSubject,
  onSelectTab,
  onOpenSearch,
  onOpenAITutor,
  onOpenPlanner
}) {
  const accUnits = CURRICULUM_DATA.accounting?.units || [];
  const bsUnits = CURRICULUM_DATA['business-studies']?.units || [];
  const econUnits = CURRICULUM_DATA.economics?.units || [];

  return (
    <div className="ptm-dashboard-view">
      {/* Compact Top Motivation & Search */}
      <div className="ptm-dashboard-topbar">
        <div className="ptm-motto-pill">
          <Sparkles size={14} className="text-pink-400" />
          <span>💖 "ඔව් මට පුළුවන්! ජපුර... මම එනවා ඔයා හොයාගෙන!" 🎓</span>
        </div>

        {/* Search Trigger */}
        <div className="ptm-hero-search-box" onClick={onOpenSearch}>
          <Search size={18} className="search-icon" />
          <span className="search-placeholder">
            Search 2,040+ video lectures, past papers, notes...
          </span>
          <span className="search-badge">Press ⌘K</span>
        </div>

        {/* Short Web Suite & Resources Description */}
        <p className="dashboard-sub-desc">
          Sri Lanka's complete digital LMS for G.C.E. A/L Commerce — 2,040+ video lectures, A+ theory notes, past papers, and 2,300+ interactive MCQ practice questions for all 3 core subjects.
        </p>
      </div>

      {/* 3 Core Subject Portals */}
      <div className="ptm-subjects-grid">
        {/* Accounting Card */}
        <div 
          className="ptm-subject-card card-accounting"
          onClick={() => onSelectSubject('accounting')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectSubject('accounting');
            }
          }}
        >
          <div className="subject-card-lead">
            <div className="subject-icon-box bg-indigo">
              <Calculator size={26} />
            </div>
            <div className="subject-card-info">
              <h3 className="subject-title">Accounting (ගිණුම්කරණය)</h3>
              <div className="subject-meta-tags">
                <span className="subject-badge badge-acc">16 Units</span>
                <span className="subject-badge badge-acc">444 Videos</span>
                <span className="subject-badge badge-acc">148 Notes</span>
                <span className="subject-badge badge-acc">800+ MCQs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Studies Card */}
        <div 
          className="ptm-subject-card card-bs"
          onClick={() => onSelectSubject('business-studies')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectSubject('business-studies');
            }
          }}
        >
          <div className="subject-card-lead">
            <div className="subject-icon-box bg-pink">
              <Briefcase size={26} />
            </div>
            <div className="subject-card-info">
              <h3 className="subject-title">Business Studies (ව්‍යාපාර අධ්‍යයනය)</h3>
              <div className="subject-meta-tags">
                <span className="subject-badge badge-bs">18 Units</span>
                <span className="subject-badge badge-bs">694 Videos</span>
                <span className="subject-badge badge-bs">188 Notes</span>
                <span className="subject-badge badge-bs">900+ MCQs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Economics Card */}
        <div 
          className="ptm-subject-card card-econ"
          onClick={() => onSelectSubject('economics')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectSubject('economics');
            }
          }}
        >
          <div className="subject-card-lead">
            <div className="subject-icon-box bg-emerald">
              <TrendingUp size={26} />
            </div>
            <div className="subject-card-info">
              <h3 className="subject-title">Economics (ආර්ථික විද්‍යාව)</h3>
              <div className="subject-meta-tags">
                <span className="subject-badge badge-econ">12 Units</span>
                <span className="subject-badge badge-econ">567 Videos</span>
                <span className="subject-badge badge-econ">159 Notes</span>
                <span className="subject-badge badge-econ">600+ MCQs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quick Tools (AI Assistant & Study Planner) */}
      <div className="dashboard-tools-grid">
        <div 
          className="dashboard-tool-card tool-ai" 
          onClick={() => onOpenAITutor('')}
          role="button"
          tabIndex={0}
        >
          <div className="tool-icon-bubble bg-purple">
            <Bot size={22} />
          </div>
          <div className="tool-content">
            <div className="tool-heading">AI Study Assistant</div>
            <div className="tool-sub">24/7 විෂය ගැටලු සහ සටහන් විමසන්න</div>
          </div>
        </div>

        <div 
          className="dashboard-tool-card tool-planner" 
          onClick={onOpenPlanner}
          role="button"
          tabIndex={0}
        >
          <div className="tool-icon-bubble bg-emerald">
            <CalendarCheck size={22} />
          </div>
          <div className="tool-content">
            <div className="tool-heading">Study Planner</div>
            <div className="tool-sub">දෛනික ඉලක්ක සහ කාලසටහන සකසන්න</div>
          </div>
        </div>
      </div>

      {/* Sleek Resource Stats Overview Strip */}
      <div className="dashboard-stats-strip">
        <div className="stat-strip-item">
          <span className="strip-val">46</span>
          <span className="strip-lbl">Units</span>
        </div>
        <div className="stat-strip-divider" />
        <div className="stat-strip-item">
          <span className="strip-val">1,705</span>
          <span className="strip-lbl">Videos</span>
        </div>
        <div className="stat-strip-divider" />
        <div className="stat-strip-item">
          <span className="strip-val">495</span>
          <span className="strip-lbl">Notes</span>
        </div>
        <div className="stat-strip-divider" />
        <div className="stat-strip-item">
          <span className="strip-val">2,300+</span>
          <span className="strip-lbl">Practice MCQs</span>
        </div>
        <div className="stat-strip-divider" />
        <div className="stat-strip-item">
          <span className="strip-val">16</span>
          <span className="strip-lbl">Exam Years</span>
        </div>
      </div>
    </div>
  );
}
