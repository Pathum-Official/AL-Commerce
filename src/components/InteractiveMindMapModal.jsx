import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  GitFork, 
  ChevronRight, 
  BookOpen, 
  Layers,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { UNIT_MINDMAPS, generateMindmapFromMarkdown } from '../data/mindmapData';

/**
 * Calculates a safe, generous pixel width for Sinhala + English text strings.
 * Sinhala Unicode glyphs are typically wider than Latin glyphs.
 */
function getNodeWidth(name, hasChildren) {
  if (!name) return 140;
  let w = 0;
  for (let i = 0; i < name.length; i++) {
    const code = name.charCodeAt(i);
    // Sinhala Unicode range 0x0D80 to 0x0DFF
    if (code >= 0x0D80 && code <= 0x0DFF) {
      w += 11.8;
    } else if (code > 127) {
      w += 10.5;
    } else {
      w += 8.2;
    }
  }
  // Generous right padding: ensures text ends at least 42px before the indicator circle
  const padding = hasChildren ? 62 : 36;
  return Math.max(150, Math.ceil(w + padding));
}

export default function InteractiveMindMapModal({
  unit,
  subject,
  guideContent = '',
  onClose,
  onOpenStudyGuide
}) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const zoomRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get or generate mindmap tree
  const unitKey = `${subject.id}_unit-${String(unit.unitNumber).padStart(2, '0')}`;
  const initialData = UNIT_MINDMAPS[unitKey] || generateMindmapFromMarkdown(unit.title, guideContent);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous SVG
    d3.select(containerRef.current).selectAll('*').remove();

    const container = containerRef.current;
    const width = container.clientWidth || 1000;
    const height = container.clientHeight || 700;
    const isMobile = width < 600;

    // Generous vertical spacing between nodes (prevents vertical overlap)
    const dx = isMobile ? 68 : 78;
    const dy = isMobile ? 260 : 340;

    const tree = d3.tree().nodeSize([dx, dy]);
    const root = d3.hierarchy(initialData);

    root.x0 = height / 2;
    root.y0 = 0;

    // Start with level 1 expanded, collapse all depth >= 2
    root.descendants().forEach((d, i) => {
      d.id = i;
      d._children = d.children;
      if (d.depth && d.depth >= 2) d.children = null;
    });

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('user-select', 'none')
      .style('touch-action', 'none')
      .style('background', '#131314');

    svgRef.current = svg;

    const g = svg.append('g');

    // Pan and Zoom
    const zoom = d3.zoom()
      .scaleExtent([0.15, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Dynamic auto-fit helper that centers the mind map perfectly for any screen width
    function fitToScreen(animate = true) {
      const nodes = root.descendants();
      if (!nodes.length) return;

      const curW = container.clientWidth || (isMobile ? 360 : 1000);
      const curH = container.clientHeight || (isMobile ? 550 : 700);

      const xExtent = d3.extent(nodes, d => d.x); // vertical extent
      const yExtent = d3.extent(nodes, d => d.y + (d.nodeWidth || 160)); // horizontal extent

      const totalH = Math.max(120, (xExtent[1] - xExtent[0]) + (isMobile ? 70 : 100));
      const totalW = Math.max(200, (yExtent[1] - (d3.min(nodes, d => d.y) || 0)) + (isMobile ? 36 : 80));

      const scaleX = curW / totalW;
      const scaleY = curH / totalH;
      let targetScale = Math.min(scaleX, scaleY);
      targetScale = Math.max(isMobile ? 0.48 : 0.65, Math.min(isMobile ? 0.82 : 1.05, targetScale));

      const midX = (xExtent[0] + xExtent[1]) / 2;
      const ty = (curH / 2) - (midX * targetScale);
      const tx = isMobile ? 18 : 44;

      if (animate) {
        svg.transition().duration(450).call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(targetScale));
      } else {
        svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(targetScale));
      }
    }

    const gLink = g.append('g')
      .attr('fill', 'none')
      .attr('stroke', '#5f6368')
      .attr('stroke-width', 2);

    const gNode = g.append('g')
      .attr('cursor', 'pointer')
      .attr('pointer-events', 'all');

    function update(source) {
      const duration = 380;
      const nodes = root.descendants().reverse();
      const links = root.links();

      // 1. Pre-calculate exact node width for every node
      nodes.forEach(d => {
        d.nodeWidth = getNodeWidth(d.data.name, Boolean(d._children));
        d.nodeHeight = isMobile ? 40 : 44;
      });

      // 2. Compute standard tree layout coordinates
      tree(root);

      // 3. Dynamic horizontal level offsets:
      // Prevent ANY child from overlapping parent by calculating max width per depth level
      const maxDepth = d3.max(nodes, d => d.depth) || 0;
      const depthOffsets = { 0: 0 };
      let cumulativeX = 0;

      for (let lvl = 0; lvl <= maxDepth; lvl++) {
        const lvlNodes = nodes.filter(d => d.depth === lvl);
        const maxLvlWidth = d3.max(lvlNodes, d => d.nodeWidth) || 220;
        // Clean curve gap between right edge of current level and left edge of next level
        const curveGap = isMobile ? 70 : 95;
        cumulativeX += (maxLvlWidth + curveGap);
        depthOffsets[lvl + 1] = cumulativeX;
      }

      nodes.forEach(d => {
        d.y = depthOffsets[d.depth] || (d.depth * 400);
      });

      // 4. Custom Bezier curve connecting right edge of parent rect to left edge of child
      function linkPath(s, t) {
        const startX = s.y + (s.nodeWidth || 180);
        const startY = s.x;
        const endX = t.y;
        const endY = t.x;
        const midX = (startX + endX) / 2;
        return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
      }

      // 5. Update links
      const link = gLink.selectAll('path').data(links, d => d.target.id);

      const linkEnter = link.enter().append('path')
        .attr('stroke', d => {
          if (d.target.depth === 1) return '#818cf8';
          if (d.target.depth === 2) return '#34d399';
          return '#64748b';
        })
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 2)
        .attr('d', () => {
          const o = { x: source.x0, y: source.y0, nodeWidth: source.nodeWidth || 180 };
          return linkPath(o, o);
        });

      link.merge(linkEnter).transition().duration(duration)
        .attr('d', d => linkPath(d.source, d.target));

      link.exit().transition().duration(duration)
        .attr('d', () => {
          const o = { x: source.x, y: source.y, nodeWidth: source.nodeWidth || 180 };
          return linkPath(o, o);
        })
        .remove();

      // 6. Update nodes
      const node = gNode.selectAll('g.node').data(nodes, d => d.id);

      const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', () => `translate(${source.y0},${source.x0})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .on('click', (event, d) => {
          d.children = d.children ? null : d._children;
          update(d);

          // Smoothly auto-center the clicked node
          const currentScale = d3.zoomTransform(svg.node()).k;
          const targetScale = Math.max(isMobile ? 0.55 : 0.7, Math.min(1.05, currentScale));
          const tx = (width / (isMobile ? 3 : 4)) - (d.y * targetScale);
          const ty = (height / 2) - (d.x * targetScale);

          svg.transition()
            .duration(duration * 1.5)
            .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(targetScale));
        });

      // Node background rect
      nodeEnter.append('rect')
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('height', isMobile ? 40 : 44)
        .attr('y', isMobile ? -20 : -22)
        .attr('width', d => d.nodeWidth)
        .attr('fill', d => {
          if (d.depth === 0) return '#1e1b4b'; // Root deep indigo
          if (d.depth === 1) return '#1e293b'; // Branch slate
          if (d.depth === 2) return '#064e3b'; // Sub-branch dark emerald
          return '#18181b'; // Leaf dark
        })
        .attr('stroke', d => {
          if (d.depth === 0) return '#818cf8';
          if (d.depth === 1) return '#6366f1';
          if (d.depth === 2) return '#10b981';
          return '#3f3f46';
        })
        .attr('stroke-width', d => d.depth === 0 ? 2 : 1.4)
        .style('filter', 'drop-shadow(0 3px 8px rgba(0,0,0,0.45))')
        .style('transition', 'all 0.2s ease');

      // Node text (positioned at x = 16 with plenty of right clearance before circle)
      nodeEnter.append('text')
        .attr('class', 'node-text')
        .attr('dy', '0.34em')
        .attr('x', 16)
        .attr('fill', d => d.depth === 0 ? '#ffffff' : (d.depth === 1 ? '#e2e8f0' : '#cbd5e1'))
        .style('font-family', "'Google Sans', 'Noto Sans Sinhala', 'Inter', sans-serif")
        .style('font-size', d => d.depth === 0 ? (isMobile ? '14px' : '15px') : (d.depth === 1 ? (isMobile ? '13px' : '14px') : '12.5px'))
        .style('font-weight', d => d.depth <= 1 ? '700' : '500')
        .text(d => d.data.name);

      // Expand/Collapse Indicator Circle (centered on right border with generous gap from text)
      nodeEnter.append('circle')
        .attr('class', 'indicator-circle')
        .attr('cx', d => d.nodeWidth)
        .attr('cy', 0)
        .attr('r', isMobile ? 10 : 11)
        .attr('fill', '#131314')
        .attr('stroke', '#81c995')
        .attr('stroke-width', 2)
        .style('display', d => d._children ? 'inline' : 'none');

      nodeEnter.append('text')
        .attr('class', 'indicator-icon')
        .attr('x', d => d.nodeWidth)
        .attr('y', 1)
        .attr('dy', '0.34em')
        .attr('text-anchor', 'middle')
        .attr('fill', '#81c995')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .style('display', d => d._children ? 'inline' : 'none')
        .text(d => d.children ? '<' : '>');

      // Hover effects
      nodeEnter.on('mouseover', function (event, d) {
        d3.select(this).select('rect')
          .attr('stroke', '#38bdf8')
          .attr('stroke-width', 2.2);
      }).on('mouseout', function (event, d) {
        d3.select(this).select('rect')
          .attr('stroke', d.depth === 0 ? '#818cf8' : (d.depth === 1 ? '#6366f1' : (d.depth === 2 ? '#10b981' : '#3f3f46')))
          .attr('stroke-width', d.depth === 0 ? 2 : 1.4);
      });

      const nodeUpdate = node.merge(nodeEnter).transition().duration(duration)
        .attr('transform', d => `translate(${d.y},${d.x})`)
        .attr('fill-opacity', 1)
        .attr('stroke-opacity', 1);

      nodeUpdate.select('rect')
        .attr('width', d => d.nodeWidth);

      nodeUpdate.select('.indicator-circle')
        .attr('cx', d => d.nodeWidth);

      nodeUpdate.select('.indicator-icon')
        .attr('x', d => d.nodeWidth)
        .text(d => d.children ? '<' : '>');

      const nodeExit = node.exit().transition().duration(duration)
        .attr('transform', () => `translate(${source.y},${source.x})`)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .remove();

      nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    update(root);

    // Initial positioning: auto-fit to screen geometry
    const fitTimer = setTimeout(() => {
      fitToScreen(false);
    }, 60);

    const handleResize = () => {
      fitToScreen(false);
    };
    window.addEventListener('resize', handleResize);

    // Helper functions for controls
    container.expandAll = () => {
      root.descendants().forEach(d => {
        if (d._children) d.children = d._children;
      });
      update(root);
      setTimeout(() => fitToScreen(true), 420);
    };

    container.collapseAll = () => {
      root.descendants().forEach(d => {
        if (d.depth >= 1 && d._children) d.children = null;
      });
      update(root);
      setTimeout(() => fitToScreen(true), 420);
    };

    container.resetView = () => {
      fitToScreen(true);
    };

    container.zoomBy = (factor) => {
      svg.transition().duration(300).call(zoom.scaleBy, factor);
    };

    return () => {
      clearTimeout(fitTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [initialData, unit]);

  const handleExpandAll = () => {
    containerRef.current?.expandAll?.();
  };

  const handleCollapseAll = () => {
    containerRef.current?.collapseAll?.();
  };

  const handleReset = () => {
    containerRef.current?.resetView?.();
  };

  const handleZoomIn = () => {
    containerRef.current?.zoomBy?.(1.3);
  };

  const handleZoomOut = () => {
    containerRef.current?.zoomBy?.(0.7);
  };

  return (
    <div className={`ptm-modal-backdrop mindmap-modal-backdrop ${isFullscreen ? 'fullscreen' : ''}`} onClick={onClose}>
      <div className="ptm-mindmap-modal-content" onClick={e => e.stopPropagation()}>
        {/* NotebookLM Header - Responsive 2-Tier on Mobile */}
        <div className="mindmap-header">
          {/* Top Row: Title + Primary Actions */}
          <div className="mindmap-header-top-row">
            <div className="mindmap-header-left">
              <button className="btn-modal-back-mobile" onClick={onClose} title="Back">
                <ArrowLeft size={18} />
              </button>
              <div className="mindmap-brand-badge hide-on-mobile">
                <GitFork size={16} className="text-emerald-400" />
                <span>Mind Map</span>
              </div>
              <div className="mindmap-title-box">
                <h3 className="mindmap-unit-title">
                  {unit.title}
                </h3>
              </div>
            </div>

            <div className="mindmap-header-right-actions">
              {onOpenStudyGuide && (
                <button className="btn-switch-theory" onClick={onOpenStudyGuide} title="Open Master Guide">
                  <BookOpen size={14} /> <span className="hide-on-mobile">Full Theory Note</span>
                </button>
              )}
              <button 
                className="btn-mindmap-tool icon-only" 
                onClick={() => setIsFullscreen(prev => !prev)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button className="btn-modal-close" onClick={onClose} title="Close Mind Map">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Sub Row: Horizontal Scrollable Toolstrip */}
          <div className="mindmap-toolbar-strip no-scrollbar">
            <button className="btn-mindmap-tool-pill" onClick={handleExpandAll}>
              <Layers size={13} /> <span>Expand All</span>
            </button>
            <button className="btn-mindmap-tool-pill" onClick={handleCollapseAll}>
              <ChevronRight size={13} /> <span>Collapse</span>
            </button>
            <button className="btn-mindmap-tool-pill" onClick={handleReset}>
              <RotateCcw size={13} /> <span>Reset View</span>
            </button>
            <button className="btn-mindmap-tool-pill" onClick={handleZoomIn}>
              <ZoomIn size={13} /> <span>Zoom +</span>
            </button>
            <button className="btn-mindmap-tool-pill" onClick={handleZoomOut}>
              <ZoomOut size={13} /> <span>Zoom -</span>
            </button>
          </div>
        </div>

        {/* D3 Mindmap Canvas Area */}
        <div className="mindmap-canvas-area" ref={containerRef}></div>

        {/* Mindmap Footer Legend & Guidance */}
        <div className="mindmap-footer-bar">
          <div className="legend-items no-scrollbar">
            <span className="legend-item"><span className="legend-dot dot-root"></span> Unit</span>
            <span className="legend-item"><span className="legend-dot dot-l1"></span> L1 Competencies</span>
            <span className="legend-item"><span className="legend-dot dot-l2"></span> L2 Formulas</span>
            <span className="legend-item"><span className="legend-dot dot-l3"></span> L3 Applications</span>
          </div>

          <div className="mindmap-tip hide-on-mobile">
            <HelpCircle size={13} className="text-amber-400" />
            <span>Click node to expand. Pinch/Drag to pan.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
