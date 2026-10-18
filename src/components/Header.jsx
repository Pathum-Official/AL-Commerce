import React from 'react';
import { 
  Crown, 
  Search, 
  Moon, 
  Sun, 
  Bot, 
  CalendarCheck, 
  BookOpen, 
  Calculator, 
  Briefcase, 
  TrendingUp, 
  Menu, 
  X,
  Video,
  FileText,
  Smartphone,
  Download
} from 'lucide-react';

export default function Header({
  activeTab,
  onSelectTab,
  darkMode,
  onToggleTheme,
  onOpenSearch,
  onOpenAITutor,
  onOpenPlanner,
  plannerCount = 0,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onInstallApp,
  isInstallable
}) {
  return (
    <header className="ptm-header">
      <div className="ptm-header-container">
        {/* Brand & Logo */}
        <div className="ptm-brand-wrapper" onClick={() => onSelectTab('dashboard')}>
          <div className="ptm-logo-icon">
            <img src="/app-icon.png" alt="A/L Commerce LMS Logo" className="brand-logo-img" />
          </div>
          <div className="ptm-brand-text">
            <div className="ptm-brand-title brand-al-commerce">
              A/L Commerce LMS
            </div>
          </div>
        </div>

        {/* Global Desktop Navigation Links (Focused on 3 Core Subjects) */}
        <nav className="ptm-nav-desktop">
          <button 
            className={`ptm-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`ptm-nav-link ${activeTab === 'accounting' ? 'active' : ''}`}
            onClick={() => onSelectTab('accounting')}
          >
            <Calculator size={16} /> Accounting
          </button>
          <button 
            className={`ptm-nav-link ${activeTab === 'business-studies' ? 'active' : ''}`}
            onClick={() => onSelectTab('business-studies')}
          >
            <Briefcase size={16} /> Business Studies
          </button>
          <button 
            className={`ptm-nav-link ${activeTab === 'economics' ? 'active' : ''}`}
            onClick={() => onSelectTab('economics')}
          >
            <TrendingUp size={16} /> Economics
          </button>
        </nav>

        {/* Header Right Action Toolbar */}
        <div className="ptm-actions-wrapper">
          {/* Quick Search Trigger */}
          <button 
            className="ptm-search-trigger"
            onClick={onOpenSearch}
            title="Search resources (Ctrl + K)"
          >
            <Search size={16} />
            <span className="search-text">Search catalog...</span>
            <kbd className="search-kbd">⌘K</kbd>
          </button>

          {/* AI Tutor Button (Desktop only; on mobile, available in bottom nav) */}
          <button 
            className="ptm-action-btn btn-ai hide-on-mobile"
            onClick={onOpenAITutor}
            title="PTM Prime AI Study Assistant"
          >
            <Bot size={18} />
            <span className="btn-label">AI Tutor</span>
          </button>

          {/* Study Planner Button (Desktop only; on mobile, available in bottom nav) */}
          <button 
            className="ptm-action-btn btn-planner hide-on-mobile"
            onClick={onOpenPlanner}
            title="Study Planner & Tasks"
          >
            <CalendarCheck size={18} />
            <span className="btn-label">Planner</span>
            {plannerCount > 0 && (
              <span className="planner-badge">{plannerCount}</span>
            )}
          </button>

          {/* Mobile Install App Button */}
          {onInstallApp && (
            <button 
              className="ptm-action-btn btn-install-app"
              onClick={onInstallApp}
              title="Install A/L Commerce App on your device"
            >
              <Smartphone size={16} className="text-emerald-400" />
              <span className="btn-label">App</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button 
            className="ptm-icon-btn"
            onClick={onToggleTheme}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
