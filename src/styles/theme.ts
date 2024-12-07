export const theme = {
  colors: {
    primary: {
      main: '#A3D9B1',      // Soft Pastel Green
      hover: '#93C9A1',     // Slightly darker for hover
      active: '#83B991',    // Even darker for active state
    },
    secondary: {
      main: '#ADD8E6',      // Light Blue
      hover: '#9DC8D6',     // Slightly darker for hover
      active: '#8DB8C6',    // Even darker for active state
    },
    background: {
      main: '#E0E0E0',      // Light Gray
      paper: '#F5F5F5',     // Slightly lighter for cards/sections
    },
    text: {
      primary: '#4E4E4E',   // Charcoal Gray
      secondary: '#6E6E6E',  // Lighter text
      white: '#FFFFFF',     // White text for buttons
    },
    feedback: {
      error: '#E63946',     // Ruby Red
      warning: '#FDCB58',   // Golden Yellow
      success: '#A3D9B1',   // Using primary color for success
    }
  },
  transitions: {
    button: 'all 0.2s ease-in-out',
  }
};
