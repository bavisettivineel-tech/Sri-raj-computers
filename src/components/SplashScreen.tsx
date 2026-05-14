import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 3500);
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 100));
    }, 25);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            y: -20,
            filter: 'blur(20px)',
            transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-white"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 180, 270, 360],
                x: [0, 50, 0, -50, 0],
                y: [0, -30, 0, 30, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]"
            />
            <motion.div
              animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [360, 270, 180, 90, 0],
                x: [0, -40, 0, 40, 0],
                y: [0, 40, 0, -40, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-secondary/5 blur-[120px]"
            />
            
            {/* Floating Geometric Shapes */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.2, 0],
                  scale: [0.5, 1, 0.8],
                  y: [-20, -120],
                  x: i % 2 === 0 ? [0, 30] : [0, -30],
                  rotate: [0, 180]
                }}
                transition={{ 
                  duration: 4 + i, 
                  repeat: Infinity, 
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
                className="absolute"
                style={{
                  left: `${15 + i * 15}%`,
                  bottom: '10%',
                  width: i % 2 === 0 ? '12px' : '20px',
                  height: i % 2 === 0 ? '12px' : '20px',
                  borderRadius: i % 3 === 0 ? '50%' : '4px',
                  border: `2px solid ${i % 2 === 0 ? '#7C3AED' : '#F59E0B'}`,
                  opacity: 0.1
                }}
              />
            ))}
          </div>

          {/* Main Logo & Text Container */}
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                rotateY: 0,
                transition: { duration: 1, ease: [0.34, 1.56, 0.64, 1] }
              }}
              className="relative mb-8"
            >
              {/* Glossy Icon Box */}
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  rotateY: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-24 h-24 bg-gradient-to-br from-primary via-primary to-primary-foreground rounded-[32px] flex items-center justify-center shadow-2xl shadow-primary/30 relative overflow-hidden group"
              >
                <span className="text-white text-3xl font-black tracking-tighter font-heading z-10">SRC</span>
                
                {/* Shine Effect */}
                <motion.div
                  animate={{ left: ['-150%', '150%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  className="absolute top-0 bottom-0 w-1/2 bg-white/20 skew-x-[25deg] blur-md"
                />
              </motion.div>

              {/* Orbital Rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 border border-primary/10 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8 border border-secondary/10 rounded-full border-dashed"
              />
            </motion.div>

            {/* Brand Text Reveal */}
            <div className="text-center overflow-hidden">
              <motion.h1 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-heading"
              >
                Sri Raj Computers
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, letterSpacing: '0px' }}
                animate={{ opacity: 1, letterSpacing: '8px' }}
                transition={{ delay: 0.8, duration: 1 }}
                className="mt-3 text-[10px] font-black uppercase text-secondary tracking-[8px] flex items-center justify-center gap-2"
              >
                <div className="h-[1px] w-8 bg-secondary/30" />
                <span>& IT Solutions</span>
                <div className="h-[1px] w-8 bg-secondary/30" />
              </motion.div>
            </div>

            {/* Sophisticated Loading Indicator */}
            <div className="mt-16 w-64">
              <div className="flex justify-between items-end mb-2">
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400"
                >
                  Initializing Systems
                </motion.span>
                <span className="text-[10px] font-black text-primary">{progress}%</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-[1px]">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
          
          {/* Version / Copyright Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-12 flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-4 bg-slate-200" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[3px]">
                Powering Digital Excellence
              </p>
              <div className="h-[1px] w-4 bg-slate-200" />
            </div>
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
              v2.5.0 © 2024
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
