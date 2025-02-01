import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#242424', // Cambia esto al color de fondo que desees
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f3f3f3', // Cambia esto al color que prefieras
        },
        ':root': {
          display: 'flex',
          justifyContent: 'center', // Centra horizontalmente
          alignItems: 'center',     // Centra verticalmente
          height: '100vh',          // Asegura que ocupe toda la altura de la ventana
          width: '100vw',           // Asegura que ocupe todo el ancho de la ventana
          margin: 0,                // Elimina márgenes
          padding: 0,               // Elimina rellenos
        },
      },
    },
  },
});

export default theme;
