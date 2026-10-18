import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DashboardView from './components/DashboardView';
import SubjectView from './components/SubjectView';
import UnitDetailView from './components/UnitDetailView';
import VideoPlayerModal from './components/VideoPlayerModal';
import PdfViewerModal from './components/PdfViewerModal';
import AITutorDrawer from './components/AITutorDrawer';
import StudyPlannerDrawer from './components/StudyPlannerDrawer';
import SearchModal from './components/SearchModal';
import VoiceReaderWidget from './components/VoiceReaderWidget';
import { X, Smartphone } from 'lucide-react';
import { CURRICULUM_DATA } from './data/curriculumData';
import MASTER_CATALOG from '../commerce_catalog.json';

const getTodayStr = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

const getRelativeDateStr = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

const INITIAL_TASKS = [
  { id: "task_1", title: "Accounting: Practice 20 Double-Entry Transactions (A = E + L)", subject: "Accounting", priority: "high", completed: true, startDate: getRelativeDateStr(-1), endDate: getTodayStr() },
  { id: "task_2", title: "Business Studies: Memorize 6 PESTEL Environmental Factors with SL Examples", subject: "Business Studies", priority: "high", completed: false, startDate: getTodayStr(), endDate: getTodayStr() },
  { id: "task_3", title: "Economics: Draw & Explain Production Possibility Curve (PPC) Shifts", subject: "Economics", priority: "high", completed: false, startDate: getTodayStr(), endDate: getRelativeDateStr(1) },
  { id: "task_4", title: "Accounting: Manufacturing Accounts Cost Formats & Direct/Indirect Costs", subject: "Accounting", priority: "high", completed: false, startDate: getRelativeDateStr(-3), endDate: getRelativeDateStr(-1) },
  { id: "task_5", title: "Past Paper Practice: Complete 2023 A/L Paper 01 MCQs & Self-Grade", subject: "General", priority: "medium", completed: false, startDate: getTodayStr(), endDate: getRelativeDateStr(4) }
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeUnit, setActiveUnit] = useState(null);

  // Modals & Drawers State
  const [activeVideo, setActiveVideo] = useState(null);
  const [activePdf, setActivePdf] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [aiInitialTopic, setAiInitialTopic] = useState('');
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('ptm_theme');
      return saved ? saved === 'dark' : true; // Default to dark for sleek premium look
    } catch (e) {
      return true;
    }
  });

  // Tasks State
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('ptm_prime_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch (e) {
      return INITIAL_TASKS;
    }
  });

  // Master Catalog Data (bundled JSON for instant, zero-latency search & navigation)
  const [catalog, setCatalog] = useState(() => {
    return (window.COMMERCE_CATALOG_DATA && window.COMMERCE_CATALOG_DATA.length > 0)
      ? window.COMMERCE_CATALOG_DATA
      : MASTER_CATALOG;
  });

  // Sync Dark Mode Class to <body>
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('ptm_theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('ptm_theme', 'light');
    }
  }, [darkMode]);

  // Sync Tasks to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ptm_prime_tasks', JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks]);

  // Fallback catalog fetch if not preloaded in window
  useEffect(() => {
    if (!catalog || catalog.length === 0) {
      fetch('/commerce_catalog.json')
        .then(res => res.json())
        .then(data => setCatalog(data))
        .catch(() => {});
    }
  }, [catalog]);

  // Global Ctrl + K Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Task Actions
  const handleToggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddToPlanner = (title) => {
    const today = getTodayStr();
    const newTask = {
      id: 'task_' + Date.now(),
      title: `Study: ${title}`,
      subject: activeTab === 'accounting' ? 'Accounting' : (activeTab === 'business-studies' ? 'Business Studies' : 'Economics'),
      priority: 'high',
      completed: false,
      startDate: today,
      endDate: today
    };
    handleAddTask(newTask);
    setIsPlannerOpen(true);
  };

  const handleOpenAITutorWithTopic = (topic) => {
    setAiInitialTopic(topic);
    setIsAITutorOpen(true);
  };

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  // PWA Install Event Listener
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstallable(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      alert("📲 A/L Commerce App එක Install කරගැනීමට:\n\n1. ඔබගේ Browser මෙනුව (Share ⎋ හෝ Settings ⋮) විවෘත කරන්න.\n2. 'Add to Home Screen' (මුල් තිරයට එක් කරන්න ➕) තෝරන්න.\n3. එවිට App Icon එක දුරකථනයේ Home Screen එකට එක් වේ!");
    }
  };

  const handleOpenPdfViewer = (path, title) => {
    setActivePdf({ path, title });
  };

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setActiveUnit(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectUnit = (unit) => {
    setActiveUnit(unit);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get current active subject
  const currentSubjectObj = CURRICULUM_DATA[activeTab] || null;

  return (
    <div className={`ptm-app-root ${darkMode ? 'dark-mode' : ''}`}>
      {/* Top Header */}
      <Header 
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(prev => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAITutor={() => handleOpenAITutorWithTopic('')}
        onOpenPlanner={() => setIsPlannerOpen(true)}
        plannerCount={tasks.filter(t => !t.completed).length}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        onInstallApp={handleInstallApp}
        isInstallable={isInstallable}
      />

      {/* Floating PWA Mobile Install Banner */}
      {showInstallBanner && (
        <div className="pwa-install-banner animate-fade-in">
          <div className="pwa-banner-left">
            <img src="/app-icon.png" alt="App Icon" className="pwa-banner-icon" />
            <div className="pwa-banner-text">
              <span className="pwa-banner-title">A/L Commerce App එක Phone එකට Install කරගන්න</span>
              <span className="pwa-banner-desc">Full App Experience • Fast Speed • Offline Study Access</span>
            </div>
          </div>
          <div className="pwa-banner-actions">
            <button className="btn-banner-install" onClick={handleInstallApp}>
              <Smartphone size={14} className="mr-1 inline" /> Install App
            </button>
            <button 
              className="btn-banner-dismiss" 
              onClick={() => setShowInstallBanner(false)}
              aria-label="Dismiss banner"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas Body */}
      <main className="ptm-main-content">
        {/* View 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardView 
            onSelectSubject={handleSelectTab}
            onSelectTab={handleSelectTab}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenAITutor={() => handleOpenAITutorWithTopic('')}
            onOpenPlanner={() => setIsPlannerOpen(true)}
          />
        )}

        {/* View 2: Subject View or Unit Detail Hub */}
        {['accounting', 'business-studies', 'economics'].includes(activeTab) && (
          activeUnit ? (
            <UnitDetailView 
              unit={activeUnit}
              subject={currentSubjectObj}
              onBack={() => setActiveUnit(null)}
              onPlayVideo={(video) => setActiveVideo(video)}
              onOpenPdf={handleOpenPdfViewer}
              onOpenAITutor={handleOpenAITutorWithTopic}
              onAddToPlanner={handleAddToPlanner}
            />
          ) : (
            <SubjectView 
              subjectId={activeTab}
              onBack={() => handleSelectTab('dashboard')}
              onSelectUnit={handleSelectUnit}
              onOpenPdf={handleOpenPdfViewer}
              catalog={catalog}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="ptm-footer">
        <div className="ptm-footer-container">
          <p className="footer-quote">
            "💖 ඔව් මට පුළුවන්! ජපුර... මම එනවා ඔයා හොයාගෙන! 🎓"
          </p>
          <small className="footer-copy">
            © 2026 A/L Commerce LMS • Powered by PTM Prime
          </small>
        </div>
      </footer>

      {/* Bottom Navigation for Mobile Devices */}
      <BottomNav 
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAITutor={() => handleOpenAITutorWithTopic('')}
        onOpenPlanner={() => setIsPlannerOpen(true)}
        plannerCount={tasks.filter(t => !t.completed).length}
      />

      {/* Modals & Drawers */}
      {activeVideo && (
        <VideoPlayerModal 
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
          onOpenAITutor={handleOpenAITutorWithTopic}
          onAddToPlanner={handleAddToPlanner}
        />
      )}

      {activePdf && (
        <PdfViewerModal 
          pdfPath={activePdf.path}
          pdfTitle={activePdf.title}
          onClose={() => setActivePdf(null)}
        />
      )}

      <AITutorDrawer 
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
        initialTopic={aiInitialTopic}
        catalog={catalog}
      />

      <StudyPlannerDrawer 
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        tasks={tasks}
        onToggleTask={handleToggleTask}
        onAddTask={handleAddTask}
        onDeleteTask={handleDeleteTask}
      />

      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        catalog={catalog}
        onOpenVideo={(video) => setActiveVideo(video)}
        onOpenPdf={handleOpenPdfViewer}
        onOpenUrl={(url) => window.open(url, '_blank')}
      />

      {/* Floating Synchronized Voice Reader Bar */}
      <VoiceReaderWidget />
    </div>
  );
}
