import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  LayoutDashboard, Package, FolderOpen, Tag, ShoppingCart, Users, Store,
  Image, Percent, Ticket, BarChart3, Phone, Bell, Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

const navItems = [
  { key: 'dashboard',     label: 'Dashboard',           icon: LayoutDashboard },
  { key: 'products',      label: 'Products',            icon: Package },
  { key: 'categories',    label: 'Categories',          icon: FolderOpen },
  { key: 'brands',        label: 'Brands',              icon: Tag },
  { key: 'orders',        label: 'Orders',              icon: ShoppingCart },
  { key: 'users',         label: 'Users',               icon: Users },
  { key: 'dealers',       label: 'Dealers / B2B',       icon: Store },
  { key: 'banners',       label: 'Banners & Ads',       icon: Image },
  { key: 'deals',         label: 'Deals & Offers',      icon: Percent },
  { key: 'coupons',       label: 'Coupon Codes',        icon: Ticket },
  { key: 'reports',       label: 'Reports',             icon: BarChart3 },
  { key: 'contact',       label: 'Contact & Support',   icon: Phone },
  { key: 'notifications', label: 'Notifications',       icon: Bell },
  { key: 'settings',      label: 'App Settings',        icon: Settings },
];

const AdminLayout = ({ children, activeTab }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/'); return; }
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
      if (!data) { navigate('/'); return; }
      setIsAdmin(true);
      setAdminEmail(user.email || '');
    };
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchUnread = async () => {
      const { count } = await supabase.from('admin_notifications').select('id', { count: 'exact', head: true }).eq('is_read', false);
      setUnreadCount(count || 0);
    };
    fetchUnread();

    const channel = supabase.channel('admin-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_notifications' }, () => {
        fetchUnread();
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  if (isAdmin === null) return (
    <div className="flex items-center justify-center min-h-screen bg-dark-gradient">
      <div className="animate-pulse text-neon-cyan text-sm font-bold">Authorizing...</div>
    </div>
  );

  /* ── Shared Sidebar Nav ── */
  const SidebarNav = ({ compact = false }: { compact?: boolean }) => (
    <>
      <nav className="flex-1 py-3 flex flex-col gap-1 px-3 overflow-y-auto hide-scrollbar">
        {navItems.map(item => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { navigate(`/admin/${item.key}`); setMobileSidebarOpen(false); }}
              title={compact ? item.label : undefined}
              className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-bold transition-all duration-300 group relative ${
                isActive
                  ? 'bg-blue-gradient text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-[#3B82F6]/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[#3B82F6]/50 group-hover:text-[#3B82F6]'}`} />
              <span className="admin-nav-label truncate">{item.label}</span>
              {item.key === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-black rounded-full px-2 py-0.5 shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {/* Tooltip for collapsed tablet state */}
              {compact && (
                <span className="absolute left-full ml-4 px-3 py-1.5 glass-panel text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-blue border border-[#3B82F6]/30 translate-x-[-10px] group-hover:translate-x-0">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5 shrink-0 mt-auto">
        <button
          onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-bold text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
        >
          <LogOut className="w-4 h-4 shrink-0 text-red-400" />
          <span className="admin-nav-label">Logout</span>
        </button>
        <p className="text-center mt-3 text-[10px] text-[#3B82F6]/40 font-bold admin-nav-label tracking-widest uppercase">SRC Admin v2.5</p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-dark-gradient text-white flex flex-col md:flex-row w-full overflow-hidden">

      {/* ══════════════════════════════════════════════════
          DESKTOP + TABLET SIDEBAR (md+) — fixed, always visible
          Tablet: 64px collapsed, expands to 260px on hover
          Desktop: 260px always expanded
      ══════════════════════════════════════════════════ */}
      <aside className="admin-sidebar hidden md:flex flex-col group/sidebar w-[260px] shrink-0 border-r border-white/10 glass-panel relative z-40 transition-all duration-300">
        {/* Logo */}
        <div className="px-4 py-6 border-b border-white/10 shrink-0 overflow-hidden flex items-center justify-center">
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 shrink-0 bg-blue-gradient rounded-xl flex items-center justify-center text-sm font-black text-white shadow-blue border border-[#3B82F6]/50 relative overflow-hidden">
              <span className="relative z-10">SRC</span>
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
            <div className="admin-sidebar-logo-text overflow-hidden">
              <p className="text-base font-black text-white tracking-tight whitespace-nowrap text-neon-cyan">Raj Admin</p>
              <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest whitespace-nowrap">Control Panel</p>
            </div>
          </div>
        </div>

        <SidebarNav />
      </aside>

      {/* ══════════════════════════════════════════════════
          MOBILE SIDEBAR OVERLAY
      ══════════════════════════════════════════════════ */}
      {mobileSidebarOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-[60]"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="fixed top-0 left-0 bottom-0 w-72 glass-panel border-r border-white/10 text-white z-[70] flex flex-col shadow-2xl animate-fade-in">
            {/* Logo + close */}
            <div className="px-5 py-6 flex justify-between items-center border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-gradient rounded-xl flex items-center justify-center text-xs font-black text-white shadow-blue border border-[#3B82F6]/50">SRC</div>
                <div>
                  <p className="text-sm font-black text-neon-cyan">Raj Admin</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Control Panel</p>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 border-none bg-transparent cursor-pointer transition-colors"
              >
                <X className="w-5 h-5 text-white/60 hover:text-white" />
              </button>
            </div>

            {/* Nav (always show labels on mobile) */}
            <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col">
              <SidebarNav />
            </div>
          </aside>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════════════ */}
      <div className="admin-content flex-1 flex flex-col min-w-0 overflow-y-auto h-screen hide-scrollbar">
        {/* ── TOPBAR HEADER ── */}
        <header className="sticky top-0 z-30 glass-panel border-b border-white/10 shadow-sm">
          <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-16 lg:h-20">
            {/* Left: hamburger (mobile) + breadcrumb */}
            <div className="flex items-center gap-4">
              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-white/5 rounded-xl transition-colors border border-white/10 bg-transparent cursor-pointer shadow-sm"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>

              {/* Breadcrumb — desktop */}
              <div className="hidden lg:flex items-center gap-2 text-sm text-white/50 font-medium">
                <span className="text-white font-bold capitalize text-lg tracking-wide text-neon-cyan">{activeTab.replace(/-/g, ' ')}</span>
              </div>

              {/* Page title — mobile/tablet */}
              <h1 className="lg:hidden text-base md:text-lg font-black text-white capitalize tracking-wide text-neon-cyan">
                {activeTab.replace(/-/g, ' ')}
              </h1>
            </div>

            {/* Right: alerts + profile */}
            <div className="flex items-center gap-3 lg:gap-4">
              <button
                onClick={() => navigate('/admin/notifications')}
                className="relative p-2 lg:p-2.5 hover:bg-white/5 rounded-xl transition-all group border border-white/10 bg-transparent cursor-pointer hover:shadow-blue"
              >
                <Bell className="w-5 h-5 text-white/70 group-hover:text-[#3B82F6] transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 lg:top-1.5 lg:right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.8)] border border-red-400">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div className="hidden sm:block h-6 w-px bg-white/10 mx-1" />

              <div
                className="flex items-center gap-3 pl-1 cursor-pointer group p-1.5 pr-3 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10"
                onClick={() => navigate('/admin/settings')}
              >
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-white leading-none">Admin</p>
                  <p className="text-[10px] text-[#3B82F6]/70 mt-1.5 leading-none truncate max-w-[120px] font-medium">{adminEmail}</p>
                </div>
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-orange-gradient rounded-xl flex items-center justify-center text-sm font-black text-white shadow-orange border border-white/20 group-hover:scale-105 transition-transform duration-300">
                  {adminEmail.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="p-4 md:p-6 lg:p-8 w-full mx-auto min-h-[calc(100vh-80px)] animate-fade-in relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
