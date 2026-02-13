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
  limit,
  where,
  deleteDoc
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
      status: e.status || 'approved', // Backfill for existing mock data
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
      // Only fetch approved events for the main feed
      const q = query(eventsRef, where('status', '==', 'approved'), orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);

      // Seeding logic for Firestore
      if (querySnapshot.empty) {
        const allEventsQ = query(eventsRef, limit(1));
        const allSnap = await getDocs(allEventsQ);

        if (allSnap.empty) {
          console.log("Database empty. Seeding mock data to Firestore...");
          try {
            const seedPromises = MOCK_EVENTS.map(event => {
              const { id, ...eventData } = event;
              return addDoc(eventsRef, { ...eventData, status: 'approved' });
            });
            await Promise.all(seedPromises);
            return eventService.getAll();
          } catch (seedError) {
            handleFirebaseError(seedError, 'Seeding');
            return MOCK_EVENTS.map(e => ({ ...e, status: 'approved' }));
          }
        }
      }

      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        events.push(convertDocToEvent(doc));
      });

      // Sync local storage with successful fetch
      saveLocalEvents(events);

      return events;
    } catch (error: any) {
      // If index is missing, try client-side filtering
      if (error?.message?.includes('index') || error?.code === 'failed-precondition') {
        try {
          console.warn("Falling back to client-side filtering due to missing index...");
          const eventsRef = collection(db, COLLECTION_NAME);
          const q = query(eventsRef, orderBy('date', 'asc')); // Simpler query
          const querySnapshot = await getDocs(q);
          const events: Event[] = [];
          querySnapshot.forEach((doc) => {
            const e = convertDocToEvent(doc);
            if (e.status === 'approved') events.push(e);
          });
          saveLocalEvents(events);
          return events;
        } catch (fallbackError) {
          console.error("Fallback query failed:", fallbackError);
        }
      }

      handleFirebaseError(error, 'getAll');
      const local = getLocalEvents();
      return local.filter(e => e.status === 'approved' || !e.status);
    }
  },

  getAllAdmin: async (): Promise<Event[]> => {
    try {
      if (!db) throw new Error("Firebase not initialized");
      const eventsRef = collection(db, COLLECTION_NAME);
      // Admin sees all events, ordered by date
      const q = query(eventsRef, orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);

      const events: Event[] = [];
      querySnapshot.forEach((doc) => {
        events.push(convertDocToEvent(doc));
      });
      return events;
    } catch (error) {
      handleFirebaseError(error, 'getAllAdmin');
      return getLocalEvents();
    }
  },

  create: async (eventData: Omit<Event, 'id' | 'participants'>): Promise<Event> => {
    const fallbackEvent: Event = {
      ...eventData,
      id: `local-${Date.now()}`,
      participants: [],
      status: 'pending'
    } as Event;

    try {
      if (!db) throw new Error("Firebase not initialized");

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...eventData,
        participants: [],
        status: 'pending'
      });

      return {
        id: docRef.id,
        ...eventData,
        participants: [],
        status: 'pending'
      } as Event;

    } catch (error) {
      handleFirebaseError(error, 'create');

      const currentEvents = getLocalEvents();
      const updatedEvents = [fallbackEvent, ...currentEvents];
      saveLocalEvents(updatedEvents);
      return fallbackEvent;
    }
  },

  update: async (eventId: string, eventData: Partial<Omit<Event, 'id' | 'participants'>>): Promise<void> => {
    try {
      if (!db) throw new Error("Firebase not initialized");
      const eventRef = doc(db, COLLECTION_NAME, eventId);

      const updatePayload: any = { ...eventData };
      // Convert Date objects to Firestore Timestamp if needed, but the SDK usually handles Date objects fine.
      // However, let's be safe and ensure they are passed as Dates or Timestamps.

      await updateDoc(eventRef, updatePayload);

      // Keep local storage in sync
      const events = getLocalEvents();
      const targetIndex = events.findIndex(e => e.id === eventId);
      if (targetIndex !== -1) {
        events[targetIndex] = { ...events[targetIndex], ...eventData } as Event;
        saveLocalEvents(events);
      }
    } catch (error) {
      handleFirebaseError(error, 'update');
      // Local fallback
      const events = getLocalEvents();
      const targetIndex = events.findIndex(e => e.id === eventId);
      if (targetIndex !== -1) {
        events[targetIndex] = { ...events[targetIndex], ...eventData } as Event;
        saveLocalEvents(events);
      }
    }
  },

  updateStatus: async (eventId: string, status: 'approved' | 'rejected'): Promise<void> => {
    try {
      if (!db) throw new Error("Firebase not initialized");
      const eventRef = doc(db, COLLECTION_NAME, eventId);
      await updateDoc(eventRef, { status });

      // Keep local storage in sync
      const events = getLocalEvents();
      const target = events.find(e => e.id === eventId);
      if (target) {
        target.status = status;
        saveLocalEvents(events);
      }
    } catch (error) {
      handleFirebaseError(error, 'updateStatus');
      // Local fallback
      const events = getLocalEvents();
      const target = events.find(e => e.id === eventId);
      if (target) {
        target.status = status;
        saveLocalEvents(events);
      }
    }
  },

  delete: async (eventId: string): Promise<void> => {
    try {
      if (!db) throw new Error("Firebase not initialized");
      await deleteDoc(doc(db, COLLECTION_NAME, eventId));
    } catch (error) {
      handleFirebaseError(error, 'delete');
      // Local fallback
      const events = getLocalEvents();
      const filtered = events.filter(e => e.id !== eventId);
      saveLocalEvents(filtered);
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