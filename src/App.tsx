import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import theme from './theme';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signin from './pages/Signin';
import ProductCreationModal from './components/ProductCreationModal';
import ProductsGrid, { BaseProduct } from './pages/MyProducts';
import ProductSearch from './pages/ProductSearch';
import MyCart from './pages/MyCart';
import axios from 'axios';
import MyPurchases from './pages/MyPurchases';
import ChatView from './pages/Messages';
import VerifyAccount from './pages/CodeVerity';
import './animations.css';

interface CartProduct {
  cartproductid: string;
  productid: string;
  name: string;
  quantity: number;
  price: number;
  imageurl: string;
  max_available_quantity: number;
}

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State to control the opening/closing of the modal
  const [isProductCreationModalOpen, setIsProductCreationModalOpen] = useState(false);

  // State to handle errors
  const [error, setError] = useState<string | null>(null);

  // State to store the list of products
  const [products, setProducts] = useState<BaseProduct[]>([]);

  // State to store the cart products
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);

  // State to control the purchase success modal
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState<string>('');

  // Function to fetch cart products
  const fetchCartProducts = async () => {
    try {
      const response = await axios.get<{ cartProducts: CartProduct[] }>(
        import.meta.env.VITE_Backend_Domain_URL + '/cart/showUserProducts',
        { withCredentials: true }
      );

      if (response.status === 204) {
        setCartProducts([]);
      } else {
        setCartProducts(response.data.cartProducts);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 204) {
        setCartProducts([]);
      }
      if (err.response?.status === 401) {
        console.error('Unauthorized, redirecting to login');
        navigate('/login');
      } else {
        console.error('Failed to load cart products:', err);
        setError('Failed to load cart products.');
      }
    }
  };

  // Fetch cart products when the component mounts
  useEffect(() => {
    fetchCartProducts();
  }, []);

  // Function to open the product creation modal
  const handleOpenProductCreationModal = () => {
    setIsProductCreationModalOpen(true);
  };

  // Function to close the product creation modal
  const handleCloseProductCreationModal = () => {
    setIsProductCreationModalOpen(false);
    setError(null); // Clear errors when closing the modal
  };

  // Function to handle product creation
  const handleCreateProduct = async (formData: FormData) => {
    try {
      const response = await axios.post(import.meta.env.VITE_Backend_Domain_URL + '/products/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      alert('Product created successfully: ' + response.data.message);
      setIsProductCreationModalOpen(false); // Close the modal
      fetchUserProducts(); // Update the product list
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while creating the product.');
    }
  };

  // Function to load user products
  const fetchUserProducts = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_Backend_Domain_URL + '/products/showUserProducts', {
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

  // Function to handle the purchase modal
  const handlePurchase = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_Backend_Domain_URL + '/cart/buyProducts', {
        withCredentials: true,
      });
      setPurchaseMessage('Purchase successful!'); // Set success message
      setIsPurchaseModalOpen(true); // Open the modal
      console.log('Response:', response.data);
      fetchCartProducts(); // Update the cart state after purchase
    } catch (error) {
      setPurchaseMessage('Failed to complete purchase.'); // Set error message
      setIsPurchaseModalOpen(true); // Open the modal
      console.error('Error:', error);
    }
  };

  const navItems = [
    { name: 'My products', link: '/myProducts' },
    { name: 'Cart', link: '/myCart' },
    { name: 'My purchases', link: '/myPurchases' },
    { name: 'Inbox', link: '/messages' },
  ];

  const hideNavbarRoutes = ['/login', '/signin', '/userVerity'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  const productOptions = [
    <Button
      variant="contained"
      key="createProduct"
      onClick={handleOpenProductCreationModal}
    >
      Create product
    </Button>
  ];

  const cartOptions = [
    <Button
      variant="contained"
      key="checkout"
      onClick={handlePurchase} // Use the new handlePurchase function
    >
      Buy products
    </Button>,
  ];

  const navButtons =
    location.pathname === '/myCart'
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
              marginLeft: '22vw',
            }),
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/userVerity" element={<VerifyAccount />} />
            <Route
              path="/myProducts"
              element={<ProductsGrid products={products} fetchUserProducts={fetchUserProducts} />}
            />
            <Route path="/productSearch" element={<ProductSearch />} />
            <Route
              path="/myCart"
              element={<MyCart cartProducts={cartProducts} fetchCartProducts={fetchCartProducts} />}
            />
            <Route path="/myPurchases" element={<MyPurchases />} />
            <Route path="/messages" element={<ChatView />} />
          </Routes>
        </Box>
      </Box>

      {/* Product creation modal */}
      <ProductCreationModal
        open={isProductCreationModalOpen}
        onClose={handleCloseProductCreationModal}
        onCreateProduct={handleCreateProduct}
        error={error}
      />

      {/* Purchase result modal */}
      <Dialog open={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)}>
        <DialogTitle>Purchase Result</DialogTitle>
        <DialogContent>
          <DialogContentText>{purchaseMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPurchaseModalOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default App;