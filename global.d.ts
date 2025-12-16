import React from 'react';
import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// ----------------------------------------------------
// ADD THESE MODULE DECLARATIONS FOR IMAGE IMPORTS
// ----------------------------------------------------

// Treat imports of .jpg, .jpeg, .png, and .gif as strings (URLs)
declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}