import React, { useEffect, useState } from 'react';
import { eventService } from '../services/eventService';
import { Event } from '../types';
import { Check, X, Trash2, ArrowLeft, Loader2, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AdminDashboardProps {
    onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        try {
            // Intentionally using a cast or direct call if I added getAllAdmin type definition
            const allEvents = await eventService.getAllAdmin();
            setEvents(allEvents);
        } catch (error) {
            console.error("Failed to load admin events", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        if (!window.confirm(`Tem certeza que deseja ${status === 'approved' ? 'APROVAR' : 'REJEITAR'} este evento?`)) return;

        try {
            await eventService.updateStatus(id, status);
            // Optimistic update
            setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));
        } catch (error) {
            alert("Erro ao atualizar status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja EXCLUIR este evento permanentemente?")) return;

        try {
            await eventService.delete(id);
            setEvents(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            alert("Erro ao excluir evento");
        }
    };

    const pendingEvents = events.filter(e => e.status === 'pending');
    const approvedEvents = events.filter(e => e.status === 'approved');
    const rejectedEvents = events.filter(e => e.status === 'rejected');

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
                    <button
                        onClick={onLogout}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Sair
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* PENDING */}
                        <section>
                            <h2 className="text-xl font-semibold text-amber-600 mb-4 flex items-center">
                                <span className="bg-amber-100 p-1 rounded mr-2">
                                    ⚠️
                                </span>
                                Pendentes de Aprovação ({pendingEvents.length})
                            </h2>

                            {pendingEvents.length === 0 ? (
                                <p className="text-gray-500 italic">Nenhum evento pendente.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {pendingEvents.map(event => (
                                        <AdminEventCard
                                            key={event.id}
                                            event={event}
                                            onApprove={() => handleStatusUpdate(event.id, 'approved')}
                                            onReject={() => handleStatusUpdate(event.id, 'rejected')}
                                            onDelete={() => handleDelete(event.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        <div className="border-t border-gray-200 my-8"></div>

                        {/* APPROVED */}
                        <section>
                            <h2 className="text-xl font-semibold text-emerald-600 mb-4 flex items-center">
                                <span className="bg-emerald-100 p-1 rounded mr-2">
                                    ✅
                                </span>
                                Eventos Aprovados ({approvedEvents.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {approvedEvents.map(event => (
                                    <AdminEventCard
                                        key={event.id}
                                        event={event}
                                        isAdminList
                                        onDelete={() => handleDelete(event.id)}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* REJECTED (Optional to show) */}
                        {rejectedEvents.length > 0 && (
                            <>
                                <div className="border-t border-gray-200 my-8"></div>
                                <section>
                                    <h2 className="text-xl font-semibold text-red-600 mb-4">Eventos Rejeitados ({rejectedEvents.length})</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {rejectedEvents.map(event => (
                                            <AdminEventCard
                                                key={event.id}
                                                event={event}
                                                isRejected
                                                onApprove={() => handleStatusUpdate(event.id, 'approved')}
                                                onDelete={() => handleDelete(event.id)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

// Subcomponent for Admin Card
const AdminEventCard = ({ event, onApprove, onReject, onDelete, isAdminList, isRejected }: any) => {
    return (
        <div className={`bg-white rounded-lg shadow border-l-4 ${isAdminList ? 'border-emerald-500' : (isRejected ? 'border-red-500' : 'border-amber-400')} overflow-hidden flex flex-col`}>
            {event.imageUrl && (
                <div className="h-32 w-full overflow-hidden">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                </div>
            )}
            <div className="p-4 flex-grow">
                <h3 className="font-bold text-gray-900">{event.title}</h3>
                <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(event.date, "dd 'de' MMMM", { locale: ptBR })} • {event.startTime}
                    </div>
                    <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.city}
                    </div>
                    <p className="line-clamp-2 mt-2 text-xs">{event.description}</p>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                    Organizador: <span className="font-medium">{event.organizer}</span>
                </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 flex justify-end items-center gap-2 border-t border-gray-100">
                {onApprove && (
                    <button onClick={onApprove} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full" title="Aprovar">
                        <Check className="w-5 h-5" />
                    </button>
                )}
                {onReject && (
                    <button onClick={onReject} className="p-2 text-amber-600 hover:bg-amber-50 rounded-full" title="Rejeitar">
                        <X className="w-5 h-5" />
                    </button>
                )}
                {onDelete && (
                    <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Excluir">
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    )
}
