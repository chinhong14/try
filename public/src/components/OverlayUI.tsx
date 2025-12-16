
import React, { useState } from 'react';
import { AppState } from '../types';
import Ticket from './Ticket';
import { MEMORY_LANE } from '../constants';

interface OverlayUIProps {
  appState: AppState;
  onJoin: () => void;
  onSubmitName: (name: string) => void;
  onGrabTicket: () => void;
  onRegister?: () => void;
  userName: string;
  currentSlideIndex?: number;
}

const ItineraryItem = ({ time, title, desc, icon }: { time: string, title: string, desc: string, icon: React.ReactNode }) => (
  <div className="flex gap-4 items-start relative pb-6 last:pb-0">
    {/* Time Column */}
    <div className="min-w-[70px] text-right pt-0.5">
      <span className="text-gold-500 font-serif text-[10px] md:text-xs font-bold tracking-wider block">{time}</span>
    </div>

    {/* Timeline Line & Dot */}
    <div className="relative flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-slate-900 border border-gold-500 shadow-[0_0_8px_rgba(234,179,8,0.5)] z-10"></div>
        <div className="absolute top-3 w-[1px] h-full bg-gradient-to-b from-gold-500/50 to-transparent -z-0"></div>
    </div>

    {/* Content Column */}
    <div className="flex-1 pt-0">
       <h3 className="text-white font-bold text-sm tracking-wide flex items-center gap-2">
         {title}
       </h3>
       <p className="text-slate-400 text-xs mt-1 leading-relaxed opacity-80 font-light">{desc}</p>
    </div>
  </div>
);

