import React from 'react';

interface FooterProps {
  isLoading: boolean;
  isConnected: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isLoading, isConnected }) => {
  return (
    <footer className="fixed bottom-0 left-0 w-full p-4 pointer-events-none flex justify-center z-50">
      <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-3 pointer-events-auto transition-all hover:shadow-xl transform hover:-translate-y-0.5">
        
        <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : (isConnected ? 'bg-emerald-500' : 'bg-red-500')} ${!isLoading && 'animate-pulse-soft'}`}></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            {isLoading ? 'Sincronizando...' : (isConnected ? 'Conectado' : 'Offline')}
          </span>
        </div>

        <a 
          href="https://in9digital.com.br" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-2 group"
          title="Desenvolvido e mantido por IN9Digital"
        >
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-block">
            Dev by
          </span>

          <img 
            src="/logo-in9-black.svg" 
            alt="Logo IN9Digital" 
            className="h-4 w-auto object-contain transition-all duration-300"
          />

        </a>

      </div>
    </footer>
  );
};
