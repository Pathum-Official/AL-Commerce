import React from 'react';
import { 
  Home, 
  CalendarCheck, 
  Bot 
} from 'lucide-react';

export default function BottomNav({
  activeTab,
  onSelectTab,
  onOpenPlanner,
  onOpenAITutor,
  plannerCount = 0
}) {
  return (
    <nav className="ptm-bottom-nav simple-3-item">
      {/* 1. Home */}
      <button 
        className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => onSelectTab('dashboard')}
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      {/* 2. Study Planner */}
      <button 
        className="bottom-nav-item"
        onClick={onOpenPlanner}
      >
        <div style={{ position: 'relative' }}>
          <CalendarCheck size={20} />
          {plannerCount > 0 && <span className="mobile-badge">{plannerCount}</span>}
        </div>
        <span>Planner</span>
      </button>

      {/* 3. AI Tutor */}
      <button 
        className="bottom-nav-item btn-ai-mobile"
        onClick={onOpenAITutor}
        title="PTM Prime AI Tutor"
      >
        <div className="fab-glow-icon">
          <Bot size={22} color="#ffffff" />
        </div>
        <span>AI Tutor</span>
      </button>
    </nav>
  );
}