const OverlayUI: React.FC<OverlayUIProps> = ({ appState, onJoin, onSubmitName, onGrabTicket, onRegister, userName, currentSlideIndex = -1 }) => {
  const [inputValue, setInputValue] = useState('');

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().length > 0) {
      onSubmitName(inputValue);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center z-10 p-4">
      {/* Background Gradient Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]"></div>

      {/* SEQUENCE OVERLAY (CAPTION ONLY) */}
      {appState === 'SEQUENCE' && currentSlideIndex !== -1 && (
        <div key={currentSlideIndex} className="absolute bottom-16 md:bottom-24 z-50 flex flex-col items-center justify-center p-6 w-full animate-fade-in-up">
             <div className="bg-black/60 px-8 py-4 rounded-full backdrop-blur-md border border-gold-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] max-w-2xl">
                 <p className="text-gold-300 font-serif text-lg md:text-2xl text-center italic tracking-wider drop-shadow-md">
                    "{MEMORY_LANE[currentSlideIndex].text}"
                 </p>
             </div>
        </div>
      )}

      {/* Main Container - Adjusted width for different states */}
      <div className={`relative z-20 w-full text-center pointer-events-auto transition-all duration-500 
        ${appState === 'TICKET' ? 'max-w-5xl h-full flex flex-col justify-center' : ''}
        ${appState === 'ITINERARY' ? 'max-w-xl' : 'max-w-2xl'}
      `}>
        
        {/* INITIAL STATE: Titles and Button */}
        {appState === 'SCATTERED' && (
          <div className="flex flex-col items-center gap-8 animate-fade-in">
            <div className="space-y-2">
              <h2 className="font-serif text-gold-400 text-xl md:text-2xl tracking-[0.3em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Kundasang Gang
              </h2>
              <h1 className="font-script text-6xl md:text-8xl text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                Christmas Party
              </h1>
            </div>

            <button
              onClick={onJoin}
              className="
                group relative px-12 py-4 mt-8
                bg-transparent overflow-hidden rounded-full
                border border-gold-500 text-gold-400
                font-serif tracking-widest font-bold text-lg
                transition-all duration-500 ease-out
                hover:text-white hover:border-white hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]
              "
            >
              <span className="relative z-10">JOIN</span>
              <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-gold-500/20"></div>
            </button>
          </div>
        )}

        {/* REGISTER STATE: Final message after formation */}
        {appState === 'REGISTER' && (
             <div className="flex flex-col items-center gap-8 animate-fade-in-up max-w-3xl">
                <h2 className="font-serif text-white text-3xl md:text-5xl leading-tight drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                    You are the only gang we needed.
                </h2>
                <p className="font-sans text-gold-300 text-lg md:text-xl tracking-wide font-light">
                    Join the Kundasang Gang Christmas Party.
                </p>

                <button
                    onClick={onRegister}
                    className="
                        group relative px-16 py-4 mt-4
                        bg-gold-500 text-slate-900 rounded-lg
                        font-serif tracking-[0.2em] font-bold text-sm md:text-base
                        hover:bg-white hover:scale-105 transition-all duration-300
                        shadow-[0_0_40px_rgba(234,179,8,0.4)]
                    "
                >
                    REGISTER NOW
                </button>
             </div>
        )}

        {/* INPUT STATE: Name Entry */}
        {appState === 'INPUT' && (
          <div className="animate-fade-in-up backdrop-blur-sm bg-slate-900/60 p-8 rounded-2xl border border-white/10 shadow-2xl mx-auto max-w-lg">
            <h2 className="font-serif text-white text-2xl mb-6 tracking-wide">Enter Your Name</h2>
            <form onSubmit={handleNameSubmit} className="flex flex-col gap-4">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Santa's Favorite..."
                autoFocus
                className="
                  w-full bg-slate-800/50 border-b-2 border-gold-500/50 
                  text-center text-2xl text-white font-sans py-3 focus:outline-none focus:border-gold-400
                  placeholder:text-slate-500
                "
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="
                  mt-4 bg-emerald-700 hover:bg-emerald-600 
                  text-white font-serif tracking-widest py-3 px-8 rounded 
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-[0_0_15px_rgba(6,78,59,0.5)]
                "
              >
                CONFIRM
              </button>
            </form>
          </div>
        )}

        {/* ITINERARY STATE */}
        {appState === 'ITINERARY' && (
          <div className="animate-fade-in-up backdrop-blur-md bg-slate-950/80 p-6 md:p-8 rounded-2xl border border-gold-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] mx-auto w-full text-left relative overflow-hidden max-h-[85vh] overflow-y-auto no-scrollbar">
             {/* Decorative glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="text-center mb-6">
                    <h2 className="font-serif text-gold-400 text-[10px] tracking-[0.3em] uppercase mb-1">24th - 25th December</h2>
                    <h1 className="font-script text-4xl text-white drop-shadow-md">
                      The Gathering Plan
                    </h1>
                </div>

                <div className="space-y-1 mb-8">
                    <ItineraryItem time="12:00 PM" title="Arrival & Lunch" desc="Meet up and enjoy a hearty lunch together." icon={null} />
                    <ItineraryItem time="02:00 PM" title="Check-In" desc="Head to the Kundasang Airbnb & settle in." icon={null} />
                    <ItineraryItem time="04:00 PM" title="Setup & Decor" desc="Decorate the cabin, prep dinner, & set up the gift area." icon={null} />
                    <ItineraryItem time="07:00 PM" title="The Feast" desc="BBQ or Steamboat dinner under the cool mountain air." icon={null} />
                    <ItineraryItem time="09:00 PM" title="Gift Exchange" desc="Unwrap surprises! Who is your Secret Santa?" icon={null} />
                    <ItineraryItem time="10:00 PM" title="Games & Social" desc="Group games, chit-chat, and good vibes." icon={null} />
                    <ItineraryItem time="Late" title="Cheers & Chill" desc="End the night with soda, drinks, and cozy conversations." icon={null} />
                </div>

                <div className="flex justify-center mt-auto pb-2">
                    <button 
                        onClick={onGrabTicket}
                        className="
                            group relative px-8 py-3 w-full md:w-auto
                            bg-gold-500 text-slate-900 rounded-full
                            font-serif tracking-[0.2em] font-bold text-xs
                            hover:bg-white hover:scale-105 transition-all duration-300
                            shadow-[0_0_20px_rgba(234,179,8,0.4)]
                            flex items-center justify-center gap-2
                        "
                    >
                        <span>GRAB YOUR TICKET</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* TICKET STATE: Final Result */}
        {appState === 'TICKET' && (
          <div className="flex justify-center w-full h-full items-center overflow-y-auto no-scrollbar py-8">
            <Ticket name={userName} />
          </div>
        )}
      </div>

      {/* Footer Branding - Always visible unless Ticket */}
      {appState !== 'TICKET' && appState !== 'ITINERARY' && appState !== 'SEQUENCE' && (
        <div className="absolute bottom-8 text-slate-500 font-serif text-xs tracking-[0.2em] opacity-60">
          DECEMBER 24 • 2025
        </div>
      )}
    </div>
  );
};

export default OverlayUI;
