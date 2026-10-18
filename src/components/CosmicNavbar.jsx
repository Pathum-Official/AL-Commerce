import React, { useState } from 'react';
import { 
  Calculator, 
  Building2, 
  TrendingUp, 
  Flame, 
  Star, 
  Sparkles, 
  BookOpen, 
  Bot, 
  Volume2, 
  VolumeX, 
  Zap 
} from 'lucide-react';
import { sound } from '../services/audioEngine';

export default function CosmicNavbar({ 
  currentSubject, 
  onSelectSubject, 
  xp, 
  streak, 
  stars, 
  onOpenLibrary, 
  onOpenAITutor 
}) {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const handleToggleAudio = () => {
    const playing = sound.toggleAmbient();
    setIsAudioPlaying(playing);
    sound.playClick();
  };

  return (
    <header className="top-hud">
      {/* Brand & Mascot */}
      <div className="brand-badge" onClick={() => sound.playClick()}>
        <div className="brand-icon">
          <span>🚀</span>
        </div>
        <div>
          <h1 className="brand-title">Commerce Odyssey</h1>
          <p className="brand-sub">උසස් පෙළ වාණිජ අභ්‍යවකාශ චාරිකාව • Zero to A+</p>
        </div>
      </div>

      {/* Subject Switcher Tabs */}
      <nav className="subject-tabs" aria-label="විෂය තෝරන්න">
        <button
          onClick={() => { sound.playClick(); onSelectSubject('accounting'); }}
          className={`subject-tab-btn ${currentSubject === 'accounting' ? 'active-acc' : ''}`}
        >
          <Calculator size={18} />
          <span>ගිණුම්කරණය</span>
        </button>

        <button
          onClick={() => { sound.playClick(); onSelectSubject('business'); }}
          className={`subject-tab-btn ${currentSubject === 'business' ? 'active-bs' : ''}`}
        >
          <Building2 size={18} />
          <span>ව්‍යාපාර අධ්‍යයනය</span>
        </button>

        <button
          onClick={() => { sound.playClick(); onSelectSubject('economics'); }}
          className={`subject-tab-btn ${currentSubject === 'economics' ? 'active-econ' : ''}`}
        >
          <TrendingUp size={18} />
          <span>ආර්ථික විද්‍යාව</span>
        </button>
      </nav>

      {/* HUD Metrics & Action Buttons */}
      <div className="hud-metrics">
        {/* XP Counter */}
        <div className="hud-pill" title="ලබාගත් සම්පූර්ණ ලකුණු (XP)">
          <Zap size={16} color="#fbbf24" fill="#fbbf24" />
          <span style={{ color: '#fbbf24' }}>{xp} XP</span>
        </div>

        {/* Streak Counter */}
        <div className="hud-pill" title="අඛණ්ඩව ඉගෙන ගත් දින ගණන">
          <Flame size={16} color="#f97316" fill="#f97316" />
          <span style={{ color: '#f97316' }}>{streak}d</span>
        </div>

        {/* Total Stars */}
        <div className="hud-pill" title="ලබාගත් රන් තරු">
          <Star size={16} color="#fbbf24" fill="#fbbf24" />
          <span>{stars}</span>
        </div>

        {/* Ambient Cosmic Sound */}
        <button 
          onClick={handleToggleAudio}
          className="hud-btn"
          title={isAudioPlaying ? "ශබ්දය නවත්වන්න" : "අවකාශීය Lo-Fi පසුබිම් නාදය අසන්න"}
        >
          {isAudioPlaying ? <Volume2 size={18} color="#a5b4fc" /> : <VolumeX size={18} color="#64748b" />}
        </button>

        {/* Digital Library */}
        <button 
          onClick={() => { sound.playClick(); onOpenLibrary(); }}
          className="hud-btn"
          title="පසුගිය ප්‍රශ්න පත්‍ර සහ කෙටි සටහන් පුස්තකාලය"
        >
          <BookOpen size={17} />
          <span style={{ fontFamily: 'var(--font-sinhala)' }}>පුස්තකාලය</span>
        </button>

        {/* AI Tutor Floating Shortcut */}
        <button 
          onClick={() => { sound.playClick(); onOpenAITutor(); }}
          className="hud-btn ai-glow"
          title="සජීවී AI වාණිජ උපදේශක"
        >
          <Bot size={18} />
          <span style={{ fontFamily: 'var(--font-sinhala)' }}>AI පරීක්ෂක</span>
        </button>
      </div>
    </header>
  );
}
