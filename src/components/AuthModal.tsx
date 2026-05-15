import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Phone, Zap, ShieldCheck, CheckCircle2, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
  const [accountType, setAccountType] = useState<'customer' | 'business'>('customer');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [area, setArea] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
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

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone
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
      if (accountType === 'business') {
        const { error: dealerError } = await supabase
          .from('dealer_applications')
          .insert({
            user_id: newUser.id,
            business_name: businessName,
            contact_person: firstName + (lastName ? ' ' + lastName : ''),
            email: email,
            phone: phone,
            address: `${address}, ${area}, ${pincode}`,
            state: state,
            city: city,
            gstin: gstNumber,
            admin_note: referralCode ? `Referral Code: ${referralCode}` : null,
            status: 'pending',
            updated_at: new Date().toISOString()
          });

        if (dealerError) {
          console.error('Dealer application error:', dealerError);
          toast.error('Account created, but dealer application failed. Please contact support.');
        } else {
          toast.success('B2B Dealer Application submitted for review!');
        }
      } else {
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
        }
      }
    }

    setLoading(false);
    if (accountType === 'customer') {
      toast.success('Account created successfully!');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-2xl z-[1000] flex flex-col overflow-y-auto"
            id="auth-modal"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 py-4 z-50">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => { navigate('/'); onClose(); }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-black text-slate-900 leading-none text-base uppercase tracking-tight font-heading">SRI RAJ</div>
                  <div className="text-[10px] text-slate-400 font-bold letter-spacing-wide uppercase tracking-widest">COMPUTERS</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all active:scale-90"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[480px] bg-white rounded-[48px] p-10 md:p-14 shadow-2xl border border-slate-200 relative overflow-hidden"
              >
                {/* Decorative Background Accent */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <div className="text-center mb-10">
                    <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                      {mode === 'login' ? (
                        <Lock className="w-10 h-10 text-primary" />
                      ) : (
                        <User className="w-10 h-10 text-amber-500" />
                      )}
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 font-heading">
                      {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">
                      {mode === 'login' ? 'Access your dashboard and orders' : 'Join our premium computing marketplace'}
                    </p>
                  </div>

                  {/* Tab Switcher */}
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10">
                    {(['login', 'register'] as const).map(tab => (
                      <button
                        key={tab}
                        id={`auth-tab-${tab}`}
                        onClick={() => setMode(tab)}
                        className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === tab
                            ? 'bg-white text-primary shadow-lg shadow-black/5'
                            : 'text-slate-400 hover:text-slate-600'
                          }`}
                      >
                        {tab === 'login' ? 'Sign In' : 'Sign Up'}
                      </button>
                    ))}
                  </div>

                  {/* Forms */}
                  {mode === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                            placeholder="name@example.com"
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                          <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Forgot?</button>
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                          <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                            placeholder="Your secure password"
                            className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        id="login-submit-btn"
                        type="submit" disabled={loading}
                        className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
                      >
                        {loading ? 'Validating...' : 'Authorize Login'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegister} className="space-y-5">
                      {/* Account Type Switcher */}
                      <div className="space-y-3 mb-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Account Type</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="accountType" checked={accountType === 'customer'} onChange={() => setAccountType('customer')} className="w-4 h-4 accent-primary" />
                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">
                              <User className="w-4 h-4" /> Customer
                            </div>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="accountType" checked={accountType === 'business'} onChange={() => setAccountType('business')} className="w-4 h-4 accent-amber-500" />
                            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700 group-hover:text-amber-500 transition-colors">
                              <Briefcase className="w-4 h-4" /> Business (B2B)
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {accountType === 'business' && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Business Name</label>
                            <div className="relative group">
                              <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                              <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} required
                                placeholder="Enter Business Name" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                              />
                            </div>
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                            {accountType === 'business' ? 'Contact Person Name' : 'First Name'}
                          </label>
                          <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required
                              placeholder={accountType === 'business' ? 'Enter Contact Name' : 'John'} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                            />
                          </div>
                        </div>
                        {accountType === 'customer' && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Last Name</label>
                            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                              placeholder="Doe" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                            />
                          </div>
                        )}
                      </div>

                      {accountType === 'business' && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">GST Number</label>
                          <div className="relative group">
                            <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                            <input type="text" value={gstNumber} onChange={e => setGstNumber(e.target.value)} required
                              placeholder="Enter GST Number" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                          <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                              placeholder="Enter Email" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile Number</label>
                          <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-400 border-r border-slate-200 pr-2">+91</span>
                            </div>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required
                              placeholder="81234 56789" className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {accountType === 'business' && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Address</label>
                            <textarea value={address} onChange={e => setAddress(e.target.value)} required
                              placeholder="Enter your address" rows={3}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">State</label>
                              <select value={state} onChange={e => setState(e.target.value)} required
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                              >
                                <option value="">Select your state</option>
                                <option value="Andhra Pradesh">Andhra Pradesh</option>
                                <option value="Telangana">Telangana</option>
                                <option value="Karnataka">Karnataka</option>
                                <option value="Tamil Nadu">Tamil Nadu</option>
                                <option value="Maharashtra">Maharashtra</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City</label>
                              <input type="text" value={city} onChange={e => setCity(e.target.value)} required
                                placeholder="Select your city" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pincode</label>
                              <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} required
                                placeholder="Select your pincode" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Area</label>
                              <input type="text" value={area} onChange={e => setArea(e.target.value)} required
                                placeholder="Select your area" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Referral Code (Optional)</label>
                            <div className="relative group">
                              <Zap className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                              <input type="text" value={referralCode} onChange={e => setReferralCode(e.target.value)}
                                placeholder="Enter Referral Code (Optional)" className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                          <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                            placeholder="Min. 8 characters" className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        id="register-submit-btn"
                        type="submit" disabled={loading}
                        className="w-full py-5 bg-amber-500 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 mt-4"
                      >
                        {loading ? 'Processing...' : accountType === 'business' ? 'Apply for B2B Account' : 'Initialize Account'}
                      </button>
                    </form>
                  )}

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-6 mt-12 pt-8 border-t border-slate-50">
                    {[
                      { icon: <ShieldCheck className="w-4 h-4" />, text: 'SSL Encrypted' },
                      { icon: <CheckCircle2 className="w-4 h-4" />, text: 'Trusted Store' }
                    ].map((badge, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <span className="text-slate-300">{badge.icon}</span> {badge.text}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
