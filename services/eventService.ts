import { Event, Participant } from '../types';
import { MOCK_EVENTS } from '../constants';

// Simulating a database in memory for the session
let eventsStore = [...MOCK_EVENTS];

export const eventService = {
  getAll: async (): Promise<Event[]> => {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(eventsStore), 500);
    });
  },

  create: async (eventData: Omit<Event, 'id' | 'participants'>): Promise<Event> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newEvent: Event = {
          ...eventData,
          id: String(Date.now()),
          participants: [],
        };
        // Add to beginning of list
        eventsStore = [newEvent, ...eventsStore];
        resolve(newEvent);
      }, 800);
    });
  },

  addParticipant: async (eventId: string, participantData: Omit<Participant, 'id' | 'confirmedAt'>): Promise<Event> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const eventIndex = eventsStore.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
          reject(new Error('Event not found'));
          return;
        }

        const newParticipant: Participant = {
          ...participantData,
          id: `part-${Date.now()}`,
          confirmedAt: new Date(),
        };

        const updatedEvent = {
          ...eventsStore[eventIndex],
          participants: [newParticipant, ...eventsStore[eventIndex].participants]
        };

        eventsStore[eventIndex] = updatedEvent;
        resolve(updatedEvent);
      }, 800);
    });
  },

  getById: (id: string): Event | undefined => {
    return eventsStore.find(e => e.id === id);
  }
};