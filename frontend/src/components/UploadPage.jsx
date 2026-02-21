import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadReport, checkHealth } from '../services/api';
import { useData } from '../DataContext';
import * as THREE from 'three';
import {
  Upload,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Wifi,
  WifiOff,
  Clock,
  FileText,
  Sparkles,
  Zap,
  FileCheck,
  Loader2,
  Table2,
  ArrowUpCircle
} from 'lucide-react';

// ═══════════════════════════════════════════════════
//  Three.js Background — floating inventory cubes
// ═══════════════════════════════════════════════════
function useThreeBackground(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300);
    camera.position.set(0, 0, 28);

    // Lighting
    scene.add(new THREE.AmbientLight(0x0a0a1a, 1));
    const gold1 = new THREE.PointLight(0xc9a84c, 3, 80);
    gold1.position.set(8, 10, 15);
    scene.add(gold1);
    const gold2 = new THREE.PointLight(0xe8c96a, 1.5, 60);
    gold2.position.set(-12, -6, 10);
    scene.add(gold2);
    const accent = new THREE.PointLight(0x334499, 1, 50);
    accent.position.set(0, -15, 5);
    scene.add(accent);

    // Inventory cube clusters (colored by alert type)
    const specs = [
      { color: 0xff3d3d, emissive: 0x661111, count: 12, label: 'critical' },
      { color: 0xf59e0b, emissive: 0x553300, count: 16, label: 'warn' },
      { color: 0x8b5cf6, emissive: 0x331166, count: 10, label: 'order' },
      { color: 0x10b981, emissive: 0x003322, count: 6,  label: 'good' },
      { color: 0xc9a84c, emissive: 0x443300, count: 14, label: 'gold' },
    ];

    const meshes = [];
    specs.forEach(({ color, emissive, count }) => {
      for (let i = 0; i < count; i++) {
        const s = Math.random() * 0.65 + 0.2;
        const geo = new THREE.BoxGeometry(s, s, s);
        const mat = new THREE.MeshPhongMaterial({
          color,
          emissive,
          emissiveIntensity: 0.25,
          transparent: true,
          opacity: 0.45 + Math.random() * 0.3,
          shininess: 90,
          specular: new THREE.Color(0x888888),
        });
        const mesh = new THREE.Mesh(geo, mat);

        // Spread across wide viewport
        mesh.position.set(
          (Math.random() - 0.5) * 45,
          (Math.random() - 0.5) * 28,
          (Math.random() - 0.5) * 14 - 2
        );
        mesh.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );
        mesh.userData = {
          rx:       (Math.random() - 0.5) * 0.022,
          ry:       (Math.random() - 0.5) * 0.022,
          rz:       (Math.random() - 0.5) * 0.008,
          vx:       (Math.random() - 0.5) * 0.008,
          baseY:    mesh.position.y,
          amp:      Math.random() * 0.8 + 0.3,
          freq:     Math.random() * 0.35 + 0.15,
          phase:    Math.random() * Math.PI * 2,
        };
        scene.add(mesh);
        meshes.push(mesh);
      }
    });

    // Gold particle field
    const pCount = 300;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 80;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xc9a84c, size: 0.05, transparent: true, opacity: 0.35 });
    scene.add(new THREE.Points(pGeo, pMat));

    // Thin gold rings (orbit decorations)
    [6, 10, 15].forEach((r, i) => {
      const ringGeo = new THREE.RingGeometry(r, r + 0.04, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.04 + i * 0.02, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + (i * 0.3);
      ring.rotation.z = i * 0.5;
      ring.userData = { rotY: (i % 2 === 0 ? 1 : -1) * 0.001 };
      scene.add(ring);
      meshes.push(ring);
    });

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;

      meshes.forEach(m => {
        if (m.userData.rx !== undefined) {
          m.rotation.x += m.userData.rx;
          m.rotation.y += m.userData.ry;
          if (m.userData.rz) m.rotation.z += m.userData.rz;
          if (m.userData.baseY !== undefined) {
            m.position.y = m.userData.baseY + Math.sin(t * m.userData.freq + m.userData.phase) * m.userData.amp;
          }
          if (m.userData.vx !== undefined) {
            m.position.x += m.userData.vx;
            if (Math.abs(m.position.x) > 24) m.userData.vx *= -1;
          }
        }
        if (m.userData.rotY !== undefined) {
          m.rotation.y += m.userData.rotY;
        }
      });

      // Gentle camera sway
      camera.position.x = Math.sin(t * 0.05) * 2;
      camera.position.y = Math.cos(t * 0.035) * 1.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [canvasRef]);
}

