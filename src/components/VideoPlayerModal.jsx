import React from 'react';
import { 
  X, 
  ExternalLink, 
  Bot, 
  CalendarPlus, 
  Play, 
  Maximize2,
  Sparkles,
  Share2
} from 'lucide-react';

export default function VideoPlayerModal({
  video,
  onClose,
  onOpenAITutor,
  onAddToPlanner
}) {
  if (!video) return null;

  return (
    <div className="ptm-modal-backdrop" onClick={onClose}>
      <div className="ptm-video-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <div className="modal-header-bar">
          <div className="modal-title-group">
            <span className="modal-tag">PTM PRIME VIDEO LECTURE</span>
            <h3 className="modal-video-title">{video.title}</h3>
          </div>
          
          <button className="btn-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Responsive 16:9 Video Container */}
        <div className="modal-yt-container">
          <iframe 
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Bottom Interactive Toolbar */}
        <div className="modal-action-toolbar">
          <div className="toolbar-left-chips">
            <span className="badge-pill">
              <Sparkles size={12} className="text-amber-400" /> Full Syllabus Coverage
            </span>
          </div>

          <div className="toolbar-right-btns">
            <a 
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn btn-yt"
            >
              <ExternalLink size={15} /> Watch on YouTube
            </a>

            <button 
              className="action-btn btn-ai"
              onClick={() => {
                onClose();
                onOpenAITutor(video.title);
              }}
            >
              <Bot size={15} /> Ask AI Tutor
            </button>

            <button 
              className="action-btn btn-planner"
              onClick={() => {
                onAddToPlanner(video.title);
              }}
            >
              <CalendarPlus size={15} /> Add to Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
