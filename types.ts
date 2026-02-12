export interface Participant {
  id: string;
  name: string;
  age: number;
  gender: 'Masculino' | 'Feminino' | 'Outro' | 'Prefiro não dizer';
  originCity: string;
  photoUrl: string;
  instagramHandle?: string;
  confirmedAt: Date;
}

export enum EventCategory {
  PARTY = 'Festa',
  SHOW = 'Show',
  SPORTS = 'Esportes',
  NETWORKING = 'Networking',
  CULTURAL = 'Cultural',
  FOOD = 'Gastronomia',
  TECH = 'Tecnologia'
}

export interface Event {
  id: string;
  title: string;
  description: string;
  city: string;
  date: Date;
  startTime: string;
  locationName: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  category: EventCategory;
  price: number; // 0 for free
  duration: string; // e.g. "4 horas"
  imageUrl: string;
  ticketLink?: string;
  participantsGoal: number;
  organizer: string;
  participants: Participant[];
}

export interface FilterState {
  search: string;
  category: string;
  city: string;
  date: string; // 'all', 'today', 'weekend', 'month'
}