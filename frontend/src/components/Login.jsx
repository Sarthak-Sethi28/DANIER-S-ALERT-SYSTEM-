import React, { useState, useEffect, useRef } from 'react';
import { Lock, User, LogIn } from 'lucide-react';
import { login as apiLogin, requestPasswordReset, confirmPasswordReset } from '../services/api';
import * as THREE from 'three';

const Login = ({ onLogin }) => {
  const canvasRef = useRef(null);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetForm, setResetForm] = useState({ username: '', code: '', newPassword: '', confirmPassword: '' });

  // ── Three.js background ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 25);

    // Lighting
    scene.add(new THREE.AmbientLight(0x111122, 1));
    const goldLight = new THREE.PointLight(0xc9a84c, 2, 60);
    goldLight.position.set(5, 8, 12);
    scene.add(goldLight);
    const blueLight = new THREE.PointLight(0x334488, 1, 50);
    blueLight.position.set(-10, -5, 8);
    scene.add(blueLight);

    // Floating cubes
    const palette = [0xff3d3d, 0xf59e0b, 0x8b5cf6, 0x10b981, 0xc9a84c];
    const cubeCount = [8, 10, 6, 4, 12];
    const meshes = [];

    palette.forEach((color, ci) => {
      for (let i = 0; i < cubeCount[ci]; i++) {
        const s = Math.random() * 0.6 + 0.25;
        const geo = new THREE.BoxGeometry(s, s, s);
        const mat = new THREE.MeshPhongMaterial({
          color,
          transparent: true,
          opacity: 0.55 + Math.random() * 0.25,
          emissive: color,
          emissiveIntensity: 0.08,
          shininess: 80,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 36,
          (Math.random() - 0.5) * 22,
          (Math.random() - 0.5) * 12 - 4
        );
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        mesh.userData = {
          vx: (Math.random() - 0.5) * 0.012,
          vy: (Math.random() - 0.5) * 0.008,
          rx: (Math.random() - 0.5) * 0.018,
          ry: (Math.random() - 0.5) * 0.018,
          baseY: mesh.position.y,
          floatAmp: Math.random() * 0.6 + 0.3,
          floatFreq: Math.random() * 0.4 + 0.2,
          phase: Math.random() * Math.PI * 2,
        };
        scene.add(mesh);
        meshes.push(mesh);
      }
    });

    // Particle field
    const particleGeo = new THREE.BufferGeometry();
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xc9a84c, size: 0.06, transparent: true, opacity: 0.4 });
    scene.add(new THREE.Points(particleGeo, particleMat));

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;
      meshes.forEach(m => {
        m.rotation.x += m.userData.rx;
        m.rotation.y += m.userData.ry;
        m.position.y = m.userData.baseY + Math.sin(t * m.userData.floatFreq + m.userData.phase) * m.userData.floatAmp;
        m.position.x += m.userData.vx;
        m.position.y += m.userData.vy * 0.1;
        if (Math.abs(m.position.x) > 20) m.userData.vx *= -1;
      });
      camera.position.x = Math.sin(t * 0.06) * 1.5;
      camera.position.y = Math.cos(t * 0.04) * 0.8;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // ── Auth logic ──────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');
    try {
      const session = await apiLogin(credentials.username, credentials.password);
      const sessionInfo = { username: session.username, loginTime: session.loginTime, sessionId: session.sessionId };
      localStorage.setItem('danier_auth', JSON.stringify(sessionInfo));
      onLogin(sessionInfo);
    } catch (err) {
      setError(err?.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (info) setInfo('');
  };

  const handleResetInputChange = (field, value) => {
    setResetForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (info) setInfo('');
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');
    try {
      if (!resetForm.username) { setError('Please enter your username'); return; }
      await requestPasswordReset(resetForm.username);
      setInfo('If the user exists, a 6-digit code was sent to the active recipients and the registered email.');
      setResetStep(2);
    } catch (err) {
      setError(err?.message || 'Failed to request reset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');
    try {
      if (!resetForm.username || !resetForm.code || !resetForm.newPassword || !resetForm.confirmPassword) {
        setError('Please complete all fields');
        return;
      }
      await confirmPasswordReset(resetForm.username, resetForm.code, resetForm.newPassword, resetForm.confirmPassword);
      setInfo('Password updated. You can now sign in with your new password.');
      setResetMode(false);
      setResetStep(1);
      setCredentials({ username: resetForm.username, password: '' });
      setResetForm({ username: '', code: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Shared input style ───────────────────────────────────────
  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    color: '#f0f0f8',
    borderRadius: '10px',
    padding: '12px 12px 12px 42px',
    width: '100%',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.2s',
  };

  const inputNoIconStyle = { ...inputStyle, paddingLeft: '12px' };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = 'rgba(201,168,76,0.55)';
    e.target.style.background = 'rgba(201,168,76,0.05)';
    e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.09)';
    e.target.style.background = 'rgba(255,255,255,0.04)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07070e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

      {/* Radial glow behind card */}
      <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />

      {/* Login Card */}
      <div className="animate-fade-in" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', width: '72px', height: '72px', background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', borderRadius: '18px', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(201,168,76,0.35)', marginBottom: '1.25rem' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M7 4C7 4 7 20 7 20C7 20 12.5 20 15.5 20C19 20 21 17 21 14C21 11 19 8 15.5 8C13.5 8 11.5 8 11.5 8C11.5 8 11.5 4 11.5 4L7 4Z" fill="#000" fillOpacity="0.9"/>
              <path d="M11 8.5C11 8.5 14.5 8.5 16 9C18 9.7 19 11.5 19 13.5C19 15.5 18 17.2 16 17.8C14.5 18.2 11 18 11 18" stroke="#c9a84c" strokeWidth="1" fill="none" opacity="0.4"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 0.25rem', fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            DANIER
          </h2>
          <p style={{ color: 'rgba(200,200,220,0.5)', fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
            Inventory Intelligence System
          </p>
        </div>

        {/* Glass card */}
        <div style={{ background: 'rgba(13,13,26,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(201,168,76,0.13)', borderRadius: '20px', padding: '2rem', boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)' }}>

          {!resetMode ? (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Username */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'rgba(201,168,76,0.7)', marginBottom: '0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Username</label>
                  <div style={{ position: 'relative' }}>
                    <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'rgba(201,168,76,0.45)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      required
                      style={inputStyle}
                      placeholder="Enter your username"
                      value={credentials.username}
                      onChange={e => handleInputChange('username', e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'rgba(201,168,76,0.7)', marginBottom: '0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'rgba(201,168,76,0.45)', pointerEvents: 'none' }} />
                    <input
                      type="password"
                      required
                      style={inputStyle}
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                  </div>
                </div>

                {/* Error / Info */}
                {error && (
                  <div style={{ background: 'rgba(255,61,61,0.1)', border: '1px solid rgba(255,61,61,0.25)', borderRadius: '10px', padding: '12px', color: '#ff8080', fontSize: '0.85rem' }}>
                    {error}
                  </div>
                )}
                {info && !error && (
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '12px', color: '#34d399', fontSize: '0.85rem' }}>
                    {info}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-elegant"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#000', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
                  >
                    {isLoading ? (
                      <>
                        <div style={{ width: '18px', height: '18px', border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn style={{ width: '18px', height: '18px' }} />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setResetMode(true); setResetStep(1); setError(''); setInfo(''); setResetForm({ username: credentials.username, code: '', newPassword: '', confirmPassword: '' }); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(201,168,76,0.7)', fontSize: '0.82rem', fontWeight: '600', whiteSpace: 'nowrap' }}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={resetStep === 1 ? handleRequestReset : handleConfirmReset}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: 'rgba(201,168,76,0.8)', fontSize: '0.85rem', fontWeight: '600', margin: '0 0 1rem' }}>
                  {resetStep === 1 ? 'Enter your username to receive a reset code' : 'Enter the code sent to your email'}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'rgba(201,168,76,0.7)', marginBottom: '0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Username</label>
                  <input
                    type="text"
                    required
                    style={inputNoIconStyle}
                    placeholder="Enter your username"
                    value={resetForm.username}
                    onChange={e => handleResetInputChange('username', e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  />
                </div>

                {resetStep === 2 && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'rgba(201,168,76,0.7)', marginBottom: '0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>6-digit code</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        style={inputNoIconStyle}
                        placeholder="Enter the code sent to your email"
                        value={resetForm.code}
                        onChange={e => handleResetInputChange('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'rgba(201,168,76,0.7)', marginBottom: '0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>New password</label>
                      <input
                        type="password"
                        style={inputNoIconStyle}
                        placeholder="Enter new password (min 8 chars)"
                        value={resetForm.newPassword}
                        onChange={e => handleResetInputChange('newPassword', e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: 'rgba(201,168,76,0.7)', marginBottom: '0.5rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Confirm password</label>
                      <input
                        type="password"
                        style={inputNoIconStyle}
                        placeholder="Re-enter new password"
                        value={resetForm.confirmPassword}
                        onChange={e => handleResetInputChange('confirmPassword', e.target.value)}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div style={{ background: 'rgba(255,61,61,0.1)', border: '1px solid rgba(255,61,61,0.25)', borderRadius: '10px', padding: '12px', color: '#ff8080', fontSize: '0.85rem' }}>
                    {error}
                  </div>
                )}
                {info && !error && (
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '12px', color: '#34d399', fontSize: '0.85rem' }}>
                    {info}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-elegant"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #c9a84c, #e8c96a)', color: '#000', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.6 : 1 }}
                  >
                    {isLoading ? (
                      <>
                        <div style={{ width: '18px', height: '18px', border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <span>{resetStep === 1 ? 'Sending code...' : 'Resetting...'}</span>
                      </>
                    ) : (
                      <span>{resetStep === 1 ? 'Send Code' : 'Confirm Reset'}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setResetMode(false); setResetStep(1); setError(''); setInfo(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(200,200,220,0.5)', fontSize: '0.82rem', fontWeight: '600', whiteSpace: 'nowrap' }}
                  >
                    Back to sign in
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Bottom label */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'rgba(200,200,220,0.2)', fontSize: '0.72rem', letterSpacing: '0.1em' }}>
          DANIER LEATHER · INVENTORY INTELLIGENCE
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
