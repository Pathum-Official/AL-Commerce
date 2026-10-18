import React, { useEffect, useState } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText,
  BookOpen,
  GitFork,
  Sparkles,
  Printer,
  Copy,
  Check,
  Maximize2,
  Globe
} from 'lucide-react';
import { renderMarkdownWithMath } from '../utils/markdownRenderer';

export default function PdfViewerModal({
  pdfPath,
  pdfTitle,
  onClose,
  onOpenMindMap
}) {
  if (!pdfPath) return null;

  const cleanUrl = pdfPath.startsWith('/') ? pdfPath : `/${pdfPath}`;
  const isMarkdown = cleanUrl.toLowerCase().endsWith('.md');

  const [mdContent, setMdContent] = useState('');
  const [renderedHtml, setRenderedHtml] = useState('');
  const [isLoadingMd, setIsLoadingMd] = useState(isMarkdown);
  const [copied, setCopied] = useState(false);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);

  useEffect(() => {
    if (isMarkdown) {
      setIsLoadingMd(true);
      fetch(cleanUrl)
        .then(res => {
          if (!res.ok) throw new Error('Failed to load markdown document');
          return res.text();
        })
        .then(text => {
          setMdContent(text);
          setRenderedHtml(renderMarkdownWithMath(text));
          setIsLoadingMd(false);
        })
        .catch(() => {
          const fallback = `# ${pdfTitle || 'Lesson Note'}\n\nCould not load file from \`${cleanUrl}\`. Please ensure the file exists.`;
          setMdContent(fallback);
          setRenderedHtml(renderMarkdownWithMath(fallback));
          setIsLoadingMd(false);
        });
    }
  }, [cleanUrl, isMarkdown, pdfTitle]);

  const handleCopy = () => {
    navigator.clipboard.writeText(mdContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const fullOriginUrl = typeof window !== 'undefined' ? `${window.location.origin}${cleanUrl}` : cleanUrl;
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullOriginUrl)}&embedded=true`;

  return (
    <div className="ptm-modal-backdrop" onClick={onClose}>
      <div className={`ptm-pdf-modal-content ${isMarkdown ? 'md-viewer-modal' : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <div className="modal-header-bar">
          <div className="modal-title-group">
            <span className="modal-tag">
              {isMarkdown ? (
                <>
                  <Sparkles size={12} className="text-amber-400 mr-1" />
                  MASTER STUDY NOTE & SYLLABUS (.MD)
                </>
              ) : (
                'OFFICIAL PDF DOCUMENT'
              )}
            </span>
            <h3 className="modal-video-title">{pdfTitle || (isMarkdown ? "Lesson Master Guide" : "Document Viewer")}</h3>
          </div>
          
          <div className="pdf-modal-actions">
            {isMarkdown && onOpenMindMap && (
              <button 
                className="action-btn-sm mindmap-btn"
                onClick={() => {
                  onClose();
                  onOpenMindMap();
                }}
                title="Launch Interactive Concept Mind Map"
              >
                <GitFork size={15} /> Mind Map
              </button>
            )}

            {isMarkdown && (
              <button 
                className="action-btn-sm"
                onClick={handleCopy}
                title="Copy note text"
              >
                {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}

            {isMarkdown && (
              <button 
                className="action-btn-sm"
                onClick={handlePrint}
                title="Print or Save as PDF"
              >
                <Printer size={15} /> Print
              </button>
            )}

            {!isMarkdown && (
              <button 
                className={`action-btn-sm ${useGoogleViewer ? 'active' : ''}`}
                onClick={() => setUseGoogleViewer(prev => !prev)}
                title="Google Docs Viewer මගින් බලන්න"
              >
                <Globe size={15} /> {useGoogleViewer ? 'Direct View' : 'Cloud View'}
              </button>
            )}

            <a 
              href={cleanUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="action-btn-sm"
              title="Open in new window / Full screen"
            >
              <ExternalLink size={15} /> Open External
            </a>

            <a 
              href={cleanUrl} 
              download 
              className="action-btn-sm primary"
              title="Download file"
            >
              <Download size={15} /> Download
            </a>

            <button className="btn-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        {isMarkdown ? (
          <div className="modal-markdown-container">
            {isLoadingMd ? (
              <div className="reading-skeleton">
                <div className="skeleton-bar title"></div>
                <div className="skeleton-bar line"></div>
                <div className="skeleton-bar line"></div>
                <div className="skeleton-bar short"></div>
              </div>
            ) : (
              <div 
                className="markdown-article ptm-math-enabled"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            )}
          </div>
        ) : (
          <div className="modal-pdf-container">
            <div className="pdf-viewer-bar-tip">
              <span>💡 Preview එක ක්‍රියාත්මක නොවන්නේ නම් </span>
              <a href={cleanUrl} target="_blank" rel="noopener noreferrer" className="link-fullscreen-open">
                <Maximize2 size={12} /> Open Full Screen (New Window)
              </a>
              <span> හෝ </span>
              <button 
                type="button" 
                className="btn-text-action" 
                onClick={() => setUseGoogleViewer(prev => !prev)}
              >
                {useGoogleViewer ? 'Direct PDF Switch' : 'Cloud Docs Viewer Switch'}
              </button>
            </div>
            
            <object 
              data={useGoogleViewer ? googleViewerUrl : `${cleanUrl}#toolbar=1&navpanes=1`} 
              type="application/pdf"
              className="pdf-iframe-view"
            >
              <iframe 
                src={useGoogleViewer ? googleViewerUrl : cleanUrl} 
                title={pdfTitle} 
                className="pdf-iframe-view"
              />
            </object>
          </div>
        )}
      </div>
    </div>
  );
}
