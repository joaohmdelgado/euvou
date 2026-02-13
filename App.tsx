import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { EventCard } from './components/EventCard';
import { EventDetails } from './components/EventDetails';
import { RsvpModal } from './components/RsvpModal';
import { CreateEventModal } from './components/CreateEventModal';
import { eventService } from './services/eventService';
import { Event, EventCategory, Participant } from './types';
import { Search, MapPin, Filter, Loader2 } from 'lucide-react';
import { CITIES } from './constants';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Admin / Routing State
  const [view, setView] = useState<'home' | 'admin-login' | 'admin-dashboard'>('home');

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        if (view !== 'admin-dashboard') {
          setView('admin-login');
        }
      } else {
        if (view !== 'admin-dashboard') {
          setView('home');
        }
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [view]);

  const [connectionStatus, setConnectionStatus] = useState({ isConnected: false, isLoading: true });

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    const isConnected = await eventService.checkConnection();
    setConnectionStatus({ isConnected, isLoading: false });
  };

  useEffect(() => {
    if (view === 'home') {
      loadEvents();
    }
  }, [view]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getAll();
      setEvents(data);
    } catch (error) {
      console.error("Failed to load events", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
  };

  const handleRsvpClick = () => {
    setIsRsvpOpen(true);
  };

  const handleCloseRsvp = () => {
    setIsRsvpOpen(false);
  };

  const handleCreateEventClick = () => {
    setIsCreateEventOpen(true);
  };

  const handleCloseCreateEvent = () => {
    setIsCreateEventOpen(false);
  };

  const handleConfirmRsvp = async (participantData: Partial<Participant>) => {
    if (!selectedEvent) return;

    // Optimistic UI update or wait for "server"
    try {
      const updatedEvent = await eventService.addParticipant(selectedEvent.id, participantData as any);

      // Update local state lists
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
      setSelectedEvent(updatedEvent);
    } catch (error) {
      console.error("RSVP failed", error);
      alert("Erro ao confirmar presença. Tente novamente.");
    }
  };

  const handleCreateEventSubmit = async (eventData: Omit<Event, 'id' | 'participants'>) => {
    try {
      const newEvent = await eventService.create(eventData);
      setEvents(prev => [newEvent, ...prev]);
    } catch (error) {
      console.error("Create event failed", error);
      alert("Erro ao criar evento. Tente novamente.");
    }
  };

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = selectedCity === 'Todas' || event.city === selectedCity;
      const matchesCategory = selectedCategory === 'Todas' || event.category === selectedCategory;

      return matchesSearch && matchesCity && matchesCategory;
    });
  }, [events, searchTerm, selectedCity, selectedCategory]);

  const categories = ['Todas', ...Object.values(EventCategory)];

  if (view === 'admin-login') {
    return <AdminLogin onLogin={() => setView('admin-dashboard')} />;
  }

  if (view === 'admin-dashboard') {
    return <AdminDashboard onLogout={() => { window.location.hash = ''; setView('home'); }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar onCreateClick={handleCreateEventClick} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero / Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="text-center md:text-left mb-6">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              O que vamos fazer hoje?
            </h1>
            <p className="mt-2 text-gray-600">
              Encontre os melhores eventos e veja quem já confirmou presença.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">

            {/* Search */}
            <div className="relative flex-grow w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* City Filter */}
            <div className="relative w-full md:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm appearance-none"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative w-full md:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

          </div>

          {/* Quick Stats / Tags */}
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {categories.slice(1).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? 'Todas' : cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
          </div>
        ) : (
          <>
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={handleEventClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">Nenhum evento encontrado para os filtros selecionados.</p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('Todas'); setSelectedCity('Todas') }}
                  className="mt-4 text-brand-600 font-medium hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={handleCloseDetails}
          onRsvpClick={handleRsvpClick}
        />
      )}

      {selectedEvent && (
        <RsvpModal
          event={selectedEvent}
          isOpen={isRsvpOpen}
          onClose={handleCloseRsvp}
          onConfirm={handleConfirmRsvp}
        />
      )}

      <CreateEventModal
        isOpen={isCreateEventOpen}
        onClose={handleCloseCreateEvent}
        onSubmit={handleCreateEventSubmit}
      />

      <Footer isConnected={connectionStatus.isConnected} isLoading={connectionStatus.isLoading} />
    </div>
  );
}