import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import theme from './theme';
import Navbar from './components/Navbar';
import Login from './pages/login';
import Signin from './pages/signin';
import ProductCreationModal from './components/ProductCreationModal';
import ProductsGrid, { BaseProduct } from './pages/myproducts';
import ProductSearch from './pages/productSearch';
import MyCart from './pages/myCart';
import axios from 'axios';
import MyPurchases from './pages/myPurchases';
import ChatView from './pages/messages';
import './animations.css';

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Estado para controlar la apertura/cierre del modal
  const [isProductCreationModalOpen, setIsProductCreationModalOpen] = useState(false);

  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null);

  // Estado para almacenar la lista de productos
  const [products, setProducts] = useState<BaseProduct[]>([]);

  // Función para abrir el modal de creación de productos
  const handleOpenProductCreationModal = () => {
    setIsProductCreationModalOpen(true);
  };

  // Función para cerrar el modal de creación de productos
  const handleCloseProductCreationModal = () => {
    setIsProductCreationModalOpen(false);
    setError(null); // Limpiar errores al cerrar el modal
  };

  // Función para manejar la creación de un producto
  const handleCreateProduct = async (formData: FormData) => {
    try {
      const response = await axios.post('http://reactstore-a5hhdkhndkckfaf7.eastus2-01.azurewebsites.net/products/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      alert('Product created successfully: ' + response.data.message);
      setIsProductCreationModalOpen(false); // Cerrar el modal
      fetchUserProducts(); // Actualizar la lista de productos
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while creating the product.');
    }
  };

  // Función para cargar los productos del usuario
  const fetchUserProducts = async () => {
    try {
      const response = await axios.get('http://reactstore-a5hhdkhndkckfaf7.eastus2-01.azurewebsites.net/products/showUserProducts', {
        withCredentials: true,
      });
      setProducts(response.data.product || []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        console.error('Unauthorized, redirecting to login');
        navigate('/login');
      } else {
        console.error('Error fetching user products:', err);
        setError('Failed to load products.');
      }
    }
  };

  // Cargar los productos al montar la aplicación
  React.useEffect(() => {
    fetchUserProducts();
  }, []);

  const navItems = [
    { name: 'My products', link: '/myProducts' },
    { name: 'Cart', link: '/cart' },
    { name: 'My purchases', link: '/myPurchases' },
    { name: 'Inbox', link: '/messages' },
  ];

  const hideNavbarRoutes = ['/login', '/signin'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  const productOptions = [
    <Button
      variant="contained"
      key="createProduct"
      onClick={handleOpenProductCreationModal}
    >
      Create product
    </Button>,
  ];

  const cartOptions = [
    <Button
      variant="contained"
      key="checkout"
      onClick={async () => {
        try {
          const response = await axios.get('http://reactstore-a5hhdkhndkckfaf7.eastus2-01.azurewebsites.net/cart/buyProducts', {
            withCredentials: true,
          });
          alert('Purchase successful!');
          console.log('Response:', response.data);
        } catch (error) {
          alert('Failed to complete purchase.');
          console.error('Error:', error);
        }
      }}
    >
      Buy products
    </Button>,
  ];

  const navButtons =
    location.pathname === '/cart'
      ? cartOptions
      : location.pathname === '/myProducts'
      ? productOptions
      : [];

  const handleSearch = (searchTerm: string) => {
    navigate(`/productSearch?query=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box component="main" sx={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100vw' }}>
        {shouldShowNavbar && (
          <Navbar
            navRoutes={navItems}
            navButtons={navButtons}
            onSearch={handleSearch}
          />
        )}
        <Box
          sx={{
            flexGrow: 1,
            ...(!hideNavbarRoutes.includes(location.pathname) && {
              marginLeft: '25vw',
            }),
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<Signin />} />
            <Route
              path="/myProducts"
              element={<ProductsGrid products={products} fetchUserProducts={fetchUserProducts} />}
            />
            <Route path="/productSearch" element={<ProductSearch />} />
            <Route path="/cart" element={<MyCart />} />
            <Route path="/myPurchases" element={<MyPurchases />} />
            <Route path="/messages" element={<ChatView />} />
          </Routes>
        </Box>
      </Box>

      {/* Modal de creación de productos */}
      <ProductCreationModal
        open={isProductCreationModalOpen}
        onClose={handleCloseProductCreationModal}
        onCreateProduct={handleCreateProduct}
        error={error}
      />
    </ThemeProvider>
  );
};

export default App;