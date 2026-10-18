import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Download, RotateCcw, Sparkles, ExternalLink, Code } from 'lucide-react';
import { renderMarkdownWithMath } from '../utils/markdownRenderer';

export default function InteractiveFrameModal({
    isOpen,
    onClose,
    pageData = null // { type: 'html' | 'markdown', title: string, content: string }
}) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !pageData) return null;

    const { type = 'html', title = 'Interactive Frame', content = '' } = pageData;

    // Handle Direct Download of Generated Artifact
    const handleDownload = () => {
        const ext = type === 'html' ? 'html' : 'md';
        const mime = type === 'html' ? 'text/html' : 'text/markdown';
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Construct Sandboxed HTML Document with KaTeX and Modern Font styling
    const getSandboxHtml = () => {
        return `<!DOCTYPE html>
<html lang="si">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Noto+Sans+Sinhala:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Poppins', 'Noto Sans Sinhala', sans-serif;
      margin: 0;
      padding: 24px;
      background: #090d16;
      color: #f1f5f9;
      line-height: 1.6;
    }
    a { color: #818cf8; }
    button { font-family: inherit; }
  </style>
</head>
<body>
  ${content}
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"><\/script>
  <script>
    if (window.renderMathInElement) {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  <\/script>
</body>
</html>`;
    };

    return (
        <div className={`interactive-frame-backdrop ${isFullscreen ? 'is-fullscreen' : ''}`} onClick={onClose}>
            <div 
                className={`interactive-frame-box ${isFullscreen ? 'fullscreen' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Bar */}
                <div className="frame-modal-header">
                    <div className="frame-header-left">
                        <div className="frame-badge">
                            <Sparkles size={14} className="text-amber-400" />
                            <span>AI Interactive Frame • {type.toUpperCase()}</span>
                        </div>
                        <h3 className="frame-title">{title}</h3>
                    </div>

                    <div className="frame-actions">
                        <button 
                            className="btn-frame-action"
                            onClick={() => setReloadKey(k => k + 1)}
                            title="Reset / Reload Frame"
                        >
                            <RotateCcw size={15} />
                        </button>
                        <button 
                            className="btn-frame-action"
                            onClick={handleDownload}
                            title="Download Standalone File"
                        >
                            <Download size={15} />
                            <span className="btn-action-text">Download</span>
                        </button>
                        <button 
                            className="btn-frame-action"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                        </button>
                        <button 
                            className="btn-frame-close"
                            onClick={onClose}
                            title="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Frame Content Body */}
                <div className="frame-modal-body">
                    {type === 'html' ? (
                        <iframe 
                            key={reloadKey}
                            srcDoc={getSandboxHtml()}
                            title={title}
                            className="interactive-sandboxed-iframe"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        />
                    ) : (
                        <div 
                            className="markdown-body frame-markdown-content"
                            dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(content) }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
