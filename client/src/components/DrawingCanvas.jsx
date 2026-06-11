import React, { useRef, useState, useEffect } from 'react';

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#000000', '#ffffff',
];
const TOOLS = [
  { id: 'pen',    label: '✏️', title: 'قلم' },
  { id: 'arrow',  label: '↗',  title: 'سهم' },
  { id: 'rect',   label: '▭',  title: 'مستطيل' },
  { id: 'circle', label: '◯',  title: 'دائرة' },
  { id: 'text',   label: 'T',  title: 'نص' },
  { id: 'eraser', label: '◻',  title: 'ممحاة' },
];
const SIZES = [3, 6, 12, 22];

export default function DrawingCanvas({ imageUrl, existingNote, allNotes = [], onSave, onClose }) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const historyRef   = useRef([]);
  const historyIdxRef = useRef(-1);
  const drawingRef   = useRef(false);
  const lastPosRef   = useRef(null);
  const startPosRef  = useRef(null);
  const snapshotRef  = useRef(null);

  const [tool, setTool]           = useState('pen');
  const [color, setColor]         = useState('#ef4444');
  const [size, setSize]           = useState(6);
  const [showImport, setShowImport] = useState(false);
  const [textInput, setTextInput] = useState(null);
  const [textVal, setTextVal]     = useState('');
  const [, tick] = useState(0);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const h = historyRef.current.slice(0, historyIdxRef.current + 1);
    h.push(dataUrl);
    if (h.length > 25) h.shift();
    historyRef.current = h;
    historyIdxRef.current = h.length - 1;
    tick(n => n + 1);
  };

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    const src = existingNote || imageUrl;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxW = Math.min(container.clientWidth - 24, 860);
      const maxH = 520;
      const s = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      canvas.width  = Math.round(img.naturalWidth  * s);
      canvas.height = Math.round(img.naturalHeight * s);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      saveHistory();
    };
    img.onerror = () => {
      canvas.width = 700; canvas.height = 450;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 16px Cairo,sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('اضغط للرسم على هذه المنطقة', canvas.width / 2, canvas.height / 2);
      saveHistory();
    };
    const isData = typeof src === 'string' && src.startsWith('data:');
    img.src = isData ? src : (src + (src.includes('?') ? '&' : '?') + 't=' + Date.now());
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width  / rect.width;
    const sy = canvas.height / rect.height;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * sx, y: (cy - rect.top) * sy, sx: cx, sy: cy };
  };

  const drawArrow = (ctx, x1, y1, x2, y2) => {
    const hl = Math.max(16, size * 3.5);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hl * Math.cos(angle - Math.PI / 6), y2 - hl * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - hl * Math.cos(angle + Math.PI / 6), y2 - hl * Math.sin(angle + Math.PI / 6));
    ctx.closePath(); ctx.fillStyle = color; ctx.fill();
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    startPosRef.current = pos;
    lastPosRef.current  = pos;

    if (tool === 'text') {
      const canvas = canvasRef.current;
      const rect   = canvas.getBoundingClientRect();
      const dsx = pos.x / (canvas.width  / rect.width);
      const dsy = pos.y / (canvas.height / rect.height);
      setTextInput({ screenX: rect.left + dsx, screenY: rect.top + dsy, canvasX: pos.x, canvasY: pos.y });
      setTextVal('');
      return;
    }

    drawingRef.current = true;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    if (['arrow', 'rect', 'circle'].includes(tool)) {
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return;
    }

    if (tool === 'pen') {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,1)'; ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  const onMouseMove = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const pos    = getPos(e);
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    if (tool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = color; ctx.lineWidth = size;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
      lastPosRef.current = pos;
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.lineWidth = size * 5; ctx.lineCap = 'round'; ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      lastPosRef.current = pos;
    } else if (['arrow', 'rect', 'circle'].includes(tool) && snapshotRef.current) {
      ctx.putImageData(snapshotRef.current, 0, 0);
      const s = startPosRef.current;
      ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = 'round';
      if (tool === 'arrow') {
        drawArrow(ctx, s.x, s.y, pos.x, pos.y);
      } else if (tool === 'rect') {
        ctx.strokeRect(s.x, s.y, pos.x - s.x, pos.y - s.y);
      } else if (tool === 'circle') {
        const rx = (pos.x - s.x) / 2;
        const ry = (pos.y - s.y) / 2;
        ctx.beginPath();
        ctx.ellipse(s.x + rx, s.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const onMouseUp = (e) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (['arrow', 'rect', 'circle'].includes(tool)) {
      const pos    = getPos(e);
      const canvas = canvasRef.current;
      const ctx    = canvas.getContext('2d');
      if (snapshotRef.current) ctx.putImageData(snapshotRef.current, 0, 0);
      const s = startPosRef.current;
      ctx.strokeStyle = color; ctx.lineWidth = size; ctx.lineCap = 'round';
      if (tool === 'arrow') { drawArrow(ctx, s.x, s.y, pos.x, pos.y); }
      else if (tool === 'rect') { ctx.strokeRect(s.x, s.y, pos.x - s.x, pos.y - s.y); }
      else if (tool === 'circle') {
        const rx = (pos.x - s.x) / 2;
        const ry = (pos.y - s.y) / 2;
        ctx.beginPath();
        ctx.ellipse(s.x + rx, s.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    saveHistory();
  };

  const commitText = () => {
    if (!textInput) return;
    if (textVal.trim()) {
      const ctx      = canvasRef.current.getContext('2d');
      const fontSize = Math.max(16, size * 4);
      ctx.font          = `bold ${fontSize}px Cairo,Arial,sans-serif`;
      ctx.textBaseline  = 'top';
      ctx.shadowColor   = color === '#ffffff' ? '#000' : 'rgba(255,255,255,0.8)';
      ctx.shadowBlur    = 3;
      ctx.fillStyle     = color;
      ctx.fillText(textVal, textInput.canvasX, textInput.canvasY);
      ctx.shadowBlur    = 0;
      saveHistory();
    }
    setTextInput(null); setTextVal('');
  };

  const undo = () => {
    const idx = historyIdxRef.current;
    if (idx <= 0) return;
    historyIdxRef.current = idx - 1;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const img    = new Image();
    img.onload = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0); };
    img.src = historyRef.current[idx - 1];
    tick(n => n + 1);
  };

  const handleImport = (data) => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const img    = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      saveHistory(); setShowImport(false);
    };
    img.src = data;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const exp    = document.createElement('canvas');
    exp.width    = canvas.width;
    exp.height   = canvas.height;
    const ectx   = exp.getContext('2d');
    ectx.fillStyle = '#ffffff';
    ectx.fillRect(0, 0, exp.width, exp.height);
    ectx.drawImage(canvas, 0, 0);
    onSave(exp.toDataURL('image/jpeg', 0.9));
  };

  const canUndo = historyIdxRef.current > 0;
  const btnBase = { border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none', transition: 'all 0.12s' };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: '97vw', width: 1000, maxHeight: '97vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div className="modal-header" style={{ padding: '11px 16px', flexShrink: 0 }}>
          <span className="modal-title">✏️ نوت القلم — تعليق على الصورة</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* ── Toolbar ── */}
        <div style={{ padding: '8px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>

          {/* Tools */}
          <div style={{ display: 'flex', gap: 3 }}>
            {TOOLS.map(t => (
              <button key={t.id} title={t.title} onClick={() => setTool(t.id)} style={{ ...btnBase, width: 36, height: 36, borderRadius: 8, border: `2px solid ${tool === t.id ? '#2563eb' : '#e2e8f0'}`, background: tool === t.id ? '#dbeafe' : 'white', fontSize: t.id === 'text' ? 15 : 17, fontWeight: 900, color: tool === t.id ? '#2563eb' : '#64748b', fontFamily: t.id === 'text' ? 'Cairo,serif' : 'inherit' }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 30, background: '#e2e8f0', flexShrink: 0 }} />

          {/* Colors */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{ ...btnBase, width: 26, height: 26, borderRadius: '50%', background: c, border: color === c ? '3px solid #2563eb' : '1.5px solid #cbd5e1', transform: color === c ? 'scale(1.2)' : 'scale(1)' }} />
            ))}
          </div>

          <div style={{ width: 1, height: 30, background: '#e2e8f0', flexShrink: 0 }} />

          {/* Sizes */}
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {SIZES.map(s => (
              <button key={s} title={`حجم ${s}`} onClick={() => setSize(s)} style={{ ...btnBase, width: 34, height: 34, borderRadius: 8, border: `2px solid ${size === s ? '#2563eb' : '#e2e8f0'}`, background: size === s ? '#dbeafe' : 'white' }}>
                <div style={{ width: Math.min(s + 2, 20), height: Math.min(s + 2, 20), borderRadius: '50%', background: size === s ? '#2563eb' : '#94a3b8' }} />
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 30, background: '#e2e8f0', flexShrink: 0 }} />

          {/* Undo */}
          <button onClick={undo} disabled={!canUndo} title="تراجع" style={{ ...btnBase, width: 36, height: 36, borderRadius: 8, border: '1.5px solid #e2e8f0', background: canUndo ? 'white' : '#f8fafc', cursor: canUndo ? 'pointer' : 'not-allowed', color: canUndo ? '#334155' : '#cbd5e1', fontSize: 19 }}>↩</button>

          {/* Import */}
          {allNotes.length > 0 && (
            <button onClick={() => setShowImport(v => !v)} style={{ ...btnBase, padding: '5px 10px', borderRadius: 8, border: `1.5px solid ${showImport ? '#2563eb' : '#e2e8f0'}`, background: showImport ? '#dbeafe' : 'white', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo,sans-serif', fontWeight: 600, color: showImport ? '#2563eb' : '#475569', whiteSpace: 'nowrap', gap: 4 }}>
              📥 استيراد رسمة <span style={{ background: '#2563eb', color: 'white', borderRadius: 99, fontSize: 10, padding: '1px 5px' }}>{allNotes.length}</span>
            </button>
          )}

          {/* Active tool indicator */}
          <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b', fontFamily: 'Cairo,sans-serif' }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: color, border: '1.5px solid #e2e8f0' }} />
            {TOOLS.find(t => t.id === tool)?.title}
          </div>
        </div>

        {/* ── Import panel ── */}
        {showImport && (
          <div style={{ padding: '10px 14px', background: '#f0f9ff', borderBottom: '1px solid #bfdbfe', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', flexShrink: 0, fontFamily: 'Cairo,sans-serif' }}>اختر رسمة سابقة للاستيراد:</span>
            {allNotes.map((n, i) => (
              <div key={i} onClick={() => handleImport(n.data)} title={'استيراد: ' + n.label} style={{ cursor: 'pointer', border: '2px solid #bfdbfe', borderRadius: 8, overflow: 'hidden', flexShrink: 0, transition: 'border-color 0.15s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'} onMouseLeave={e => e.currentTarget.style.borderColor = '#bfdbfe'}>
                <img src={n.data} alt={n.label} style={{ width: 88, height: 66, objectFit: 'cover', display: 'block' }} />
                <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#475569', padding: '3px 5px', background: 'white', textAlign: 'center', maxWidth: 88, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Canvas area ── */}
        <div ref={containerRef} style={{ flex: 1, overflow: 'auto', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14, minHeight: 280 }}>
          <canvas
            ref={canvasRef}
            style={{ display: 'block', cursor: tool === 'eraser' ? 'cell' : tool === 'text' ? 'text' : 'crosshair', borderRadius: 4, boxShadow: '0 4px 28px rgba(0,0,0,0.55)', maxWidth: '100%' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={() => { if (drawingRef.current) { drawingRef.current = false; saveHistory(); } }}
            onTouchStart={e => { e.preventDefault(); onMouseDown(e); }}
            onTouchMove={e => { e.preventDefault(); onMouseMove(e); }}
            onTouchEnd={e => { onMouseUp(e); }}
          />
        </div>

        {/* ── Text input overlay (fixed) ── */}
        {textInput && (
          <input
            autoFocus
            type="text"
            value={textVal}
            onChange={e => setTextVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitText(); if (e.key === 'Escape') { setTextInput(null); setTextVal(''); } }}
            onBlur={commitText}
            placeholder="اكتب نصاً ثم Enter..."
            style={{ position: 'fixed', left: textInput.screenX, top: textInput.screenY - 14, minWidth: 140, padding: '5px 10px', background: 'rgba(255,255,255,0.97)', border: `2px solid ${color}`, borderRadius: 6, fontSize: 14, fontFamily: 'Cairo,sans-serif', color, outline: 'none', zIndex: 99999, boxShadow: '0 2px 18px rgba(0,0,0,0.4)' }}
          />
        )}

        {/* ── Footer ── */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'Cairo,sans-serif' }}>ارسم على الصورة ثم احفظ • ستظهر في الـ PDF تحت الصورة</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
            <button className="btn btn-primary" onClick={handleSave}>💾 حفظ نوت القلم</button>
          </div>
        </div>
      </div>
    </div>
  );
}
