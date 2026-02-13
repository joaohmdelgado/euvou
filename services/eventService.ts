import { Event, Participant } from '../types';
import { MOCK_EVENTS } from '../constants';
import { db } from '../firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
  Timestamp,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

const COLLECTION_NAME = 'events';
const STORAGE_KEY = 'euvou_local_backup_v1';

// --- LOCAL STORAGE FALLBACK HELPERS ---
const getLocalEvents = (): Event[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_EVENTS));
      return MOCK_EVENTS;
    }
    return JSON.parse(data).map((e: any) => ({
      ...e,
      date: new Date(e.date),
      participants: (e.participants || []).map((p: any) => ({
        ...p,
        confirmedAt: new Date(p.confirmedAt)
      }))
    }));
  } catch (e) {
    console.error("Local storage error:", e);
    return MOCK_EVENTS;
  }
};

const saveLocalEvents = (events: Event[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.error("Error saving to local storage:", e);
  }
};
// --------------------------------------

// Helper to convert Firestore Timestamp to JS Date
const convertDocToEvent = (docSnap: any): Event => {
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
    participants: (data.participants || []).map((p: any) => ({
      ...p,
      confirmedAt: p.confirmedAt?.toDate ? p.confirmedAt.toDate() : new Date(p.confirmedAt)
    }))
  } as Event;
};

// Helper to handle Firebase errors gracefully
const handleFirebaseError = (error: any, context: string) => {
  const msg = error?.message || '';
  if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
    console.warn(`Firebase: Modo Offline/Local ativado. (Permissões pendentes no Console). Context: ${context}`);
  } else {
    console.warn(`Firebase Error (${context}):`, error);
  }
};

export const eventService = {
  getAll: async (): Promise<Event[]> => {
    try {
      if (!db) throw new Error("Firebase not initialized");

      const eventsRef = collection(db, COLLECTION_NAME);
      const q = query(eventsRef, orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);

      // Seeding logic for Firestore
      if (querySnapshot.empty) {
        console.log("Database empty. Seeding mock data to Firestore...");
        try {
          const seedPromises = MOCK_EVENTS.map(event => {
            const { id, ...eventData } = event;
            return addDoc(eventsRef, eventData);
          });
          await Promise.all(seedPromises);
          return eventService.getAll();
        } catch (seedError) {
          handleFirebaseError(seedError, 'Seeding');
          return MOCK_EVENTS;
        }
      }

      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        events.push(convertDocToEvent(doc));
      });

      // Sync local storage with successful fetch
      saveLocalEvents(events);

      return events;
    } catch (error) {
      handleFirebaseError(error, 'getAll');
      return getLocalEvents();
    }
  },

  create: async (eventData: Omit<Event, 'id' | 'participants'>): Promise<Event> => {
    const fallbackEvent: Event = {
      ...eventData,
      id: `local-${Date.now()}`,
      participants: []
    };

    try {
      if (!db) throw new Error("Firebase not initialized");

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...eventData,
        participants: []
      });

      return {
        id: docRef.id,
        ...eventData,
        participants: []
      } as Event;

    } catch (error) {
      handleFirebaseError(error, 'create');

      const currentEvents = getLocalEvents();
      const updatedEvents = [fallbackEvent, ...currentEvents];
      saveLocalEvents(updatedEvents);
      return fallbackEvent;
    }
  },

  addParticipant: async (eventId: string, participantData: Omit<Participant, 'id' | 'confirmedAt'>): Promise<Event> => {
    try {
      if (!db) throw new Error("Firebase not initialized");

      const eventRef = doc(db, COLLECTION_NAME, eventId);

      const newParticipant = {
        ...participantData,
        id: `part-${Date.now()}`,
        confirmedAt: Timestamp.now(),
      };

      await updateDoc(eventRef, {
        participants: arrayUnion(newParticipant)
      });

      const updatedDocSnap = await getDoc(eventRef);
      if (updatedDocSnap.exists()) {
        return convertDocToEvent(updatedDocSnap);
      } else {
        throw new Error("Event not found after update");
      }

    } catch (error) {
      handleFirebaseError(error, 'addParticipant');

      const currentEvents = getLocalEvents();
      const eventIndex = currentEvents.findIndex(e => e.id === eventId);

      if (eventIndex === -1) throw new Error("Event not found in local storage");

      const fallbackParticipant: Participant = {
        ...participantData,
        id: `local-part-${Date.now()}`,
        confirmedAt: new Date()
      };

      const updatedEvent = {
        ...currentEvents[eventIndex],
        participants: [fallbackParticipant, ...currentEvents[eventIndex].participants]
      };

      currentEvents[eventIndex] = updatedEvent;
      saveLocalEvents(currentEvents);

      return updatedEvent;
    }
  },

  getById: async (id: string): Promise<Event | undefined> => {
    try {
      if (!db) throw new Error("Firebase not initialized");

      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return convertDocToEvent(docSnap);
      }
      return undefined;
    } catch (error) {
      handleFirebaseError(error, 'getById');
      const localEvents = getLocalEvents();
      return localEvents.find(e => e.id === id);
    }
  },

  checkConnection: async (): Promise<boolean> => {
    try {
      if (!db) return false;
      const eventsRef = collection(db, COLLECTION_NAME);
      // Try to fetch just one document to verify access
      const q = query(eventsRef, limit(1));
      await getDocs(q);
      return true;
    } catch (error) {
      // Don't log full error to avoid console noise during polling
      return false;
    }
  }
};