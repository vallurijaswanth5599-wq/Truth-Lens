import React, { useState } from 'react';
import {
  Type, Image as ImageIcon, Mic, Video as VideoIcon, FileText,
  Link as LinkIcon, Sparkles, Upload, CheckCircle2, XCircle,
  Volume2, Film, FileCheck, Globe, Layers, ArrowRight, AlertCircle,
  Lock, Shield
} from 'lucide-react';
import { benchmarkCases } from '../data/benchmarkCases';

const modalities = [
  {
    id: 'text',
    label: 'Text',
    sublabel: 'Claims & News',
    icon: Type,
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
    activeBg: 'rgba(245,158,11,0.08)',
    glow: 'rgba(245,158,11,0.2)',
    desc: 'Verify written claims, news headlines, tweets, or statements',
    accept: null,
  },
  {
    id: 'image',
    label: 'Image',
    sublabel: 'EXIF & ELA',
    icon: ImageIcon,
    color: '#22d3ee',
    bg: 'rgba(6,182,212,0.1)',
    border: 'rgba(6,182,212,0.25)',
    activeBg: 'rgba(6,182,212,0.08)',
    glow: 'rgba(6,182,212,0.2)',
    desc: 'Inspect photos for AI diffusion, Photoshop edits, and EXIF data',
    accept: 'image/*',
  },
  {
    id: 'audio',
    label: 'Audio',
    sublabel: 'Voice Cloning',
    icon: Mic,
    color: '#34d399',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.25)',
    activeBg: 'rgba(16,185,129,0.08)',
    glow: 'rgba(16,185,129,0.2)',
    desc: 'Detect AI voice cloning, deepfake robocalls & audio splices',
    accept: 'audio/*',
  },
  {
    id: 'video',
    label: 'Video',
    sublabel: 'Deepfake',
    icon: VideoIcon,
    color: '#c084fc',
    bg: 'rgba(168,85,247,0.1)',
    border: 'rgba(168,85,247,0.25)',
    activeBg: 'rgba(168,85,247,0.08)',
    glow: 'rgba(168,85,247,0.2)',
    desc: 'Analyze video clips for lip-sync anomalies & synthetic frames',
    accept: 'video/*',
  },
  {
    id: 'document',
    label: 'Document',
    sublabel: 'PDF & Leaks',
    icon: FileText,
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.1)',
    border: 'rgba(99,102,241,0.25)',
    activeBg: 'rgba(99,102,241,0.08)',
    glow: 'rgba(99,102,241,0.2)',
    desc: 'Scan PDF reports, policy leaks & official documents',
    accept: '.pdf,.doc,.docx,.txt',
  },
  {
    id: 'url',
    label: 'URL',
    sublabel: 'Phishing',
    icon: LinkIcon,
    color: '#fb7185',
    bg: 'rgba(244,63,94,0.1)',
    border: 'rgba(244,63,94,0.25)',
    activeBg: 'rgba(244,63,94,0.08)',
    glow: 'rgba(244,63,94,0.2)',
    desc: 'Audit web links for domain age, phishing risk & SSL validity',
    accept: null,
  },
];

