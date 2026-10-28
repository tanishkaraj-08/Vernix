import React, { useState, useEffect, useRef } from 'react';
import { Complaint, Institution, OverlapMatch } from '../../types';
import { getComplaints, getInstitutions, getOverlapMatches, subscribeToStore } from '../../lib/storage';
import { useNavigate } from 'react-router-dom';
import { Share2, ZoomIn, ZoomOut, RotateCcw, Filter, Sparkles, Building2, FileText, Layers } from 'lucide-react';

interface Node {
  id: string;
  label: string;
  type: 'INSTITUTION' | 'RB_COMPLAINT' | 'PGRC_COMPLAINT' | 'OTHER_COMPLAINT';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  raw: any;
}

interface Edge {
  source: string;
  target: string;
  type: 'INSTITUTION_CASE' | 'OVERLAP_MATCH';
  label?: string;
  score?: number;
  isConfirmed?: boolean;
}

export const CaseRelationshipGraph: React.FC<{ selectedInstitutionId?: string }> = ({ selectedInstitutionId }) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [filterInst, setFilterInst] = useState<string>(selectedInstitutionId || 'ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE_ONLY'>('ALL');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [overlaps, setOverlaps] = useState<OverlapMatch[]>([]);

  const loadData = () => {
    setInstitutions(getInstitutions());
    setComplaints(getComplaints());
    setOverlaps(getOverlapMatches());
  };

  useEffect(() => {
    loadData();
    return subscribeToStore(loadData);
  }, []);

  // Filter complaints based on selection
  const filteredComplaints = complaints.filter(c => {
    if (filterInst !== 'ALL' && c.institutionId !== filterInst) return false;
    if (filterStatus === 'ACTIVE_ONLY' && c.currentStatus === 'Disposed') return false;
    return true;
  });

  const activeInstitutionIds = new Set(filteredComplaints.map(c => c.institutionId));
  const filteredInstitutions = institutions.filter(i => 
    filterInst === 'ALL' ? activeInstitutionIds.has(i.id) : i.id === filterInst
  );

  // Simulation state
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);

  useEffect(() => {
    // Build Nodes & Edges
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const width = 800;
    const height = 520;
    const centerX = width / 2;
    const centerY = height / 2;

    // Add Institution Nodes
    filteredInstitutions.forEach((inst, idx) => {
      const angle = (idx / Math.max(1, filteredInstitutions.length)) * 2 * Math.PI;
      const dist = filteredInstitutions.length === 1 ? 0 : 160;
      nodes.push({
        id: inst.id,
        label: inst.shortName || inst.name.substring(0, 20),
        type: 'INSTITUTION',
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: 24,
        raw: inst,
      });
    });

    // Add Complaint Nodes around their institutions
    const instNodeMap = new Map(nodes.map(n => [n.id, n]));

    filteredComplaints.forEach((c, idx) => {
      const parentNode = instNodeMap.get(c.institutionId);
      const angle = (idx / Math.max(1, filteredComplaints.length)) * 2 * Math.PI + Math.random() * 0.4;
      const dist = 90 + Math.random() * 40;

      const px = parentNode ? parentNode.x + Math.cos(angle) * dist : centerX + Math.random() * 200 - 100;
      const py = parentNode ? parentNode.y + Math.sin(angle) * dist : centerY + Math.random() * 200 - 100;

      const nodeType = c.bureau === 'RB' ? 'RB_COMPLAINT' : c.bureau === 'PGRC' ? 'PGRC_COMPLAINT' : 'OTHER_COMPLAINT';

      nodes.push({
        id: c.id,
        label: c.id,
        type: nodeType,
        x: px,
        y: py,
        vx: 0,
        vy: 0,
        radius: 16,
        raw: c,
      });

      // Edge from institution to complaint
      edges.push({
        source: c.institutionId,
        target: c.id,
        type: 'INSTITUTION_CASE',
      });
    });

    // Add Overlap Edges
    const complaintNodeIds = new Set(nodes.map(n => n.id));
    overlaps.forEach(o => {
      if (complaintNodeIds.has(o.complaint1Id) && complaintNodeIds.has(o.complaint2Id)) {
        edges.push({
          source: o.complaint1Id,
          target: o.complaint2Id,
          type: 'OVERLAP_MATCH',
          score: o.matchScore,
          label: `${o.matchScore}% Match`,
          isConfirmed: o.status === 'CONFIRMED_RELATED' || o.status === 'COORDINATION_CREATED',
        });
      }
    });

    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [filterInst, filterStatus, institutions, complaints, overlaps]);

  // Animation and force simulation loop
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const nodes = nodesRef.current;
      const edges = edgesRef.current;

      // Force iteration
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = nodes[i].radius + nodes[j].radius + 35;

          if (dist < minDist) {
            const force = (minDist - dist) / dist * 0.08;
            nodes[i].x -= dx * force;
            nodes[i].y -= dy * force;
            nodes[j].x += dx * force;
            nodes[j].y += dy * force;
          }
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(panOffset.x, panOffset.y);
      ctx.scale(zoomLevel, zoomLevel);

      // Draw Edges
      edges.forEach(e => {
        const s = nodes.find(n => n.id === e.source);
        const t = nodes.find(n => n.id === e.target);
        if (!s || !t) return;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);

        if (e.type === 'OVERLAP_MATCH') {
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = e.isConfirmed ? '#7c3aed' : '#d97706';
          ctx.lineWidth = e.isConfirmed ? 3 : 2;
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw label badge
          const midX = (s.x + t.x) / 2;
          const midY = (s.y + t.y) / 2;
          ctx.fillStyle = e.isConfirmed ? '#f5f3ff' : '#fef3c7';
          ctx.strokeStyle = e.isConfirmed ? '#c4b5fd' : '#fde68a';
          ctx.lineWidth = 1;
          ctx.fillRect(midX - 28, midY - 10, 56, 18);
          ctx.strokeRect(midX - 28, midY - 10, 56, 18);

          ctx.fillStyle = e.isConfirmed ? '#6d28d9' : '#b45309';
          ctx.font = 'bold 9px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(e.label || 'Overlap', midX, midY);
        } else {
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // Draw Nodes
      nodes.forEach(n => {
        const isSelected = selectedNode?.id === n.id;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + (isSelected ? 3 : 0), 0, 2 * Math.PI);

        if (n.type === 'INSTITUTION') {
          ctx.fillStyle = isSelected ? '#1e40af' : '#2563eb';
          ctx.strokeStyle = '#dbeafe';
          ctx.lineWidth = 4;
        } else if (n.type === 'RB_COMPLAINT') {
          ctx.fillStyle = isSelected ? '#1d4ed8' : '#3b82f6';
          ctx.strokeStyle = '#eff6ff';
          ctx.lineWidth = 3;
        } else if (n.type === 'PGRC_COMPLAINT') {
          ctx.fillStyle = isSelected ? '#4338ca' : '#6366f1';
          ctx.strokeStyle = '#eef2ff';
          ctx.lineWidth = 3;
        } else {
          ctx.fillStyle = '#64748b';
          ctx.strokeStyle = '#f1f5f9';
          ctx.lineWidth = 2;
        }

        ctx.fill();
        ctx.stroke();

        // Node Label
        ctx.fillStyle = '#0f172a';
        ctx.font = n.type === 'INSTITUTION' ? 'bold 11px Inter, sans-serif' : '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw icon / text inside node
        ctx.fillStyle = '#ffffff';
        if (n.type === 'INSTITUTION') {
          ctx.fillText('🏛️', n.x, n.y - 1);
        } else {
          ctx.fillText(n.type === 'RB_COMPLAINT' ? 'RB' : 'PG', n.x, n.y);
        }

        // Draw label underneath
        ctx.fillStyle = '#1e293b';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(n.label, n.x, n.y + n.radius + 12);
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [zoomLevel, panOffset, selectedNode]);

  // Handle canvas click to select node
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
    const mouseY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

    const clicked = nodesRef.current.find(n => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 5;
    });

    setSelectedNode(clicked || null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
      {/* Header Controls */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Cross-Bureau Case & Institution Relationship Network
            </h3>
            <p className="text-xs text-slate-500">
              Visual graph displaying institution hubs, open cases across RB and PGRC, and AI-detected overlap bridges
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <select
            value={filterInst}
            onChange={(e) => setFilterInst(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
          >
            <option value="ALL">All Institutions Combined</option>
            {institutions.map(i => (
              <option key={i.id} value={i.id}>{i.shortName} ({i.id})</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-800"
          >
            <option value="ALL">All Cases (Active & Disposed)</option>
            <option value="ACTIVE_ONLY">Active Cases Only</option>
          </select>

          {/* Zoom controls */}
          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.15))}
              className="p-1.5 hover:bg-slate-100 text-slate-600"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.15))}
              className="p-1.5 hover:bg-slate-100 text-slate-600 border-l border-slate-200"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); setSelectedNode(null); }}
              className="p-1.5 hover:bg-slate-100 text-slate-600 border-l border-slate-200"
              title="Reset view"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-b border-slate-100 bg-white flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
        <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Legend:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 inline-block border-2 border-blue-200" />
          Institution Hub
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block border border-blue-100" />
          RB Bureau Case
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block border border-indigo-100" />
          PGRC Bureau Case
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 border-t-2 border-dashed border-amber-500 inline-block" />
          Potential AI Overlap Link
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-6 h-0.5 border-t-2 border-dashed border-purple-600 inline-block" />
          Confirmed Joint Coordination
        </span>
      </div>

      {/* Canvas Viewport + Side Inspector */}
      <div className="relative flex flex-col lg:flex-row">
        <div className="flex-1 bg-slate-50 relative min-h-[460px] overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={480}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-crosshair"
          />
        </div>

        {/* Selected Node Inspector Drawer */}
        {selectedNode && (
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 p-4 bg-white space-y-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-800 text-sm">Node Details</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {selectedNode.type === 'INSTITUTION' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-bold text-slate-900">{selectedNode.raw.name}</div>
                    <div className="text-[11px] text-slate-500">ID: {selectedNode.raw.id}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                  <div>Region: <strong>{selectedNode.raw.region}</strong></div>
                  <div>State: <strong>{selectedNode.raw.state}</strong></div>
                  <div>Total Cases: <strong>{selectedNode.raw.totalComplaints}</strong></div>
                  <div>Open Cases: <strong>{selectedNode.raw.openComplaints}</strong></div>
                </div>
                <button
                  onClick={() => navigate(`/institutions/${selectedNode.raw.id}`)}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition-colors"
                >
                  View Full Institution Profile →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 font-mono">{selectedNode.raw.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedNode.raw.bureau} Bureau
                  </span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Category</div>
                  <div className="font-semibold text-slate-800">{selectedNode.raw.category}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Subject</div>
                  <div className="text-slate-800">{selectedNode.raw.subject}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                  <div>Status: <strong>{selectedNode.raw.currentStatus}</strong></div>
                  <div>Priority: <strong>{selectedNode.raw.priority}</strong></div>
                  <div>Lodged: <strong>{selectedNode.raw.submissionDate}</strong></div>
                  <div>Officer: <strong>{selectedNode.raw.assignedOfficerName || 'Unassigned'}</strong></div>
                </div>
                <button
                  onClick={() => navigate(`/complaints/${selectedNode.raw.id}`)}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition-colors"
                >
                  Open Case Journey Details →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
