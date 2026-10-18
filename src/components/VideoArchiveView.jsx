import React, { useState } from 'react';
import { 
  Video, 
  Play, 
  Search, 
  Filter, 
  ExternalLink, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export default function VideoArchiveView({
  catalog = [],
  onPlayVideo,
  onBack
}) {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allVideos = catalog.filter(x => x.type === 'yt');

  const filteredVideos = allVideos.filter(v => {
    if (selectedSubject === 'accounting' && !v.path.includes('/accounting/')) return false;
    if (selectedSubject === 'business-studies' && !v.path.includes('/business-studies/')) return false;
    if (selectedSubject === 'economics' && !v.path.includes('/economics/')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (v.title && v.title.toLowerCase().includes(q)) || (v.path && v.path.toLowerCase().includes(q));
    }

    return true;
  });

  return (
    <div className="ptm-videos-archive-view">
      {/* Breadcrumb */}
      <div className="ptm-view-nav">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">Full Syllabus Video Lecture Archive</span>
      </div>

      <div className="videos-hero-card">
        <span className="videos-tag">1,705 COMPREHENSIVE LECTURES</span>
        <h1 className="videos-hero-title">A/L Commerce Video Syllabus Library</h1>
        <p className="videos-hero-sub">
          Stream all 1,705 full syllabus video lectures covering every single unit, past paper problem discussions, and revision model papers without missing any topic.
        </p>

        {/* Filter & Search Bar */}
        <div className="videos-filter-bar">
          <div className="subject-pills-row">
            <button 
              className={`pill-btn ${selectedSubject === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedSubject('all')}
            >
              All Videos (1,705)
            </button>
            <button 
              className={`pill-btn ${selectedSubject === 'accounting' ? 'active' : ''}`}
              onClick={() => setSelectedSubject('accounting')}
            >
              Accounting (444)
            </button>
            <button 
              className={`pill-btn ${selectedSubject === 'business-studies' ? 'active' : ''}`}
              onClick={() => setSelectedSubject('business-studies')}
            >
              Business Studies (694)
            </button>
            <button 
              className={`pill-btn ${selectedSubject === 'economics' ? 'active' : ''}`}
              onClick={() => setSelectedSubject('economics')}
            >
              Economics (567)
            </button>
          </div>

          <div className="video-search-input-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              className="video-search-input" 
              placeholder="Search video lectures by unit or lesson (e.g. 02 වන ඒකකය, සමීකරණය, PESTEL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="videos-results-header">
        <div>
          <h3 className="results-count-title">{filteredVideos.length} Video Lectures Available</h3>
          <p className="results-count-sub">Click any lecture to play immediately in the responsive player.</p>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="videos-grid-cards">
        {filteredVideos.slice(0, 100).map((video, idx) => {
          let subTag = "Accounting";
          let badgeColor = "bg-indigo";
          if (video.path.includes('/business-studies/')) {
            subTag = "Business Studies";
            badgeColor = "bg-pink";
          } else if (video.path.includes('/economics/')) {
            subTag = "Economics";
            badgeColor = "bg-emerald";
          }

          return (
            <div key={idx} className="archive-video-card">
              <div className="thumb-container" onClick={() => onPlayVideo(video)}>
                <img 
                  src={`https://img.youtube.com/vi/${video.ytId}/mqdefault.jpg`} 
                  alt={video.title} 
                  className="archive-thumb-img"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="play-overlay">
                  <div className="play-circle">
                    <Play size={22} fill="#ffffff" color="#ffffff" />
                  </div>
                </div>
                <span className={`sub-tag-corner ${badgeColor}`}>{subTag}</span>
              </div>

              <div className="archive-video-body">
                <h4 className="archive-video-title">{video.title}</h4>
                <div className="archive-video-actions">
                  <button 
                    className="btn-play-now"
                    onClick={() => onPlayVideo(video)}
                  >
                    <Play size={13} fill="currentColor" /> Play Lecture
                  </button>
                  <a 
                    href={`https://www.youtube.com/watch?v=${video.ytId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-yt-icon"
                    title="Watch on YouTube"
                  >
                    <ExternalLink size={15} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filteredVideos.length === 0 && (
          <div className="empty-state-card">
            <Video size={40} className="text-gray-400" />
            <p>No video lectures found matching your search. Try adjusting the search keywords.</p>
          </div>
        )}
      </div>

      {filteredVideos.length > 100 && (
        <div className="load-more-notice">
          Showing top 100 video lectures matching your filter. Use the search bar above to narrow down specific lessons or units.
        </div>
      )}
    </div>
  );
}
