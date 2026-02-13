import { Event, EventCategory, Participant } from './types';

// Helper to manipulate dates without external dependency issues
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const subHours = (date: Date, hours: number) => {
  const result = new Date(date);
  result.setHours(result.getHours() - hours);
  return result;
};

// Helper to generate fake participants
const generateParticipants = (count: number): Participant[] => {
  const participants: Participant[] = [];
  const names = ['Ana Silva', 'Bruno Santos', 'Carla Dias', 'Daniel Oliveira', 'Elena Costa', 'Fábio Lima', 'Gabriela Rocha', 'Hugo Souza'];
  const cities = ['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Belo Horizonte'];

  for (let i = 0; i < count; i++) {
    const isMale = i % 2 !== 0;
    participants.push({
      id: `part-${i}`,
      name: names[i % names.length],
      age: 20 + Math.floor(Math.random() * 15),
      gender: isMale ? 'Masculino' : 'Feminino',
      originCity: cities[i % cities.length],
      photoUrl: `https://i.pravatar.cc/150?u=${i + 100}`,
      instagramHandle: `@${names[i % names.length].toLowerCase().replace(' ', '.')}`,
      confirmedAt: subHours(new Date(), i),
    });
  }
  return participants;
};

export const MOCK_EVENTS: Event[] = [];

export const CITIES = [
  'Todas',
  'Ananindeua',
  'Aparecida de Goiânia',
  'Aracaju',
  'Belém',
  'Belford Roxo',
  'Belo Horizonte',
  'Boa Vista',
  'Brasília',
  'Campinas',
  'Campo Grande',
  'Campos dos Goytacazes',
  'Caxias do Sul',
  'Contagem',
  'Cuiabá',
  'Curitiba',
  'Duque de Caxias',
  'Feira de Santana',
  'Florianópolis',
  'Fortaleza',
  'Goiânia',
  'Guarulhos',
  'Jaboatão dos Guararapes',
  'João Pessoa',
  'Joinville',
  'Juiz de Fora',
  'Londrina',
  'Macapá',
  'Maceió',
  'Manaus',
  'Natal',
  'Niterói',
  'Nova Iguaçu',
  'Osasco',
  'Olinda',
  'Palmas',
  'Porto Alegre',
  'Porto Velho',
  'Recife',
  'Ribeirão Preto',
  'Rio Branco',
  'Rio de Janeiro',
  'Salvador',
  'Santo André',
  'Santos',
  'São Bernardo do Campo',
  'São Gonçalo',
  'São João de Meriti',
  'São José dos Campos',
  'São Luís',
  'São Paulo',
  'Serra',
  'Sorocaba',
  'Teresina',
  'Uberlândia',
  'Vila Velha',
  'Vitória'
];