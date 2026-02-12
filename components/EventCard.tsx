import React from 'react';
import { Event } from '../types';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  return (
    <div 
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={() => onClick(event)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-brand-700 shadow-sm">
          {event.price === 0 ? 'Grátis' : `R$ ${event.price}`}
        </div>
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-white">
          {event.category}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center text-xs text-brand-600 font-semibold mb-2">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          {format(event.date, "EEE, d 'de' MMM", { locale: ptBR }).toUpperCase()} • {event.startTime}
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {event.title}
        </h3>
        
        <div className="flex items-start text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">{event.locationName}, {event.city}</span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center text-gray-600 text-sm">
            <div className="flex -space-x-2 mr-2">
              {event.participants.slice(0, 3).map((p) => (
                <img 
                  key={p.id}
                  src={p.photoUrl} 
                  alt={p.name}
                  className="w-6 h-6 rounded-full border-2 border-white object-cover"
                />
              ))}
              {event.participants.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                  +{event.participants.length - 3}
                </div>
              )}
            </div>
            <span className="font-medium text-brand-600">{event.participants.length}</span>
            <span className="text-gray-400 ml-1 text-xs">vão</span>
          </div>
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-full group-hover:bg-brand-100 transition-colors">
            Ver detalhes
          </span>
        </div>
      </div>
    </div>
  );
};