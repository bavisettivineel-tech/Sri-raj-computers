import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.1,
            filter: 'blur(10px)',
            transition: { duration: 0.8, ease: "easeInOut" }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: '#0f172a', // Slate-900
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Background 3D Floating Elements */}
          <motion.div
            animate={{ 
              rotateZ: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
              top: '-100px',
              right: '-100px',
            }}
          />
          <motion.div
            animate={{ 
              rotateZ: -360,
              scale: [1.2, 1, 1.2],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{
              position: 'absolute',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
              filter: 'blur(50px)',
              bottom: '-150px',
              left: '-150px',
            }}
          />

          {/* Main 3D Logo Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateX: 45, rotateY: -30 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotateX: 0, 
              rotateY: 0,
              transition: { duration: 1.2, ease: "easeOut" }
            }}
            style={{
              perspective: '1000px',
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            {/* Glossy Icon Box */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotateY: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
                borderRadius: '24px',
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 50px rgba(59,130,246,0.3), 0 0 40px rgba(16,185,129,0.2), inset 0 2px 10px rgba(255,255,255,0.2)',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '30px', fontWeight: 900, color: '#0F172A', letterSpacing: '-2px' }}>SRC</div>
              
              {/* Spinning Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{
                  position: 'absolute',
                  inset: '-10px',
                  border: '2px dashed rgba(255,255,255,0.1)',
                  borderRadius: '32px',
                }}
              />
            </motion.div>

            {/* Brand Text with 3D Pop Effect */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h1 style={{
                fontSize: '24px',
                fontWeight: 900,
                color: 'white',
                letterSpacing: '-0.5px',
                margin: 0,
                textTransform: 'uppercase',
                background: 'linear-gradient(to bottom, #ffffff, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block'
              }}>
                Sri Raj Computers
              </h1>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#3B82F6',
                  letterSpacing: '4px',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginTop: '8px',
                  textShadow: '0 0 10px rgba(59,130,246,0.6)',
                }}
              >
                & IT Solutions
              </motion.span>
            </motion.div>

            {/* Loading Bar */}
            <div style={{
              width: '140px',
              height: '3px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '2px',
              margin: '32px auto 0',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <motion.div
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: '50%',
                  background: 'linear-gradient(90deg, transparent, #3B82F6, #10B981, transparent)',
                }}
              />
            </div>
          </motion.div>
          
          {/* Footer Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{
              position: 'absolute',
              bottom: '40px',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.2)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
          >
            Powering Digital Excellence
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
