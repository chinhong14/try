
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

interface TicketProps {
  name: string;
}

// Tree Icon Component
const TreeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15 8H9L12 2Z" fill="#FBBF24" />
    <path d="M12 4L16 12H8L12 4Z" fill="#10B981" />
    <path d="M12 9L18 17H6L12 9Z" fill="#059669" />
    <path d="M12 14L20 22H4L12 14Z" fill="#047857" />
    <circle cx="12" cy="3" r="1" fill="#FEF3C7" className="animate-pulse" />
    <circle cx="10" cy="10" r="0.8" fill="#EF4444" />
    <circle cx="14" cy="15" r="0.8" fill="#FBBF24" />
    <circle cx="9" cy="19" r="0.8" fill="#3B82F6" />
    <rect x="11" y="21" width="2" height="3" fill="#78350F" />
  </svg>
);

// Flexible Barcode Component
const Barcode: React.FC<{ vertical?: boolean; className?: string; color?: string }> = React.memo(({ vertical, className = "", color = "bg-slate-900" }) => {
  const bars = useMemo(() => {
    return Array.from({ length: 42 }).map((_, i) => ({
      width: Math.random() > 0.6 ? (vertical ? 'h-[3px]' : 'w-[3px]') : (vertical ? 'h-[1px]' : 'w-[1px]'),
    }));
  }, [vertical]);

  return (
    <div className={`flex ${vertical ? 'flex-col items-stretch justify-center gap-[3px] w-full' : 'flex-row items-end justify-start gap-[3px]'} opacity-90 ${className}`}>
      {bars.map((bar, i) => (
        <div key={i} className={`${color} ${bar.width} ${vertical ? 'w-full' : 'h-full'} rounded-[0.5px]`}></div>
      ))}
    </div>
  );
});

