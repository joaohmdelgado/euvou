import React, { useMemo } from 'react';
import { Event, Participant } from '../types';
import { X, Calendar, MapPin, Clock, Tag, ExternalLink, Instagram, Users, Share2, Heart } from 'lucide-react';
import { Button } from './ui/Button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventDetailsProps {
  event: Event;
  onClose: () => void;
  onRsvpClick: () => void;
}

export const EventDetails: React.FC<EventDetailsProps> = ({ event, onClose, onRsvpClick }) => {
  // Sort participants by recently confirmed
  const sortedParticipants = useMemo(() => {
    return [...event.participants].sort((a, b) => 
      new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime()
    );
  }, [event.participants]);

  const progressPercentage = Math.min((event.participants.length / event.participantsGoal) * 100, 100);

  return (
    <div className="fixed inset-0 z-40 bg-white md:bg-gray-100 flex justify-center">
      {/* Container for Centered Content on Desktop */}
      <div className="w-full h-full md:max-w-4xl md:h-[90vh] md:mt-[5vh] md:rounded-2xl md:shadow-2xl md:overflow-hidden bg-white relative flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-0">
          {/* Header Image */}
          <div className="relative h-64 md:h-80 w-full">
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-6">
              <span className="inline-block px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-md mb-3">
                {event.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight shadow-sm">
                {event.title}
              </h1>
              <div className="flex items-center text-gray-200 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {event.city}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Main Content */}
            <div className="flex-1 p-6 space-y-8">
              
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-brand-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Data</p>
                    <p className="text-sm font-medium text-gray-900">{format(event.date, "d 'de' MMMM", { locale: ptBR })}</p>
                    <p className="text-sm text-gray-600">{format(event.date, "EEEE", { locale: ptBR })}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-brand-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Horário</p>
                    <p className="text-sm font-medium text-gray-900">{event.startTime}</p>
                    <p className="text-sm text-gray-600">{event.duration} de duração</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl flex items-start space-x-3 col-span-2">
                  <MapPin className="w-5 h-5 text-brand-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Local</p>
                    <p className="text-sm font-medium text-gray-900">{event.locationName}</p>
                    <p className="text-sm text-gray-600">{event.address}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Sobre o Evento</h3>
                <p className="text-gray-600 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Organizer */}
              <div className="flex items-center space-x-3 border-t border-b border-gray-100 py-4">
                 <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold">
                    {event.organizer.substring(0,2).toUpperCase()}
                 </div>
                 <div>
                    <p className="text-xs text-gray-500">Organizado por</p>
                    <p className="text-sm font-bold text-gray-900">{event.organizer}</p>
                 </div>
              </div>

              {/* Map Placeholder */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Localização</h3>
                <div className="w-full h-48 bg-gray-200 rounded-xl overflow-hidden relative group">
                  {/* Mock Map */}
                  <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=13&size=600x300&maptype=roadmap')] bg-cover bg-center opacity-60"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button variant="outline" className="bg-white/80 backdrop-blur">
                      <MapPin className="w-4 h-4 mr-2" />
                      Ver no Google Maps
                    </Button>
                  </div>
                </div>
              </div>

            </div>

            {/* Sidebar / Bottom on Mobile - Participants */}
            <div className="bg-gray-50 p-6 md:w-80 md:border-l border-gray-100">
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-brand-600" />
                    Quem vai
                  </h3>
                  <span className="text-brand-600 font-bold">{event.participants.length}</span>
                </div>
                
                {/* Progress Bar for Goal */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div 
                    className="bg-brand-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-right mb-4">Meta: {event.participantsGoal} pessoas</p>

                {/* Participants List */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {sortedParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center bg-white p-2 rounded-lg shadow-sm">
                      <img 
                        src={participant.photoUrl} 
                        alt={participant.name} 
                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{participant.name}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{participant.age} anos</span>
                          <span className="mx-1">•</span>
                          <span>{participant.originCity}</span>
                        </div>
                      </div>
                      {participant.instagramHandle && (
                        <a 
                          href={`https://instagram.com/${participant.instagramHandle.replace('@', '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-pink-600 hover:bg-pink-50 p-1.5 rounded-full transition-colors"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                  {sortedParticipants.length === 0 && (
                    <p className="text-center text-gray-500 py-4 text-sm">Seja o primeiro a confirmar!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="absolute md:relative bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 px-6 flex items-center justify-between z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
          <div className="hidden md:block">
            <p className="text-xs text-gray-500 uppercase font-bold">Entrada</p>
            <p className="text-xl font-bold text-brand-700">
              {event.price === 0 ? 'Grátis' : `R$ ${event.price.toFixed(2)}`}
            </p>
          </div>
          
          <div className="flex space-x-3 w-full md:w-auto">
            <button className="p-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <Button 
              size="lg" 
              className="flex-1 md:px-8 shadow-lg shadow-brand-200 hover:shadow-brand-300 transform hover:-translate-y-0.5 transition-all"
              onClick={onRsvpClick}
            >
              EU VOU! ✋
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};