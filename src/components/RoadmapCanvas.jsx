import React, { useRef, useEffect, useState } from 'react';
import LevelNode from './LevelNode';
import { Sparkles, Trophy, Rocket, ShieldCheck } from 'lucide-react';

export default function RoadmapCanvas({ 
  subjectData, 
  userProgress, 
  onOpenLevel 
}) {
  const containerRef = useRef(null);
  const [pathD, setPathD] = useState('');

  const levels = subjectData.levels || [];
  const subjectId = subjectData.id;
  const accentColor = subjectData.color || '#6366f1';

  // Winding offset pattern for sinuous serpentine path
  const offsetClasses = [
    'offset-center',
    'offset-left',
    'offset-center',
    'offset-right'
  ];

  // Determine which level should have the "Start Here" badge
  // It is the first level that is NOT completed
  const activeLevelIndex = levels.findIndex(lvl => {
    const p = userProgress[subjectId]?.[lvl.id];
    return !p || !p.completed;
  });
  const currentActiveIndex = activeLevelIndex === -1 ? levels.length - 1 : activeLevelIndex;

  // Build the sinuous SVG curve path through node centers
  useEffect(() => {
    const updatePath = () => {
      if (!containerRef.current) return;
      const nodes = containerRef.current.querySelectorAll('.level-group');
      if (nodes.length < 2) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const points = [];

      nodes.forEach(node => {
        const btn = node.querySelector('.pedestal-btn');
        if (btn) {
          const rect = btn.getBoundingClientRect();
          const cx = (rect.left + rect.width / 2) - containerRect.left;
          const cy = (rect.top + rect.height / 2) - containerRect.top;
          points.push({ x: cx, y: cy });
        }
      });

      if (points.length < 2) return;

      // Generate smooth cubic bezier SVG path
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const midY = (p0.y + p1.y) / 2;
        d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
      }
      setPathD(d);
    };

    updatePath();
    window.addEventListener('resize', updatePath);
    const timer = setTimeout(updatePath, 200);

    return () => {
      window.removeEventListener('resize', updatePath);
      clearTimeout(timer);
    };
  }, [levels, subjectId]);

  return (
    <div className="roadmap-container" ref={containerRef}>
      {/* Sinuous Neon Energy Conduit */}
      <svg className="orbit-conduit-svg" aria-hidden="true">
        <defs>
          <linearGradient id={`conduit-grad-${subjectId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.9" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {pathD && (
          <>
            {/* Outer blur glow */}
            <path
              d={pathD}
              className="conduit-glow"
              stroke={`url(#conduit-grad-${subjectId})`}
            />
            {/* Animated pulsing core */}
            <path
              d={pathD}
              className="conduit-core"
              stroke="#ffffff"
            />
          </>
        )}
      </svg>

      {/* Hero Welcome Capsule */}
      <div 
        className="glass-panel" 
        style={{ 
          maxWidth: '650px', 
          margin: '0 auto 60px', 
          padding: '24px 30px', 
          textAlign: 'center',
          borderColor: accentColor
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', marginBottom: '12px' }}>
          <Sparkles size={16} color={accentColor} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>A/L 2026/2027 විභාග ජයග්‍රාහී මාවත</span>
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {subjectData.name} ({subjectData.nameEn})
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', fontFamily: 'var(--font-sinhala)', lineHeight: 1.6 }}>
          0 මට්ටමේ සිට විෂය නිර්දේශයේ සියලුම සිද්ධාන්ත, පෙරහුරු ගැටළු සහ සජීවී AI ලකුණු ලබා දීම සමඟින් A+ සාමාර්ථය දක්වා ඉදිරියට යන්න!
        </p>
      </div>

      {/* Nodes Layer */}
      <div className="nodes-layer">
        {levels.map((lvl, index) => {
          const progress = userProgress[subjectId]?.[lvl.id] || {};
          const isCompleted = progress.completed === true;
          const isUnlocked = index === 0 || isCompleted || index <= currentActiveIndex;
          const isActive = index === currentActiveIndex;
          const status = isCompleted ? 'completed' : isUnlocked ? 'active' : 'locked';
          const offsetClass = offsetClasses[index % offsetClasses.length];

          return (
            <LevelNode
              key={lvl.id}
              level={lvl}
              status={status}
              starsEarned={progress.stars || 0}
              isStartHere={isActive && !isCompleted}
              offsetClass={offsetClass}
              accentColor={accentColor}
              onSelect={onOpenLevel}
            />
          );
        })}

        {/* Grand Final Boss Orbit Station */}
        <div className="glass-panel" style={{ marginTop: '30px', padding: '24px 32px', textAlign: 'center', maxWidth: '480px', borderColor: '#fbbf24' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 0 25px rgba(245, 158, 11, 0.6)' }}>
            <Trophy size={28} color="#fff" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
            අවසාන විභාග මධ්‍යස්ථානය (Grand Past Paper Arena)
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'var(--font-sinhala)' }}>
            සියලුම මට්ටම් සම්පූර්ණ කිරීමෙන් පසු 2010-2026 වසර 16ක සම්පූර්ණ ප්‍රශ්න පත්‍ර අභියෝගය විවෘත වේ!
          </p>
        </div>
      </div>
    </div>
  );
}
