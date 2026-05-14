import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Search, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.warn("404 Error: Attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-dark-gradient flex flex-col text-white">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Animated 404 Badge */}
        <div className="relative mb-8">
          <h1 className="text-[120px] md:text-[160px] font-black text-white/5 leading-none select-none tracking-tighter">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="glass-panel p-6 rounded-[40px] shadow-2xl shadow-[#3B82F6]/20 rotate-12 transition-transform hover:rotate-0 duration-500 border border-[#3B82F6]/30">
              <span className="text-5xl">🔍</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">
          Page Not Found
        </h2>
        <p className="text-white/50 mb-8 max-w-md mx-auto font-medium">
          The page you're looking for doesn't exist, has been moved, or is temporarily unavailable. Let's get you back on track!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex-1 bg-white/5 border border-white/10 text-white/60 rounded-2xl py-3.5 px-6 font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            Go Back
          </button>
          
          <button 
            onClick={() => navigate("/")}
            className="flex-1 bg-blue-gradient text-white rounded-2xl py-3.5 px-6 font-bold flex items-center justify-center gap-2 shadow-xl hover:shadow-blue transition-all"
          >
            <Home className="w-4 h-4" /> 
            Home Page
          </button>
        </div>

        <div className="mt-12 glass-panel rounded-3xl p-6 shadow-sm border border-white/10 max-w-sm w-full mx-auto">
          <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Looking for something?</p>
          <button 
            onClick={() => {
              navigate('/shop');
              setTimeout(() => {
                const searchBtn = document.getElementById('header-search-btn');
                if (searchBtn) searchBtn.click();
              }, 100);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 text-white/50 hover:text-[#3B82F6] hover:bg-[#3B82F6]/5 hover:border-[#3B82F6]/30 transition-all group cursor-pointer text-left"
          >
            <Search className="w-5 h-5 text-white/40 group-hover:text-[#3B82F6] transition-colors" />
            <span className="font-semibold text-sm">Search the entire store...</span>
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default NotFound;
