import React from 'react';
import { CalendarSearch } from 'lucide-react';
import { Button } from './ui/Button';

interface NavbarProps {
  onCreateClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onCreateClick }) => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="bg-brand-600 p-2 rounded-lg mr-2">
                <CalendarSearch className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">Eu<span className="text-brand-600">Vou</span></span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden md:block text-sm text-gray-500">
                Descubra. Confirme. Vá.
             </div>
             <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Login
             </Button>
             <Button size="sm" onClick={onCreateClick}>
                Criar Evento
             </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};