// ═══════════════════════════════════════════════════
//  UploadPage Component
// ═══════════════════════════════════════════════════
const UploadPage = () => {
  const { refreshAll } = useData();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const navigate = useNavigate();

  // Mount Three.js scene
  useThreeBackground(threeCanvasRef);

  // Backend health check
  useEffect(() => {
    let isMounted = true;
    const doHealthCheck = async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        await checkHealth(controller.signal);
        if (isMounted) setConnectionStatus('connected');
        clearTimeout(timer);
      } catch {
        if (isMounted) {
          setConnectionStatus('error');
          setTimeout(doHealthCheck, 3000);
        }
      }
    };
    doHealthCheck();
    return () => { isMounted = false; };
  }, []);

  const handleFileChange = useCallback((selectedFile) => {
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setError('');
        setSuccess(false);
      } else {
        setError('Please select a valid Excel file (.xlsx format)');
        setFile(null);
      }
    }
  }, []);

  const handleInputChange = useCallback((e) => handleFileChange(e.target.files[0]), [handleFileChange]);
  const handleDragOver   = useCallback((e) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave  = useCallback((e) => { e.preventDefault(); setIsDragOver(false); }, []);
  const handleDrop       = useCallback((e) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files[0]); }, [handleFileChange]);

  const handleUpload = async () => {
    if (!file) { setError('Please select a file first'); return; }
    if (connectionStatus === 'error') { setError('Backend server is not running. Please contact your administrator.'); return; }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 90));
      }, 150);

      const result = await uploadReport(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      console.log('Upload result:', result);
      setConnectionStatus('connected');
      setSuccess(true);
      refreshAll(false);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadProgress(0);
      if (err.code === 'ECONNREFUSED' || /Network Error/i.test(err.message || '')) {
        setError('❌ Network Error: Cannot connect to server.\n\n🔧 Troubleshooting:\n1. Check if backend server is running\n2. Verify backend is reachable\n3. Contact your system administrator');
        setConnectionStatus('error');
      } else if (err.response?.status === 400) {
        setError(`📋 File Format Error: ${err.response.data.detail}\n\nPlease check your Excel file format.`);
      } else if (err.response?.status === 500) {
        setError('🔧 Server Error: Internal processing error. Please try again or contact support.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  // ── Connection status banner ─────────────────────
  const ConnectionStatus = () => {
    const configs = {
      checking: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#f59e0b', icon: <Clock className="w-5 h-5 animate-spin" />, text: 'Checking server connection...' },
      connected: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#10b981', icon: <Wifi className="w-5 h-5" />, text: 'Server connected ✅' },
      error:     { bg: 'rgba(255,61,61,0.1)',  border: 'rgba(255,61,61,0.25)',  color: '#ff6b6b', icon: <WifiOff className="w-5 h-5" />, text: 'Server not available ❌' },
    };
    const c = configs[connectionStatus];
    if (!c) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px 20px', background: c.bg, border: `1px solid ${c.border}`, borderRadius: '12px', marginBottom: '1.5rem', color: c.color }}>
        {c.icon}
        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{c.text}</span>
      </div>
    );
  };

  // ── Success screen ───────────────────────────────
  if (success) {
    return (
      <>
        <canvas ref={threeCanvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="card-premium animate-scale-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '480px', width: '100%' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '88px', height: '88px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.25)', marginBottom: '1.5rem' }} className="animate-scale-in">
              <CheckCircle style={{ width: '48px', height: '48px', color: '#10b981' }} />
            </div>
            <h2 className="text-gradient-gold" style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem' }}>
              Upload Successful! 🎉
            </h2>
            <p style={{ color: 'rgba(200,200,220,0.7)', marginBottom: '1.5rem' }}>Inventory file processed successfully</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#c9a84c', fontWeight: '600' }}>
              <span>Redirecting to Dashboard</span>
              <ArrowRight style={{ width: '20px', height: '20px' }} className="animate-bounce-subtle" />
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Main upload UI ───────────────────────────────
  return (
    <>
      {/* Three.js Background */}
      <canvas
        ref={threeCanvasRef}
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px', margin: '0 auto' }}>

        {/* Hero Header */}
        <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
            <div style={{ width: '72px', height: '72px', background: 'rgba(201,168,76,0.08)', border: '2px solid rgba(201,168,76,0.2)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }} className="animate-float">
              <Table2 style={{ width: '32px', height: '32px', color: '#c9a84c', strokeWidth: 1.5 }} />
              <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(201,168,76,0.4)' }}>
                <ArrowUpCircle style={{ width: '14px', height: '14px', color: '#000' }} />
              </div>
            </div>
          </div>

          <h1 className="text-gradient-gold" style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.5rem', fontFamily: "'Space Grotesk', sans-serif" }}>
            Upload Inventory Report
          </h1>
          <p style={{ color: 'rgba(200,200,220,0.55)', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
            Fast &amp; Efficient Processing
          </p>
          <p style={{ color: 'rgba(200,200,220,0.35)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Zap style={{ width: '14px', height: '14px', color: '#c9a84c' }} />
            Optimized for speed and reliability · Supports files up to 50MB
          </p>
        </div>

        {/* Main Card */}
        <div className="card-premium animate-slide-up" style={{ padding: '2rem' }}>
          <ConnectionStatus />

          {/* File Format Info */}
          <div style={{ marginBottom: '1.75rem', padding: '1.25rem 1.5rem', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <FileText style={{ width: '22px', height: '22px', color: '#c9a84c', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontWeight: '700', color: '#f0f0f8', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  Expected File Format
                </h3>
                <p style={{ fontSize: '0.83rem', color: 'rgba(200,200,220,0.5)', marginBottom: '0.75rem' }}>
                  Upload your detailed inventory Excel file with the following columns:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {['Item Description', 'Variant Color', 'Variant Code', 'Grand Total', 'Season Code'].map(col => (
                    <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'rgba(200,200,220,0.6)' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c9a84c', flexShrink: 0 }} />
                      {col}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Error Panel */}
          {error && (
            <div style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', background: 'rgba(255,61,61,0.08)', border: '1px solid rgba(255,61,61,0.2)', borderRadius: '14px' }} className="animate-slide-down">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertCircle style={{ width: '22px', height: '22px', color: '#ff6b6b', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontWeight: '700', color: '#ff8080', marginBottom: '0.5rem' }}>Upload Failed</h4>
                  <div style={{ color: '#ff9999', fontSize: '0.85rem', whiteSpace: 'pre-line', marginBottom: '0.75rem' }}>{error}</div>
                  {!/Network Error/i.test(error) && (
                    <div style={{ padding: '12px', background: 'rgba(255,61,61,0.06)', borderRadius: '10px', border: '1px solid rgba(255,61,61,0.15)' }}>
                      <h5 style={{ fontWeight: '700', color: '#ff8080', marginBottom: '0.4rem', fontSize: '0.82rem' }}>💡 File Format Requirements:</h5>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {[
                          'Must be a detailed inventory report (.xlsx format)',
                          'Should contain required columns listed above',
                          'Should list individual product variants with stock quantities',
                          'Should NOT be a summary/pivot table with unnamed columns',
                        ].map(t => (
                          <li key={t} style={{ display: 'flex', gap: '6px', fontSize: '0.8rem', color: 'rgba(255,150,150,0.8)' }}>
                            <span style={{ color: '#ff6b6b' }}>•</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              position: 'relative',
              border: `2px dashed ${isDragOver ? '#c9a84c' : file ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              cursor: uploading || connectionStatus === 'error' ? 'not-allowed' : 'pointer',
              opacity: uploading || connectionStatus === 'error' ? 0.5 : 1,
              transition: 'all 0.3s',
              background: isDragOver
                ? 'rgba(201,168,76,0.06)'
                : file
                ? 'rgba(16,185,129,0.05)'
                : 'rgba(255,255,255,0.015)',
              transform: isDragOver ? 'scale(1.015)' : 'scale(1)',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleInputChange}
              className="hidden"
              disabled={uploading || connectionStatus === 'error'}
            />

            {file ? (
              <div className="animate-scale-in">
                <FileCheck style={{ width: '64px', height: '64px', color: '#10b981', margin: '0 auto 1rem' }} className="animate-bounce-subtle" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#34d399', marginBottom: '0.4rem' }}>File Selected ✅</h3>
                <p style={{ color: '#10b981', fontWeight: '600', marginBottom: '0.25rem' }}>{file.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(200,200,220,0.45)' }}>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                <Upload style={{ width: '64px', height: '64px', margin: '0 auto 1rem', color: isDragOver ? '#c9a84c' : 'rgba(200,200,220,0.25)', transition: 'all 0.3s', transform: isDragOver ? 'scale(1.15)' : 'scale(1)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: isDragOver ? '#c9a84c' : 'rgba(200,200,220,0.7)', marginBottom: '0.5rem' }}>
                  {isDragOver ? 'Drop your file here' : 'Choose Excel File (.xlsx)'}
                </h3>
                <p style={{ color: 'rgba(200,200,220,0.35)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  Drag and drop your inventory report here, or click to browse
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '10px', color: '#c9a84c', fontSize: '0.85rem', fontWeight: '600' }}>
                  <Upload style={{ width: '14px', height: '14px' }} />
                  Browse Files
                </div>
              </div>
            )}

            {/* Upload progress */}
            {uploading && (
              <div style={{ marginTop: '1.5rem' }} className="animate-fade-in">
                <div style={{ background: 'rgba(201,168,76,0.12)', borderRadius: '999px', height: '10px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'linear-gradient(90deg, #c9a84c, #e8c96a)', borderRadius: '999px', transition: 'width 0.3s ease', boxShadow: '0 0 12px rgba(201,168,76,0.6)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#c9a84c', fontWeight: '600' }}>
                  <Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin" />
                  <span>Processing... {uploadProgress}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Upload CTA */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading || connectionStatus === 'error'}
            className="btn-premium"
            style={{
              width: '100%',
              marginTop: '1.5rem',
              padding: '1rem 1.5rem',
              borderRadius: '14px',
              fontSize: '1rem',
              border: 'none',
              cursor: !file || uploading || connectionStatus === 'error' ? 'not-allowed' : 'pointer',
              opacity: !file || uploading || connectionStatus === 'error' ? 0.35 : 1,
            }}
          >
            {uploading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Loader2 style={{ width: '22px', height: '22px' }} className="animate-spin" />
                <span>Processing Upload...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Upload style={{ width: '22px', height: '22px' }} />
                <span>Upload &amp; Process Report</span>
                <Sparkles style={{ width: '18px', height: '18px' }} />
              </div>
            )}
          </button>

          {/* Legend */}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {[
              { color: '#ff3d3d', label: 'Critical' },
              { color: '#f59e0b', label: 'Warning' },
              { color: '#8b5cf6', label: 'Order Placed' },
              { color: '#10b981', label: 'Healthy' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'rgba(200,200,220,0.4)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, opacity: 0.7 }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadPage;
