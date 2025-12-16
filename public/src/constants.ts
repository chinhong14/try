
import * as THREE from 'three';

/**
 * ==========================================
 * IMAGE SETUP
 * ==========================================
 * Updated paths to be relative (./image.jpeg).
 * This assumes images are in the same root folder as index.html.
 * ==========================================
 */

export const COLORS = {
  primary: '#10B981', // Emerald 500
  secondary: '#065F46', // Emerald 800
  accent: '#F59E0B', // Amber 500
  gold: '#FFD700',
  warmRed: '#EF4444',
  highlight: '#FEF3C7', // Amber 100
};

export const PARTICLE_COUNT = 800;
export const TREE_HEIGHT = 14;
export const TREE_RADIUS = 5;
export const SCATTER_RADIUS = 25;

export const PALETTE = [
  new THREE.Color('#059669'), // Emerald 600
  new THREE.Color('#047857'), // Emerald 700
  new THREE.Color('#10B981'), // Emerald 500
  new THREE.Color('#FBBF24'), // Amber 400 (Goldish)
  new THREE.Color('#DC2626'), // Red 600
  new THREE.Color('#D97706'), // Amber 600 (Dark Gold)
];

// 12 Memories with corrected paths
export const MEMORY_LANE = [
  { 
    id: 1, 
    text: "Painting the town at Pekan Nabalu", 
    img: '/public/assets/1.jpeg' 
  },
  { 
    id: 2, 
    text: "University of Malaya represent!", 
    img: '/public/assets/2.jpeg' 
  },
  { 
    id: 3, 
    text: "Swinging into good times by the sea", 
    img: "/public/assets/3.jpeg"
  },
  { 
    id: 4, 
    text: "Golden hour with the golden gang", 
    img: "/public/assets/4.jpeg"
  },
  { 
    id: 5, 
    text: "Bags packed, ready for the next adventure", 
    img: "/public/assets/5.jpeg"
  },
  { 
    id: 6, 
    text: "Cozy chaos in the sleeper cabin", 
    img: "/public/assets/6.jpeg"
  },
  { 
    id: 7, 
    text: "Looking royal in traditional Thai attire", 
    img: "/public/assets/7.jpeg"
  },
  { 
    id: 8, 
    text: "Strolling through historic Melaka", 
    img: "/public/assets/8.jpeg"
  },
  { 
    id: 9, 
    text: "Sweet treats and birthday beats", 
    img: "/public/assets/9.jpeg"
  },
  { 
    id: 10, 
    text: "Neon lights and endless fun", 
    img: "/public/assets/10.jpeg"
  },
  { 
    id: 11, 
    text: "Rain or shine, we stick together", 
    img: "/public/assets/11.jpeg"
  },
  { 
    id: 12, 
    text: "Another chapter in our story", 
    img: "/public/assets/12.jpeg"
  },
];