const Ticket: React.FC<TicketProps> = ({ name }) => {
  const [isTorn, setIsTorn] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDownload = async () => {
    if (!ticketRef.current || typeof window === 'undefined') return;
    setIsDownloading(true);
    try {
      // @ts-ignore
      const canvas = await window.html2canvas(ticketRef.current, {
        backgroundColor: null, scale: 2, logging: false, useCORS: true
      });
      const link = document.createElement('a');
      link.download = `Christmas_Party_Ticket_${name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) { console.error(error); } finally { setIsDownloading(false); }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default to avoid selection issues immediately
    if (!isTorn) setIsDragging(true);
  };

  const handleDragEnd = () => { 
    setIsDragging(false); 
    if (dragProgress < 95) setDragProgress(0); 
  };
  
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !containerRef.current || isTorn) return;
    
    // Prevent scrolling on mobile while dragging
    if (e.cancelable) e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    let progress = 0;
    
    // Use type narrowing or casting safely
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

    if (isMobile) {
        progress = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    } else {
        progress = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    }
    setDragProgress(progress);
    
    if (progress >= 98) { 
        setIsDragging(false); 
        setIsTorn(true); 
    }
  }, [isDragging, isMobile, isTorn]);

  useEffect(() => {
    if (isDragging) {
        // Use passive: false to allow preventing default behavior (scrolling)
        window.addEventListener('mousemove', handleDragMove); 
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('mouseup', handleDragEnd); 
        window.addEventListener('touchend', handleDragEnd);
    } else {
        window.removeEventListener('mousemove', handleDragMove); 
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd); 
        window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
        window.removeEventListener('mousemove', handleDragMove); 
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd); 
        window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove]);

  return (
    <div className="flex flex-col items-center gap-4 md:gap-8 animate-fade-in-up w-full max-w-[90vw] md:max-w-6xl px-0 md:px-0">
      
      {/* TICKET WRAPPER */}
      <div 
        className={`relative flex w-full filter drop-shadow-[0_0_40px_rgba(234,179,8,0.4)] transition-transform duration-500 ${isMobile ? 'flex-col items-center' : 'flex-row items-stretch'}`}
      >
        
        {/* =======================
            MAIN TICKET BODY
           ======================= */}
        <div 
            ref={ticketRef}
            className={`
                relative bg-slate-950/80 backdrop-blur-xl border-2 border-gold-500 overflow-hidden flex-shrink-0
                shadow-[0_0_20px_rgba(234,179,8,0.3),inset_0_0_40px_rgba(0,0,0,0.8)]
                ${isMobile 
                    ? 'w-full rounded-t-2xl border-b-0 min-h-[400px]' 
                    : 'flex-grow rounded-l-3xl border-r-0 pr-8 min-h-[380px]'}
                p-6 md:p-12 flex flex-col justify-between text-left
            `}
        >
            {/* Texture/Glow Overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(234,179,8,0.15),transparent_70%)] pointer-events-none"></div>
            
            {/* Top Right Decorative Corner */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8 pointer-events-none">
                 <div className="w-16 h-16 md:w-24 md:h-24 border-t-2 border-r-2 border-gold-400 rounded-tr-xl md:rounded-tr-3xl relative">
                    <div className="absolute top-2 right-2 md:top-4 md:right-4">
                        <TreeIcon />
                    </div>
                 </div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full text-left">
                
                {/* Header */}
                <div className="mb-6 md:mb-10">
                    <h2 className="font-script text-3xl md:text-5xl text-gold-400 mb-1 md:mb-2 transform -rotate-2 origin-bottom-left drop-shadow-md">
                        Kundasang Gang
                    </h2>
                    <h1 className="font-serif text-3xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-br from-gold-100 via-gold-300 to-gold-600 drop-shadow-sm uppercase tracking-wide">
                        Christmas Party
                    </h1>
                </div>

                {/* Main Guest Info */}
                <div className="flex flex-col items-start mb-auto w-full max-w-md">
                     <p className="text-[9px] md:text-[10px] text-gold-500/80 uppercase tracking-[0.2em] font-bold mb-1 md:mb-2">Guest Name</p>
                     
                     <div className="font-serif text-4xl md:text-6xl text-white tracking-wide mb-2 break-words w-full leading-tight">
                        {name || "Guest"}
                     </div>
                     
                     {/* Divider */}
                     <div className="w-full h-[1px] bg-gradient-to-r from-gold-500 to-transparent mb-3 md:mb-4"></div>
                     
                     <p className="text-gold-400 font-sans text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-bold">
                        Premium Invite
                     </p>
                </div>

                {/* Footer Info - Stacked on Mobile, Grid on Desktop */}
                <div className="flex justify-between items-end mt-6 md:mt-8">
                    <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-16 text-sm font-sans w-full max-w-lg">
                        {/* Date */}
                        <div className="text-left">
                            <p className="text-gold-600 uppercase text-[8px] md:text-[9px] tracking-widest mb-1 font-bold">Date & Time</p>
                            <p className="font-bold text-white text-base md:text-lg font-serif tracking-wide">DEC 24, 2025</p>
                            <p className="text-slate-400 text-[10px] md:text-xs tracking-wider">7:00 PM - LATE</p>
                        </div>
                        {/* Location */}
                        <div className="text-left">
                            <p className="text-gold-600 uppercase text-[8px] md:text-[9px] tracking-widest mb-1 font-bold">Location</p>
                            <p className="font-bold text-white text-sm md:text-base leading-tight font-serif">
                                KUNDASANG CABIN,<br/>SABAH
                            </p>
                        </div>
                    </div>

                    {/* Small Barcode (Right Side) */}
                    <div className="absolute right-0 bottom-0 mb-1 mr-[-10px] opacity-70">
                        <Barcode vertical={false} color="bg-slate-400" className="h-6 w-16 md:h-8 md:w-24" />
                        <p className="text-[6px] text-slate-500 font-mono text-right mt-1">ID: 8824-XMAS</p>
                    </div>
                </div>
            </div>
        </div>

        {/* =======================
            CUTTING LINE & TOOLS
           ======================= */}
        <div 
            ref={containerRef}
            className={`
                relative z-30 flex items-center justify-center
                ${isMobile ? 'w-full h-8' : 'h-auto w-8'}
            `}
        >
            {/* Perforation Line */}
            <div className={`absolute border-dashed border-white/30 ${isMobile ? 'w-full border-t-2 top-1/2 left-0' : 'h-full border-l-2 left-1/2 top-0'}`}></div>

            {/* Cutout Circles */}
            <div className={`absolute bg-slate-900 border border-gold-500/50 rounded-full z-10 w-4 h-4 md:w-5 md:h-5 ${isMobile ? '-left-2 top-1/2 -translate-y-1/2' : '-top-2.5 left-1/2 -translate-x-1/2'}`}></div>
            <div className={`absolute bg-slate-900 border border-gold-500/50 rounded-full z-10 w-4 h-4 md:w-5 md:h-5 ${isMobile ? '-right-2 top-1/2 -translate-y-1/2' : '-bottom-2.5 left-1/2 -translate-x-1/2'}`}></div>
            
            {/* Scissors Slider */}
            {!isTorn && (
                <div 
                    onMouseDown={handleDragStart} onTouchStart={handleDragStart}
                    className={`
                        absolute z-40 bg-gold-500 text-slate-900 rounded-full 
                        flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(234,179,8,0.8)]
                        cursor-grab active:cursor-grabbing hover:scale-110 hover:bg-white 
                        ${isMobile ? 'h-8 w-8 -translate-y-1/2 top-1/2' : 'w-9 h-9 -translate-x-1/2 left-1/2'}
                    `}
                    style={{ [isMobile ? 'left' : 'top']: `${dragProgress}%` }}
                >
                    <span className={`transform ${isMobile ? '-rotate-90' : 'rotate-180'} select-none`}>✂</span>
                </div>
            )}
        </div>

        {/* =======================
            STUB SECTION (SOLID GOLD)
           ======================= */}
        <div 
            className={`
                relative bg-gold-500 flex-shrink-0
                flex items-center justify-center overflow-hidden shadow-xl
                transition-all duration-1000 ease-in-out border-2 border-gold-600
                ${isMobile 
                    ? `w-full h-32 rounded-b-2xl border-t-0 ${isTorn ? 'animate-tear-off-vertical' : ''}` 
                    : `w-44 rounded-r-3xl border-l-0 ${isTorn ? 'animate-tear-off-horizontal' : ''}`
                }
            `}
        >
            {/* Instruction Text (Floating Right) */}
            {!isTorn && !isDragging && !isMobile && (
                <div className="absolute top-1/2 -translate-y-1/2 -right-12 h-64 flex items-center justify-center pointer-events-none">
                     <span className="text-white/60 font-bold text-[10px] tracking-[0.3em] animate-pulse whitespace-nowrap" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                         SLIDE DOWN TO CUT
                     </span>
                </div>
            )}

            {/* Instruction Text for Mobile */}
            {!isTorn && !isDragging && isMobile && (
                 <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-full flex items-center justify-center pointer-events-none">
                    <span className="text-slate-900/40 font-bold text-[8px] tracking-[0.3em] animate-pulse">
                        SLIDE RIGHT TO CUT
                    </span>
                 </div>
            )}

            <div className="relative z-10 flex flex-col h-full w-full p-4 md:p-6 justify-between items-center">
                
                {/* Large Vertical Barcode */}
                <div className="flex-grow w-full flex items-center justify-center py-2 md:py-4">
                     <Barcode vertical={true} color="bg-slate-900" className="w-full h-full opacity-80 mix-blend-multiply" />
                </div>
                
                {/* Stub Number */}
                <div className="mt-1 text-center">
                    <span className="font-mono text-slate-900 font-bold text-xs md:text-sm tracking-[0.2em]">
                        NO. 082492
                    </span>
                </div>
            </div>
        </div>

      </div>

      {/* SAVE BUTTON */}
      <div className={`transition-all duration-700 ease-in-out z-50 ${isTorn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="
            group flex items-center gap-3 px-8 py-3 md:px-10 md:py-4
            bg-gold-500 rounded-full shadow-[0_0_30px_rgba(234,179,8,0.4)]
            text-slate-900 font-serif tracking-widest text-xs md:text-sm font-bold
            hover:bg-white hover:scale-105 transition-all active:scale-95
          "
        >
          {isDownloading ? (
            <span>SAVING...</span>
          ) : (
            <>
              <span>SAVE TICKET</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Ticket;
