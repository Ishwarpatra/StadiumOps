import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: IntroScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Random incremental steps
        const step = Math.floor(Math.random() * 15) + 5;
        return Math.min(prev + step, 100);
      });
    }, 250);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <div className="bg-[#2d3039] h-screen w-screen overflow-hidden flex items-center justify-center relative font-sans text-base antialiased selection:bg-blue-500/30">
      {/* Custom styles for exact glows and animations */}
      <style>{`
        .progress-glow {
          box-shadow: 0 0 20px rgba(0, 112, 234, 0.6), 0 0 40px rgba(0, 112, 234, 0.3);
        }
        .logo-glow {
          filter: drop-shadow(0 0 30px rgba(0, 112, 234, 0.5));
          animation: pulse-glow 3s infinite alternate ease-in-out;
        }
        @keyframes pulse-glow {
          0% { filter: drop-shadow(0 0 20px rgba(0, 112, 234, 0.3)); }
          100% { filter: drop-shadow(0 0 50px rgba(0, 112, 234, 0.8)); }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#2d3039]/80 mix-blend-multiply z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#2d3039] via-transparent to-[#2d3039]/50 z-10"></div>
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat opacity-60" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDKen26A7JAKVkEsYk67YgYRaqjJuSh6VlierCFowhydA0bl5hkK4EA1Yzk5NzCeBhii3eYx9a-8EKhmE_6j_3kmqvEThOhf12wepFXsu-3ZIpzLF3xmmbR6mhG6NNCrkSd2kRELLpcRHh3j8UHeosTJbyq3xqxPUBbqq9uIb8tEWI5fjLeU_DZOTPVaHHvpVbw82VCFNJwoxTuQ8pyko49MbN53C-S_hDfTHmpkST4V85DjN_DDB0Dj35d-i61WY1LixgAjuNNd2A')" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full max-w-2xl px-6">
        {/* Logo */}
        <div className="mb-16 opacity-0 animate-fade-in-up delay-100 flex flex-col items-center">
          <img 
            alt="StadiumOps Pro Logo" 
            className="w-48 h-48 md:w-64 md:h-64 object-contain logo-glow rounded-xl bg-[#f9f9ff]/5 p-3 backdrop-blur-sm border border-[#717786]/20" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWxHMwbPIt0AZqUv3jX_V0PWvAWvHSZe7VjlDLc3rVPl9EcY8dh2RmzBqMWy-6t6Qd8F-QjyTup8bzGtIF9THaXVUFsnGkJEtZrxJRlsfjyZVhE9AmRjxAkIK-WylIibttBxjOzusNwLACGW1eH4GuDPmsH9Ijog7bzOyf7NiSUr-MS8sIMz0EQTpseUixvw--ESsiGzaBfhnezwwqSExXiH_-_w29NPE9mmM2UaOJyCuvuR51G8GXsD5NMt_bTC19CISuuXz9XN8"
            referrerPolicy="no-referrer"
          />
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white mt-6 tracking-tight text-center">
            StadiumOps<span className="text-[#0070ea]">Pro</span>
          </h1>
        </div>

        {/* Progress Section */}
        <div className="w-full max-w-md opacity-0 animate-fade-in-up delay-300 flex flex-col items-center">
          {/* Progress Bar Container */}
          <div className="w-full h-2 bg-[#e0e2ed]/20 rounded-full overflow-hidden backdrop-blur-md border border-[#717786]/10 relative">
            {/* Animated Progress Fill */}
            <div 
              className="h-full bg-[#0070ea] progress-glow rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect on progress bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
            </div>
          </div>

          {/* Loading Status Text */}
          <div className="mt-3 flex flex-col items-center text-center opacity-0 animate-fade-in-up delay-500">
            <p className="text-sm font-semibold text-[#adc7ff] uppercase tracking-wider flex items-center gap-1">
              <RefreshCw className="w-4 h-4 animate-spin text-[#0070ea]" />
              Initializing Neural Operations Hub...
            </p>
            <p className="text-xs text-[#717786] mt-1">Syncing real-time venue telemetry</p>
          </div>
        </div>
      </div>

      {/* Ambient floating particles (CSS generated for effect) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-[#0059bb] rounded-full blur-[2px] opacity-40 animate-[ping_4s_infinite]"></div>
        <div className="absolute top-[60%] left-[80%] w-3 h-3 bg-[#fdc003] rounded-full blur-[2px] opacity-30 animate-[ping_5s_infinite_1s]"></div>
        <div className="absolute top-[80%] left-[25%] w-1.5 h-1.5 bg-[#0070ea] rounded-full blur-[1px] opacity-50 animate-[ping_3s_infinite_2s]"></div>
        <div className="absolute top-[30%] left-[75%] w-2.5 h-2.5 bg-[#adc7ff] rounded-full blur-[2px] opacity-20 animate-[ping_6s_infinite_0.5s]"></div>
      </div>
    </div>
  );
}
