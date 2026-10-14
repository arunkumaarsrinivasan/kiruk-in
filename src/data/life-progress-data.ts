/**
 * Life Progress Data
 * 
 * This file contains all personal life data for the Progress page.
 * Edit this file directly to update your books, games, travels, treks, etc.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type BookStatus = 'reading' | 'completed' | 'to-read' | 'dropped';
export type GameStatus = 'playing' | 'completed' | 'to-play' | 'dropped';
export type LocationType = 'hometown' | 'current' | 'visited' | 'trek' | 'work' | 'study';

export interface Book {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  startDate?: string; // YYYY-MM format
  endDate?: string;
  rating?: number; // 1-5
  genre: string;
  cover?: string; // URL or path
  notes?: string;
}

export interface Game {
  id: string;
  title: string;
  platform: 'PC' | 'PS5' | 'Switch' | 'Mobile' | 'Xbox';
  status: GameStatus;
  rating?: number; // 1-5
  genre: string;
  hoursPlayed?: number;
  cover?: string;
  notes?: string;
}

export interface TravelLocation {
  id: string;
  name: string;
  region?: string; // State/Province
  country: string;
  lat: number;
  lng: number;
  type: LocationType;
  visitDate?: string; // YYYY-MM format
  description?: string;
  photos?: string[];
}

export interface Trek {
  id: string;
  name: string;
  location: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  elevation: number; // meters
  distance: number; // km
  date: string; // YYYY-MM format
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
  duration?: string; // e.g., "2 days"
  description?: string;
  photos?: string[];
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  director?: string;
  status: 'watched' | 'to-watch';
  rating?: number;
  genre: string;
  watchDate?: string;
  notes?: string;
}

export interface MusicVibe {
  id: string;
  name: string;
  description: string;
  playlistUrl?: string;
  tracks?: Array<{
    title: string;
    artist: string;
  }>;
}

export interface LifeStats {
  birthDate: string;
  expectedLifespan: number; // years
  currentLocation: string;
  homeLocation: string;
}

// ============================================================================
// PERSONAL INFO
// ============================================================================

export const lifeStats: LifeStats = {
  birthDate: '2001-08-11',
  expectedLifespan: 80,
  currentLocation: 'Bengaluru, Karnataka',
  homeLocation: 'Salem, Tamil Nadu',
};

// ============================================================================
// BOOKS - Starting 2026
// ============================================================================

export const books: Book[] = [
  {
    id: 'book-1',
    title: 'How to Read a Tree',
    author: 'Tristan Gooley',
    status: 'reading',
    startDate: '2026-01',
    genre: 'Nature',
    notes: 'Learning to understand nature through observation',
  },
  {
    id: 'book-2',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    status: 'to-read',
    genre: 'Design',
    notes: 'Classic design thinking book - on the reading list',
  },
  // Add more books here as you read them
];

// ============================================================================
// GAMES - Indie Game Collection
// ============================================================================

export const games: Game[] = [
  {
    id: 'game-1',
    title: 'Hades',
    platform: 'PC',
    status: 'completed',
    rating: 5,
    genre: 'Roguelike',
    hoursPlayed: 120,
    notes: 'One of the best roguelikes ever made. Amazing narrative integration.',
  },
  {
    id: 'game-2',
    title: 'Ori and the Blind Forest',
    platform: 'PC',
    status: 'completed',
    rating: 5,
    genre: 'Metroidvania',
    hoursPlayed: 15,
    notes: 'Beautiful art, emotional story, tight controls.',
  },
  {
    id: 'game-3',
    title: 'Ori and the Will of the Wisps',
    platform: 'PC',
    status: 'completed',
    rating: 5,
    genre: 'Metroidvania',
    hoursPlayed: 20,
    notes: 'Even better than the first one.',
  },
  {
    id: 'game-4',
    title: 'Dead Cells',
    platform: 'PC',
    status: 'playing',
    genre: 'Roguelike',
    hoursPlayed: 80,
    notes: 'Perfect blend of roguelike and metroidvania.',
  },
  {
    id: 'game-5',
    title: 'Cult of the Lamb',
    platform: 'PC',
    status: 'completed',
    rating: 4,
    genre: 'Roguelike',
    hoursPlayed: 25,
    notes: 'Cute but dark. Unique blend of genres.',
  },
  {
    id: 'game-6',
    title: 'Boomerang Fu',
    platform: 'PC',
    status: 'playing',
    genre: 'Party',
    hoursPlayed: 10,
    notes: 'Best party game with friends!',
  },
  {
    id: 'game-7',
    title: 'Sifu',
    platform: 'PC',
    status: 'playing',
    genre: 'Action',
    hoursPlayed: 15,
    notes: 'Challenging martial arts game with unique aging mechanic.',
  },
  {
    id: 'game-8',
    title: 'Hollow Knight',
    platform: 'PC',
    status: 'completed',
    rating: 5,
    genre: 'Metroidvania',
    hoursPlayed: 60,
    notes: 'Masterpiece. Incredible exploration and boss fights.',
  },
  {
    id: 'game-9',
    title: 'Celeste',
    platform: 'PC',
    status: 'completed',
    rating: 5,
    genre: 'Platformer',
    hoursPlayed: 20,
    notes: 'Perfect difficulty curve, touching story about mental health.',
  },
  // Add more games here
];

// ============================================================================
// TRAVEL LOCATIONS
// ============================================================================

export const travelLocations: TravelLocation[] = [
  // Home & Current
  {
    id: 'loc-1',
    name: 'Salem',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 11.6643,
    lng: 78.1460,
    type: 'hometown',
    visitDate: '2001-08',
    description: 'Born and raised here. Family home.',
  },
  {
    id: 'loc-2',
    name: 'Bengaluru',
    region: 'Karnataka',
    country: 'India',
    lat: 12.9716,
    lng: 77.5946,
    type: 'current',
    visitDate: '2023-08',
    description: 'Home base.',
  },
  // Tamil Nadu
  {
    id: 'loc-3',
    name: 'Chennai',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 13.0827,
    lng: 80.2707,
    type: 'visited',
    description: 'Multiple visits for work and leisure.',
  },
  {
    id: 'loc-4',
    name: 'Coimbatore',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 11.0168,
    lng: 76.9558,
    type: 'visited',
  },
  {
    id: 'loc-5',
    name: 'Kodaikanal',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 10.2381,
    lng: 77.4892,
    type: 'trek',
    description: 'Hill station with beautiful treks.',
  },
  {
    id: 'loc-6',
    name: 'Ooty',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 11.4102,
    lng: 76.6950,
    type: 'visited',
    description: 'Queen of hill stations.',
  },
  {
    id: 'loc-7',
    name: 'Madurai',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 9.9252,
    lng: 78.1198,
    type: 'visited',
    description: 'Temple city. Meenakshi temple.',
  },
  // Other states
  {
    id: 'loc-8',
    name: 'Mysuru',
    region: 'Karnataka',
    country: 'India',
    lat: 12.2958,
    lng: 76.6394,
    type: 'visited',
    description: 'Palace city, beautiful architecture.',
  },
  {
    id: 'loc-9',
    name: 'Varkala',
    region: 'Kerala',
    country: 'India',
    lat: 8.7379,
    lng: 76.7160,
    type: 'visited',
    description: 'Cliff beaches and sunsets.',
  },
  {
    id: 'loc-10',
    name: 'Wayanad',
    region: 'Kerala',
    country: 'India',
    lat: 11.6854,
    lng: 76.1320,
    type: 'visited',
    description: 'Western Ghats forests and coffee estates.',
  },
  {
    id: 'loc-11',
    name: 'Alappuzha',
    region: 'Kerala',
    country: 'India',
    lat: 9.4981,
    lng: 76.3388,
    type: 'visited',
    description: 'Backwaters and houseboats.',
  },
  {
    id: 'loc-12',
    name: 'Kochi',
    region: 'Kerala',
    country: 'India',
    lat: 9.9312,
    lng: 76.2673,
    type: 'visited',
    description: 'Fort Kochi, harbor vibes.',
  },
  {
    id: 'loc-13',
    name: 'Munnar',
    region: 'Kerala',
    country: 'India',
    lat: 10.0889,
    lng: 77.0595,
    type: 'visited',
    description: 'Tea gardens and misty hills.',
  },
  {
    id: 'loc-14',
    name: 'Anaimalai',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 10.5827,
    lng: 76.9344,
    type: 'visited',
    description: 'Western Ghats wildlife corridor.',
  },
  {
    id: 'loc-15',
    name: 'Yercaud',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 11.7753,
    lng: 78.2093,
    type: 'visited',
    description: 'Weekend hill station near Salem.',
  },
  {
    id: 'loc-16',
    name: 'Kanyakumari',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 8.0883,
    lng: 77.5385,
    type: 'visited',
    description: 'Land’s end of India.',
  },
  {
    id: 'loc-17',
    name: 'Tirupati',
    region: 'Andhra Pradesh',
    country: 'India',
    lat: 13.6288,
    lng: 79.4192,
    type: 'visited',
    description: 'Pilgrimage to Tirumala.',
  },
  {
    id: 'loc-18',
    name: 'Goa',
    region: 'Goa',
    country: 'India',
    lat: 15.4909,
    lng: 73.8278,
    type: 'visited',
    description: 'Coastal drives and beaches.',
  },
  {
    id: 'loc-19',
    name: 'Gokarna',
    region: 'Karnataka',
    country: 'India',
    lat: 14.5501,
    lng: 74.3188,
    type: 'visited',
    description: 'Laid-back beaches and treks.',
  },
  {
    id: 'loc-20',
    name: 'Karwar',
    region: 'Karnataka',
    country: 'India',
    lat: 14.8170,
    lng: 74.1290,
    type: 'visited',
    description: 'Gateway to the Karnataka coast.',
  },
  {
    id: 'loc-21',
    name: 'Udupi',
    region: 'Karnataka',
    country: 'India',
    lat: 13.3409,
    lng: 74.7421,
    type: 'visited',
    description: 'Coastal town and cuisine.',
  },
  {
    id: 'loc-22',
    name: 'Mangaluru',
    region: 'Karnataka',
    country: 'India',
    lat: 12.9141,
    lng: 74.8560,
    type: 'visited',
    description: 'End of the coastal stretch.',
  },
  {
    id: 'loc-23',
    name: 'Chikkamagaluru',
    region: 'Karnataka',
    country: 'India',
    lat: 13.3181,
    lng: 75.8081,
    type: 'visited',
    description: 'Coffee country and Western Ghats.',
  },
  {
    id: 'loc-24',
    name: 'Kudremukh',
    region: 'Karnataka',
    country: 'India',
    lat: 13.1339,
    lng: 75.2622,
    type: 'trek',
    description: 'Rolling meadows in the Ghats.',
  },
  {
    id: 'loc-25',
    name: 'Aghanashini Valley',
    region: 'Karnataka',
    country: 'India',
    lat: 14.6194,
    lng: 74.6261,
    type: 'trek',
    description: 'River valley trails near Kumta.',
  },
  {
    id: 'loc-26',
    name: 'Sagara',
    region: 'Karnataka',
    country: 'India',
    lat: 14.1670,
    lng: 75.0403,
    type: 'visited',
    description: 'Base for Sharavathi valley waterfalls.',
  },
  {
    id: 'loc-27',
    name: 'Narasimha Parvatha',
    region: 'Karnataka',
    country: 'India',
    lat: 13.4930,
    lng: 75.1193,
    type: 'trek',
    description: 'Agumbe rainforest ridge trek.',
  },
  {
    id: 'loc-28',
    name: 'Vellagavi',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 10.2289,
    lng: 77.4955,
    type: 'trek',
    description: 'Hidden village below Kodaikanal.',
  },
  {
    id: 'loc-29',
    name: 'Velliangiri Hills',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 11.0535,
    lng: 76.7375,
    type: 'trek',
    description: 'Seven-hill climb near Coimbatore.',
  },
  {
    id: 'loc-30',
    name: 'Valikunja',
    region: 'Karnataka',
    country: 'India',
    lat: 12.6333,
    lng: 75.3333,
    type: 'trek',
    description: 'Sharp tabletop peak in the Ghats.',
  },
  {
    id: 'loc-31',
    name: 'Kodachadri',
    region: 'Karnataka',
    country: 'India',
    lat: 13.8667,
    lng: 74.8667,
    type: 'trek',
    description: 'Sunset views over Sharavathi valley.',
  },
  {
    id: 'loc-32',
    name: 'Bandaje Arbi',
    region: 'Karnataka',
    country: 'India',
    lat: 13.1482,
    lng: 75.3679,
    type: 'trek',
    description: 'Waterfall campsite near Ballarayana Durga.',
  },
  {
    id: 'loc-33',
    name: 'Sandakphu',
    region: 'West Bengal',
    country: 'India',
    lat: 27.1167,
    lng: 88.0022,
    type: 'trek',
    visitDate: '2024-12',
    description: 'Summit of the Sandakphu-Phalut trail.',
  },
  {
    id: 'loc-34',
    name: 'Phalut',
    region: 'West Bengal',
    country: 'India',
    lat: 27.0967,
    lng: 88.0267,
    type: 'trek',
    visitDate: '2024-12',
    description: 'End ridge with Kanchenjunga views.',
  },
  {
    id: 'loc-35',
    name: 'Buran Ghati',
    region: 'Himachal Pradesh',
    country: 'India',
    lat: 31.1400,
    lng: 77.7200,
    type: 'trek',
    visitDate: '2025-10',
    description: 'High-pass adventure in Himachal.',
  },
  // Add more locations as you travel
];

// ============================================================================
// TREKS
// ============================================================================

export const treks: Trek[] = [
  {
    id: 'trek-1',
    name: 'Kodaikanal Dolphin Nose',
    location: 'Kodaikanal',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 10.2194,
    lng: 77.4737,
    elevation: 2066,
    distance: 8,
    date: '2022-05',
    difficulty: 'moderate',
    duration: '1 day',
    description: 'Scenic viewpoint trek with valley views.',
  },
  {
    id: 'trek-2',
    name: 'Yelagiri Hills',
    location: 'Yelagiri',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 12.5827,
    lng: 78.6444,
    elevation: 1410,
    distance: 5,
    date: '2021-12',
    difficulty: 'easy',
    duration: 'Half day',
    description: 'Beginner-friendly trek near Chennai.',
  },
  {
    id: 'trek-3',
    name: 'Kudremukh',
    location: 'Chikkamagaluru',
    region: 'Karnataka',
    country: 'India',
    lat: 13.1266,
    lng: 75.2679,
    elevation: 1894,
    distance: 22,
    date: '2023-11',
    difficulty: 'moderate',
    duration: '1 day',
    description: 'Rolling green meadows and shola forests.',
  },
  {
    id: 'trek-4',
    name: 'Aghanashini Valley',
    location: 'Kumta',
    region: 'Karnataka',
    country: 'India',
    lat: 14.6194,
    lng: 74.6261,
    elevation: 250,
    distance: 14,
    date: '2024-02',
    difficulty: 'moderate',
    duration: '1 day',
    description: 'Riverbed crossings and rainforest sections.',
  },
  {
    id: 'trek-5',
    name: 'Sharavathi Waterfalls',
    location: 'Sagara',
    region: 'Karnataka',
    country: 'India',
    lat: 14.1670,
    lng: 75.0403,
    elevation: 600,
    distance: 10,
    date: '2024-03',
    difficulty: 'moderate',
    duration: '1 day',
    description: 'Waterfall approach through dense forest.',
  },
  {
    id: 'trek-6',
    name: 'Narasimha Parvatha',
    location: 'Agumbe',
    region: 'Karnataka',
    country: 'India',
    lat: 13.4930,
    lng: 75.1193,
    elevation: 1150,
    distance: 13,
    date: '2024-04',
    difficulty: 'hard',
    duration: '1 day',
    description: 'Rainforest ridge with cloud forests.',
  },
  {
    id: 'trek-7',
    name: 'Vellagavi Descent',
    location: 'Kodaikanal',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 10.2289,
    lng: 77.4955,
    elevation: 2000,
    distance: 16,
    date: '2024-06',
    difficulty: 'moderate',
    duration: '1 day',
    description: 'Rocky steps from Kodaikanal to the hidden village.',
  },
  {
    id: 'trek-8',
    name: 'Velliangiri Seven Hills',
    location: 'Coimbatore',
    region: 'Tamil Nadu',
    country: 'India',
    lat: 11.0535,
    lng: 76.7375,
    elevation: 1840,
    distance: 14,
    date: '2024-07',
    difficulty: 'hard',
    duration: '1 day',
    description: 'Steep pilgrimage climb to the summit.',
  },
  {
    id: 'trek-9',
    name: 'Valikunja',
    location: 'Dakshina Kannada',
    region: 'Karnataka',
    country: 'India',
    lat: 12.6333,
    lng: 75.3333,
    elevation: 1100,
    distance: 12,
    date: '2024-08',
    difficulty: 'moderate',
    duration: '1 day',
    description: 'Sharp tabletop peak with coastal views.',
  },
  {
    id: 'trek-10',
    name: 'Kodachadri',
    location: 'Shimoga',
    region: 'Karnataka',
    country: 'India',
    lat: 13.8667,
    lng: 74.8667,
    elevation: 1343,
    distance: 14,
    date: '2024-09',
    difficulty: 'moderate',
    duration: '1 day',
    description: 'Hidlumane waterfalls and jeep track descent.',
  },
  {
    id: 'trek-11',
    name: 'Bandaje Arbi',
    location: 'Charmadi Ghat',
    region: 'Karnataka',
    country: 'India',
    lat: 13.1482,
    lng: 75.3679,
    elevation: 900,
    distance: 12,
    date: '2024-10',
    difficulty: 'moderate',
    duration: '1 day',
    description: 'Falls-side camping near Ballarayana Durga.',
  },
  {
    id: 'trek-12',
    name: 'Sandakphu - Phalut',
    location: 'Singalila Ridge',
    region: 'West Bengal',
    country: 'India',
    lat: 27.1067,
    lng: 88.0145,
    elevation: 3636,
    distance: 65,
    date: '2024-12',
    difficulty: 'moderate',
    duration: '4 days',
    description: 'Himalayan ridge with Kanchenjunga views.',
  },
  {
    id: 'trek-13',
    name: 'Buran Ghati',
    location: 'Janglik',
    region: 'Himachal Pradesh',
    country: 'India',
    lat: 31.1400,
    lng: 77.7200,
    elevation: 4572,
    distance: 37,
    date: '2025-10',
    difficulty: 'hard',
    duration: '6 days',
    description: 'Snow gully rappel and alpine meadows.',
  },
  // Add more treks here
];

// ============================================================================
// MOVIES
// ============================================================================

export const movies: Movie[] = [
  {
    id: 'movie-1',
    title: 'Interstellar',
    year: 2014,
    director: 'Christopher Nolan',
    status: 'watched',
    rating: 5,
    genre: 'Sci-Fi',
    notes: 'Mind-bending space epic.',
  },
  {
    id: 'movie-2',
    title: 'Spider-Man: Into the Spider-Verse',
    year: 2018,
    status: 'watched',
    rating: 5,
    genre: 'Animation',
    notes: 'Revolutionary animation style.',
  },
  // Add more movies here
];

// ============================================================================
// MUSIC VIBES
// ============================================================================

export const musicVibes: MusicVibe[] = [
  {
    id: 'vibe-1',
    name: 'Focus Mode',
    description: 'Lo-fi beats and ambient music for deep work',
    tracks: [
      { title: 'Lofi Study', artist: 'Various' },
    ],
  },
  {
    id: 'vibe-2',
    name: 'Indie Gaming OST',
    description: 'Soundtracks from favorite indie games',
    tracks: [
      { title: 'Good Riddance', artist: 'Hades OST' },
      { title: 'Light of Nibel', artist: 'Ori OST' },
    ],
  },
  {
    id: 'vibe-3',
    name: 'Tamil Classics',
    description: 'Nostalgic Tamil songs',
    tracks: [],
  },
  // Add more vibes here
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getLifeProgress(): { yearsLived: number; percentage: number; daysLived: number } {
  const birth = new Date(lifeStats.birthDate);
  const today = new Date();
  const yearsLived = getAge(lifeStats.birthDate);
  const daysLived = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  const percentage = (yearsLived / lifeStats.expectedLifespan) * 100;
  return { yearsLived, percentage, daysLived };
}

export function getBookStats() {
  const reading = books.filter(b => b.status === 'reading').length;
  const completed = books.filter(b => b.status === 'completed').length;
  const toRead = books.filter(b => b.status === 'to-read').length;
  return { reading, completed, toRead, total: books.length };
}

export function getGameStats() {
  const playing = games.filter(g => g.status === 'playing').length;
  const completed = games.filter(g => g.status === 'completed').length;
  const totalHours = games.reduce((sum, g) => sum + (g.hoursPlayed || 0), 0);
  const genres = [...new Set(games.map(g => g.genre))];
  return { playing, completed, totalHours, genres, total: games.length };
}

export function getTravelStats() {
  const countries = [...new Set(travelLocations.map(l => l.country))];
  const states = [...new Set(travelLocations.filter(l => l.country === 'India').map(l => l.region))];
  return { 
    countriesVisited: countries.length, 
    statesVisited: states.length,
    totalLocations: travelLocations.length,
    countries,
    states,
  };
}

export function getTrekStats() {
  const totalDistance = treks.reduce((sum, t) => sum + t.distance, 0);
  const highestElevation = Math.max(...treks.map(t => t.elevation));
  const totalTreks = treks.length;
  return { totalDistance, highestElevation, totalTreks };
}
