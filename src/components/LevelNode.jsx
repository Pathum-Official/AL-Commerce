import React from 'react';
import { Star, Lock, CheckCircle2 } from 'lucide-react';
import { sound } from '../services/audioEngine';

export default function LevelNode({ 
  level, 
  status, // 'locked' | 'active' | 'completed'
  starsEarned = 0, 
  isStartHere = false,
  offsetClass = 'offset-center',
  accentColor = '#6366f1',
  onSelect 
}) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isActive = status === 'active';

  const handleClick = () => {
    if (isLocked) {
      sound.playError();
      return;
    }
    sound.playClick();
    onSelect(level);
  };

  return (
    <div className={`level-group ${offsetClass}`}>
      {/* Floating "Start Here" / Next Milestone Badge */}
      {isStartHere && (
        <div className="start-here-badge">
          <span>🛸</span>
          <span>START HERE</span>
        </div>
      )}

      {/* Floating 3D Pedestal Button */}
      <button 
        onClick={handleClick}
        disabled={isLocked}
        className={`pedestal-btn ${status}`}
        aria-label={`Level ${level.number}: ${level.title}`}
        style={{
          boxShadow: isActive ? `0 0 30px ${accentColor}, inset 0 2px 6px rgba(255, 255, 255, 0.6)` : undefined
        }}
      >
        {isLocked ? (
          <Lock size={28} color="#94a3b8" />
        ) : isCompleted ? (
          <>
            <span className="level-number">{level.number}</span>
            <div className="stars-row">
              <Star className="star-icon star-gold" />
              <Star className="star-icon star-gold" />
              <Star className="star-icon star-gold" />
            </div>
          </>
        ) : (
          <>
            <span className="level-number">{level.number}</span>
            <div className="stars-row">
              <Star className={`star-icon ${starsEarned >= 1 ? 'star-gold' : 'star-empty'}`} />
              <Star className={`star-icon ${starsEarned >= 2 ? 'star-gold' : 'star-empty'}`} />
              <Star className={`star-icon ${starsEarned >= 3 ? 'star-gold' : 'star-empty'}`} />
            </div>
          </>
        )}
      </button>

      {/* Title Card Beneath Pedestal */}
      <div className="node-title-card" title={level.title}>
        <span>{level.number}. {level.title}</span>
      </div>
    </div>
  );
}
