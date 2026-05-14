import { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Phone, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checkAdminAndRedirect = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('user_roles').select('role')
        .eq('user_id', user.id).eq('role', 'admin').maybeSingle();
      if (data) {
        navigate('/admin/dashboard');
        toast.success('Welcome back, Admin!');
      } else {
        toast.success('Login successful!');
      }
    }
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); } else { await checkAdminAndRedirect(); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          first_name: firstName, 
          last_name: lastName,
          phone: phone // Also stored in auth metadata
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (signUpError) {
      toast.error(signUpError.message);
      setLoading(false);
      return;
    }

    const newUser = signUpData.user;
    if (newUser) {
      // 2. Manually update/ensure profile exists with phone (as trigger might be limited)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: newUser.id,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (profileError) {
        console.error('Profile update error:', profileError);
        // We don't block the user since auth succeeded, but we log it
      }
    }

    setLoading(false);
    toast.success('Account created successfully!'); 
    onClose();
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) { toast.error('Google sign-in failed'); setLoading(false); return; }
    // The browser will redirect to Google for authentication.
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '0 16px 0 44px',
    fontSize: '15px',
    color: 'white',
    height: '52px',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#3B82F6';
    e.target.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.25)';
    e.target.style.background = 'rgba(0,0,0,0.5)';
  };

  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
    e.target.style.boxShadow = 'none';
    e.target.style.background = 'rgba(0,0,0,0.3)';
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Full Screen Modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(11, 18, 30, 0.98)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
            id="auth-modal"
          >
            {/* Background glows */}
            <div style={{
              position: 'fixed', top: '10%', left: '5%',
              width: '40vw', height: '40vw',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'fixed', bottom: '10%', right: '5%',
              width: '35vw', height: '35vw',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16,185,129,0.08), transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Sticky Header */}
            <div style={{
              position: 'sticky', top: 0,
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(59,130,246,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px',
              zIndex: 10,
            }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                onClick={() => { navigate('/'); onClose(); }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(0,123,255,0.4)',
                }}>
                  <Zap style={{ width: '18px', height: '18px', color: '#0F172A' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 900, color: '#f5b50a', lineHeight: 1.1, fontSize: '15px', textTransform: 'uppercase' }}>SRI RAJ</div>
                  <div style={{ fontSize: '10px', color: 'white', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8 }}>COMPUTERS</div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#94a3b8', transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                aria-label="Close"
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Main Content */}
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '40px 24px 60px',
              position: 'relative',
            }}>
              <div style={{ width: '100%', maxWidth: '440px' }}>
                {/* Icon + Title */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(16,185,129,0.2))',
                    border: '1px solid rgba(59,130,246,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 18px',
                    boxShadow: '0 0 25px rgba(59,130,246,0.2)',
                  }}>
                    {mode === 'login' ? <Lock style={{ width: '32px', height: '32px', color: '#007bff' }} /> : <User style={{ width: '32px', height: '32px', color: '#f5b50a' }} />}
                  </div>
                  <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                    {mode === 'login' ? 'Welcome Back!' : 'Join Us Today'}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#64748b' }}>
                    {mode === 'login' ? 'Sign in to access your orders and account' : 'Create an account to track orders and save favorites'}
                  </p>
                </div>

                {/* Tab Switcher */}
                <div style={{
                  display: 'flex',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '4px',
                  marginBottom: '28px',
                }}>
                  {(['login', 'register'] as const).map(tab => (
                    <button
                      key={tab}
                      id={`auth-tab-${tab}`}
                      onClick={() => setMode(tab)}
                      style={{
                        flex: 1, padding: '12px',
                        background: mode === tab ? '#007bff' : 'transparent',
                        border: 'none', borderRadius: '10px', cursor: 'pointer',
                        fontSize: '13px', fontStyle: 'normal', fontWeight: 800,
                        color: mode === tab ? 'white' : '#a0a0a0',
                        transition: 'all 0.3s',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: mode === tab ? '0 0 20px rgba(0,123,255,0.4)' : 'none',
                      }}
                    >
                      {tab === 'login' ? 'Login' : 'Register'}
                    </button>
                  ))}
                </div>

                {/* LOGIN FORM */}
                {mode === 'login' && (
                  <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Email */}
                    <div>
                      <label className="input-label">Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#64748b', pointerEvents: 'none' }} />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                          placeholder="you@example.com"
                          style={inputStyle}
                          onFocus={focusStyle}
                          onBlur={blurStyle}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="input-label">Password <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#64748b', pointerEvents: 'none' }} />
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                          placeholder="Your password"
                          style={{ ...inputStyle, paddingRight: '48px' }}
                          onFocus={focusStyle}
                          onBlur={blurStyle}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                          {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                        </button>
                      </div>
                      <div style={{ textAlign: 'right', marginTop: '6px' }}>
                        <button type="button" style={{ background: 'none', border: 'none', fontSize: '12px', color: '#3B82F6', fontWeight: 600, cursor: 'pointer', textShadow: '0 0 6px rgba(59,130,246,0.4)' }}>
                          Forgot Password?
                        </button>
                      </div>
                    </div>

                    <button
                      id="login-submit-btn"
                      type="submit" disabled={loading}
                      style={{ marginTop: '8px', fontSize: '14px', height: '54px', background: '#f5b50a', color: '#000', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 8px 25px rgba(245,181,10,0.2)' }}
                    >
                      {loading ? 'Processing...' : 'Sign In'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                      Don't have an account?{' '}
                      <button type="button" onClick={() => setMode('register')}
                        style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: 700, cursor: 'pointer', fontSize: '13px', textShadow: '0 0 6px rgba(59,130,246,0.4)' }}>
                        Create account
                      </button>
                    </p>
                  </form>
                )}

                {/* REGISTER FORM */}
                {mode === 'register' && (
                  <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Name row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="input-label">First Name <span style={{ color: '#ef4444' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                          <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#64748b', pointerEvents: 'none' }} />
                          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required
                            placeholder="First" style={{ ...inputStyle, fontSize: '14px' }}
                            onFocus={focusStyle} onBlur={blurStyle}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="input-label">Last Name</label>
                        <div style={{ position: 'relative' }}>
                          <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#64748b', pointerEvents: 'none' }} />
                          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                            placeholder="Last" style={{ ...inputStyle, fontSize: '14px' }}
                            onFocus={focusStyle} onBlur={blurStyle}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="input-label">Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#64748b', pointerEvents: 'none' }} />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                          placeholder="you@example.com" style={inputStyle}
                          onFocus={focusStyle} onBlur={blurStyle}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="input-label">Phone Number</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{
                          display: 'flex', alignItems: 'center', padding: '0 12px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px', fontSize: '14px',
                          fontWeight: 700, color: '#94a3b8', flexShrink: 0, height: '52px',
                        }}>
                          +91
                        </span>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <Phone style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#64748b', pointerEvents: 'none' }} />
                          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                            placeholder="9999999999" style={inputStyle}
                            onFocus={focusStyle} onBlur={blurStyle}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="input-label">Password <span style={{ color: '#ef4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#64748b', pointerEvents: 'none' }} />
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                          placeholder="Min. 6 characters"
                          style={{ ...inputStyle, paddingRight: '48px' }}
                          onFocus={focusStyle} onBlur={blurStyle}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                          {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                        </button>
                      </div>
                    </div>

                    <button
                      id="register-submit-btn"
                      type="submit" disabled={loading}
                      style={{ marginTop: '8px', fontSize: '14px', height: '54px', background: '#007bff', color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 8px 25px rgba(0,123,255,0.2)' }}
                    >
                      {loading ? 'Creating...' : 'Create Account'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '11px', color: '#475569', lineHeight: 1.6 }}>
                      By continuing you agree to our{' '}
                      <span style={{ color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}>Terms</span>
                      {' '}& {' '}
                      <span style={{ color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>
                    </p>
                  </form>
                )}

                {/* Trust indicators */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '28px', flexWrap: 'wrap' }}>
                  {[
                    { icon: <ShieldCheck style={{ width: '13px', height: '13px' }} />, text: 'SSL Secured' },
                    { icon: <Zap style={{ width: '13px', height: '13px' }} />, text: 'Instant Access' },
                    { icon: <CheckCircle2 style={{ width: '13px', height: '13px' }} />, text: '100% Free' }
                  ].map(badge => (
                    <span key={badge.text} style={{ fontSize: '11px', color: '#475569', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {badge.icon} {badge.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
