import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#242424', // Change this to the desired background color
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f3f3f3', // Change this to the preferred color
        },
        ':root': {
          display: 'flex',
          justifyContent: 'center', // Center horizontally
          alignItems: 'center',     // Center vertically
          height: '100vh',          // Ensure it takes up the full height of the window
          width: '100vw',           // Ensure it takes up the full width of the window
          margin: 0,                // Remove margins
          padding: 0,               // Remove padding
        },
      },
    },
  },
});

export default theme;