function DropZone({ modality, isDragging, onDragOver, onDragLeave, onDrop, onChange }) {
  const Icon = modality.icon;
  const formats = {
    image: 'PNG, JPG, WEBP, BMP — up to 50MB',
    audio: 'MP3, WAV, M4A, OGG, AAC — up to 100MB',
    video: 'MP4, MOV, WEBM, AVI — up to 500MB',
    document: 'PDF, DOCX, TXT — up to 100MB',
  };

  return (
    <label
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        display: 'block',
        border: `2px dashed ${isDragging ? modality.color : modality.border}`,
        borderRadius: '20px',
        padding: '3rem 2rem',
        textAlign: 'center',
        cursor: 'pointer',
        background: isDragging ? modality.bg : 'rgba(255,255,255,0.015)',
        transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isDragging ? `0 0 0 4px ${modality.glow}, 0 20px 50px rgba(0,0,0,0.4)` : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated border on hover is handled via CSS isDragging */}
      <div style={{
        width: '64px', height: '64px',
        borderRadius: '18px',
        background: modality.bg,
        border: `1px solid ${modality.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.25rem',
        boxShadow: `0 8px 24px ${modality.glow}`,
      }}>
        <Icon size={28} color={modality.color} />
      </div>
      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f4ff', marginBottom: '0.375rem' }}>
        {isDragging ? 'Drop to analyze' : `Drop ${modality.label} file or click to browse`}
      </p>
      <p style={{ fontSize: '0.8125rem', color: '#4f5b8a', fontFamily: 'JetBrains Mono, monospace' }}>
        {formats[modality.id] || 'Drag & drop supported'}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
        {['OCR Ready', 'Forensic AI', 'Privacy Safe'].map(tag => (
          <span key={tag} style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: modality.color,
            background: modality.bg,
            border: `1px solid ${modality.border}`,
            borderRadius: '100px',
            padding: '2px 8px',
            fontFamily: 'JetBrains Mono, monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            {tag}
          </span>
        ))}
      </div>
      <input
        type="file"
        style={{ display: 'none' }}
        accept={modality.accept}
        onChange={onChange}
      />
    </label>
  );
}

export default function InputPanel({ onStartVerification, isProcessing }) {
  const [activeModality, setActiveModality] = useState('text');
  const [inputContent, setInputContent] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [userConsent, setUserConsent] = useState(true);
  const [fileObject, setFileObject] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentMod = modalities.find(m => m.id === activeModality) || modalities[0];

  const handleSelectPreset = (e) => {
    const presetId = e.target.value;
    setSelectedPresetId(presetId);
    if (!presetId) return;
    const matched = benchmarkCases.find(c => c.id === presetId);
    if (matched) {
      setActiveModality(matched.type);
      setInputContent(matched.input);
      setFileObject(null);
      if (matched.type === 'image' || matched.type === 'video' || matched.type === 'audio') {
        setMediaPreviewUrl(matched.input.startsWith('http') ? matched.input : null);
        setFileMetadata({
          name: `${matched.title.substring(0, 24)}.${matched.type === 'audio' ? 'wav' : matched.type === 'video' ? 'mp4' : 'jpg'}`,
          size: '3.4 MB',
          type: `${matched.type}/preset`,
        });
      } else {
        setMediaPreviewUrl(null);
        setFileMetadata(null);
      }
    }
  };

  const [fileBase64Data, setFileBase64Data] = useState(null);

  const handleFileProcess = (file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setFileObject(file);
    setMediaPreviewUrl(previewUrl);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileMetadata({ name: file.name, size: `${sizeInMB} MB`, type: file.type || activeModality });
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileBase64Data(e.target.result);
    };
    reader.readAsDataURL(file);

    const existingText = inputContent.startsWith('[Uploaded') ? '' : inputContent.trim();
    const tag = `[Uploaded ${activeModality.toUpperCase()}: ${file.name} (${sizeInMB} MB)]`;
    setInputContent(existingText ? `${existingText}\n${tag}` : tag);
  };

  const handleFileChange = (e) => { handleFileProcess(e.target.files?.[0]); };
  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileProcess(e.dataTransfer.files?.[0]);
  };

  const clearUploadedFile = () => {
    setFileObject(null); setMediaPreviewUrl(null);
    setFileMetadata(null); setFileBase64Data(null);
    setInputContent(''); setSelectedPresetId('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const contentToSend = inputContent.trim() || (fileMetadata ? `[Uploaded ${activeModality.toUpperCase()}: ${fileMetadata.name}]` : '');
    if (!contentToSend) return;
    onStartVerification({
      type: activeModality,
      content: contentToSend,
      presetId: selectedPresetId,
      isPreset: !!selectedPresetId,
      fileMetadata,
      fileData: fileBase64Data,
    });
  };

  const wordCount = inputContent.trim() ? inputContent.trim().split(/\s+/).length : 0;

  return (
    <div style={{ position: 'relative' }}>
      {/* Ambient background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 600px 400px at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div
        className="glass-card animate-fade-in-scale"
        style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', position: 'relative', overflow: 'visible' }}
      >
        {/* Top bar: header + preset selector */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={16} color="#818cf8" />
              </div>
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#f0f4ff',
                letterSpacing: '-0.03em',
              }}>
                Multi-Modal Verification Studio
              </h2>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#8b9cc8', paddingLeft: '2.875rem' }}>
              Select a modality below, upload content, or load a benchmark scenario.
            </p>
          </div>

          {/* Preset selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '0.5rem 0.875rem',
            flexShrink: 0,
          }}>
            <Layers size={14} color="#818cf8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b9cc8', whiteSpace: 'nowrap' }}>
              Benchmark:
            </span>
            <select
              value={selectedPresetId}
              onChange={handleSelectPreset}
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: '#f0f4ff',
                border: 'none',
                outline: 'none',
                fontSize: '0.75rem',
                fontFamily: 'inherit',
                maxWidth: '240px',
                cursor: 'pointer',
              }}
            >
              <option value="" style={{ background: '#0a0f1e' }}>— Custom Upload —</option>
              {benchmarkCases.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#0a0f1e' }}>
                  [{c.type.toUpperCase()}] {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modality tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '0.75rem',
          marginBottom: '1.75rem',
        }}>
          {modalities.map(mod => {
            const Icon = mod.icon;
            const isActive = activeModality === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => {
                  setActiveModality(mod.id);
                  if (selectedPresetId) {
                    setSelectedPresetId(''); setInputContent('');
                    setMediaPreviewUrl(null); setFileMetadata(null);
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 0.5rem',
                  borderRadius: '16px',
                  border: `1px solid ${isActive ? mod.border : 'rgba(255,255,255,0.06)'}`,
                  background: isActive ? mod.bg : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                  transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
                  boxShadow: isActive ? `0 8px 24px ${mod.glow}` : 'none',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: '10px',
                  background: isActive ? mod.bg : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={isActive ? mod.color : '#4f5b8a'} />
                </div>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: isActive ? '#f0f4ff' : '#4f5b8a',
                  letterSpacing: '0.01em',
                }}>
                  {mod.label}
                </span>
                <span style={{
                  fontSize: '0.5625rem',
                  color: isActive ? mod.color : '#2d3561',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}>
                  {mod.sublabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active modality description pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 1rem',
          background: 'rgba(255,255,255,0.025)',
          border: `1px solid ${currentMod.border}`,
          borderRadius: '12px',
          marginBottom: '1.5rem',
        }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3125rem',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: currentMod.color,
            background: currentMod.bg,
            border: `1px solid ${currentMod.border}`,
            borderRadius: '100px',
            padding: '2px 8px',
            fontFamily: 'JetBrains Mono, monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}>
            Active: {currentMod.label}
          </span>
          <span style={{ fontSize: '0.8125rem', color: '#8b9cc8' }}>{currentMod.desc}</span>
          {fileMetadata && (
            <span style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              color: '#34d399',
              fontFamily: 'JetBrains Mono, monospace',
              whiteSpace: 'nowrap',
            }}>
              <CheckCircle2 size={13} />
              File loaded
            </span>
          )}
        </div>

        {/* ── Input form ── */}
        <form onSubmit={handleSubmit}>

          {/* TEXT */}
          {activeModality === 'text' && (
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <textarea
                rows={6}
                value={inputContent}
                onChange={e => setInputContent(e.target.value)}
                placeholder="Paste a news headline, viral social post, breaking claim, or any text statement for verification…"
                style={{
                  width: '100%',
                  background: 'rgba(5,7,15,0.8)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '1.125rem 1.25rem',
                  paddingBottom: '2.5rem',
                  fontSize: '0.9375rem',
                  color: '#f0f4ff',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: 1.7,
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  display: 'block',
                }}
                onFocus={e => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.target.style.boxShadow = 'none';
                }}
                required
              />
              <div style={{
                position: 'absolute',
                bottom: '0.75rem',
                right: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.6875rem',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#4f5b8a',
              }}>
                <span>{inputContent.length} chars</span>
                <span>·</span>
                <span>{wordCount} words</span>
              </div>
            </div>
          )}

          {/* URL */}
          {activeModality === 'url' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                <Globe size={16} color={currentMod.color} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="url"
                  value={inputContent}
                  onChange={e => setInputContent(e.target.value)}
                  placeholder="https://news-site-or-suspicious-url.example.com/article"
                  style={{
                    width: '100%',
                    background: 'rgba(5,7,15,0.8)',
                    border: `1px solid ${inputContent.startsWith('http') ? currentMod.border : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '14px',
                    padding: '1rem 1rem 1rem 2.75rem',
                    fontSize: '0.9375rem',
                    color: '#f0f4ff',
                    fontFamily: 'JetBrains Mono, monospace',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={e => { e.target.style.boxShadow = `0 0 0 3px ${currentMod.glow}`; }}
                  onBlur={e => { e.target.style.boxShadow = 'none'; }}
                  required
                />
              </div>
              {inputContent.startsWith('http') && (() => {
                try {
                  const url = new URL(inputContent);
                  return (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 1rem',
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                      <span style={{ color: '#8b9cc8' }}>
                        Target: <strong style={{ color: '#f0f4ff' }}>{url.hostname}</strong>
                      </span>
                      <span style={{ color: currentMod.color, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Shield size={11} />
                        Security Scan Ready
                      </span>
                    </div>
                  );
                } catch { return null; }
              })()}
            </div>
          )}

          {/* IMAGE */}
          {activeModality === 'image' && (
            <div style={{ marginBottom: '1.5rem' }}>
              {(mediaPreviewUrl || inputContent) ? (
                <div style={{
                  background: 'rgba(5,7,15,0.6)',
                  border: `1px solid ${currentMod.border}`,
                  borderRadius: '16px',
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={mediaPreviewUrl || inputContent}
                      alt="Preview"
                      style={{
                        width: '160px', height: '120px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: `1px solid ${currentMod.border}`,
                      }}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400'; }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '6px', right: '6px',
                      background: 'rgba(0,0,0,0.75)',
                      borderRadius: '6px',
                      padding: '2px 6px',
                      fontSize: '0.5625rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      color: currentMod.color,
                      fontWeight: 700,
                    }}>
                      ELA READY
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span className="badge badge-cyan" style={{ fontSize: '0.625rem' }}>PNG / JPG / WEBP</span>
                      <button type="button" onClick={clearUploadedFile} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#fb7185', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        <XCircle size={13} /> Remove
                      </button>
                    </div>
                    <p style={{ fontSize: '0.8125rem', fontFamily: 'JetBrains Mono, monospace', color: '#8b9cc8', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fileMetadata?.name || inputContent}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {[['EXIF Scanner', 'Ready'], ['ELA Analysis', 'Loaded'], ['Diffusion Model', 'Ready'], ['Size', fileMetadata?.size || '—']].map(([k, v]) => (
                        <div key={k} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: '0.5625rem', color: '#4f5b8a', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>{k}</div>
                          <div style={{ fontSize: '0.75rem', color: currentMod.color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <DropZone modality={currentMod} isDragging={isDragging} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onChange={handleFileChange} />
              )}
            </div>
          )}

          {/* AUDIO */}
          {activeModality === 'audio' && (
            <div style={{ marginBottom: '1.5rem' }}>
              {(fileMetadata || inputContent) ? (
                <div style={{ background: 'rgba(5,7,15,0.6)', border: `1px solid ${currentMod.border}`, borderRadius: '16px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: currentMod.bg, border: `1px solid ${currentMod.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mic size={18} color={currentMod.color} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#f0f4ff', fontSize: '0.9375rem' }}>{fileMetadata?.name || 'Audio Clip'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#4f5b8a', fontFamily: 'JetBrains Mono, monospace' }}>{fileMetadata?.size || '–'} · Vocal Track</div>
                      </div>
                    </div>
                    <button type="button" onClick={clearUploadedFile} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#fb7185', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      <XCircle size={13} /> Remove
                    </button>
                  </div>
                  {/* Waveform visualizer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.875rem 1rem', borderRadius: '12px', marginBottom: '0.75rem' }}>
                    <Volume2 size={16} color={currentMod.color} />
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2px', height: '36px' }}>
                      {[40,65,30,85,95,45,60,75,50,90,100,35,70,80,55,65,40,90,85,45,60,75,50,30,90,70,55,80,40,65].map((h, i) => (
                        <div key={i} style={{ flex: 1, borderRadius: '2px', background: `${currentMod.color}60`, height: `${h}%`, animation: `waveBar 1.2s ease-in-out ${i * 0.08}s infinite` }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.625rem', fontFamily: 'JetBrains Mono, monospace', color: currentMod.color, fontWeight: 700, whiteSpace: 'nowrap' }}>SPECTRAL READY</span>
                  </div>
                  {mediaPreviewUrl && (
                    <audio controls style={{ width: '100%', height: '36px', borderRadius: '8px', accentColor: currentMod.color }}>
                      <source src={mediaPreviewUrl} />
                    </audio>
                  )}
                </div>
              ) : (
                <DropZone modality={currentMod} isDragging={isDragging} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onChange={handleFileChange} />
              )}
            </div>
          )}

          {/* VIDEO */}
          {activeModality === 'video' && (
            <div style={{ marginBottom: '1.5rem' }}>
              {(fileMetadata || inputContent) ? (
                <div style={{ background: 'rgba(5,7,15,0.6)', border: `1px solid ${currentMod.border}`, borderRadius: '16px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: currentMod.bg, border: `1px solid ${currentMod.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Film size={18} color={currentMod.color} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#f0f4ff', fontSize: '0.9375rem' }}>{fileMetadata?.name || 'Video File'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#4f5b8a', fontFamily: 'JetBrains Mono, monospace' }}>{fileMetadata?.size || '–'} · Video Track</div>
                      </div>
                    </div>
                    <button type="button" onClick={clearUploadedFile} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#fb7185', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      <XCircle size={13} /> Remove
                    </button>
                  </div>
                  {mediaPreviewUrl && (
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${currentMod.border}`, background: '#000', marginBottom: '0.75rem' }}>
                      <video controls style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }}>
                        <source src={mediaPreviewUrl} />
                      </video>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[['Frame Extraction', '30 FPS Sampling'], ['Lip-Sync Model', 'Temporal Ready']].map(([k, v]) => (
                      <div key={k} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.5625rem', color: '#4f5b8a', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{k}</div>
                        <div style={{ fontSize: '0.8125rem', color: currentMod.color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <DropZone modality={currentMod} isDragging={isDragging} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onChange={handleFileChange} />
              )}
            </div>
          )}

          {/* DOCUMENT */}
          {activeModality === 'document' && (
            <div style={{ marginBottom: '1.5rem' }}>
              {(fileMetadata || inputContent) ? (
                <div style={{ background: 'rgba(5,7,15,0.6)', border: `1px solid ${currentMod.border}`, borderRadius: '16px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem', paddingBottom: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: currentMod.bg, border: `1px solid ${currentMod.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileCheck size={18} color={currentMod.color} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#f0f4ff', fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>{fileMetadata?.name || inputContent}</div>
                        <div style={{ fontSize: '0.75rem', color: '#4f5b8a', fontFamily: 'JetBrains Mono, monospace' }}>{fileMetadata?.size || '–'} · Document</div>
                      </div>
                    </div>
                    <button type="button" onClick={clearUploadedFile} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#fb7185', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                      <XCircle size={13} /> Remove
                    </button>
                  </div>
                  <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.8125rem', fontFamily: 'JetBrains Mono, monospace', color: currentMod.color }}>
                    Ready to parse claims and evaluate official government signature seals (ISO 32000-1).
                  </div>
                </div>
              ) : (
                <DropZone modality={currentMod} isDragging={isDragging} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onChange={handleFileChange} />
              )}
            </div>
          )}

          {/* ── Submit Bar ── */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            {/* Consent toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', userSelect: 'none' }}>
              <div
                onClick={() => setUserConsent(!userConsent)}
                style={{
                  width: '18px', height: '18px',
                  borderRadius: '5px',
                  border: `1.5px solid ${userConsent ? '#6366f1' : 'rgba(255,255,255,0.2)'}`,
                  background: userConsent ? 'rgba(99,102,241,0.25)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {userConsent && <CheckCircle2 size={11} color="#818cf8" />}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#8b9cc8', lineHeight: 1.5 }}>
                I consent to in-memory processing. No data stored permanently.
              </span>
            </label>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isProcessing || !inputContent.trim() || !userConsent}
              className="btn-primary"
              style={{
                padding: '0.875rem 2rem',
                fontSize: '0.9375rem',
                borderRadius: '14px',
                boxShadow: '0 6px 24px rgba(99,102,241,0.45)',
                minWidth: '220px',
                justifyContent: 'center',
              }}
            >
              {isProcessing ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Running Pipeline…
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Run TruthLens Verification
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
