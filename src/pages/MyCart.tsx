import React, { useEffect, useState } from 'react';
import axios from 'axios';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteProductButton from '../components/DeleteCartProductButton';
import { Container, useMediaQuery } from '@mui/material';
import CartProductModal from '../components/CartProductModal';
import theme from '../theme';
import { useNavigate } from 'react-router-dom';

// Interface defining the structure of a CartProduct
interface CartProduct {
  cartproductid: string;
  productid: string;
  name: string;
  quantity: number;
  price: number;
  imageurl: string;
  max_available_quantity: number;
}

// Interface defining the props for the MyCart component
interface MyCartProps {
  cartProducts: CartProduct[];
  fetchCartProducts: () => void;
}

// MyCart component to display and manage the user's shopping cart
const MyCart: React.FC<MyCartProps> = ({ cartProducts, fetchCartProducts }) => {
  const [error, setError] = useState<string | null>(null); // State to manage error messages
  const [productQuantities, setProductQuantities] = useState<{ [key: string]: number }>({}); // State to manage product quantities
  const [selectedProduct, setSelectedProduct] = useState<CartProduct | null>(null); // State to manage the selected product for the modal
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal open/close

  const navigate = useNavigate();
  
  // Hook to detect screen size
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Small screens (less than 600px)
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md')); // Medium screens (less than 900px)

  // Function to open the modal with the selected product
  const handleOpenModal = (product: CartProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  // Fetch cart products when the component mounts
  useEffect(() => {
    const loadCartProducts = async () => {
      try {
        await fetchCartProducts(); // Use the function passed from App to fetch cart products
      } catch (err) {
        setError('Failed to load cart products.');
      }
    };

    loadCartProducts();
  }, [fetchCartProducts]);

  // Update product quantities when cartProducts changes
  useEffect(() => {
    if (cartProducts.length > 0) {
      const initialQuantities: { [key: string]: number } = {};
      cartProducts.forEach(product => {
        initialQuantities[product.productid] = product.quantity;
      });
      setProductQuantities(initialQuantities);
    }
  }, [cartProducts]);

  // Function to handle quantity changes for a product
  const handleQuantityChange = async (productid: string, change: number) => {
    const currentQuantity = productQuantities[productid] || 0;
    const newQuantity = currentQuantity + change;

    // Get the current product to verify the maximum available stock
    const product = cartProducts.find(p => p.productid === productid);
    if (!product) return;

    // Validate that the new quantity is greater than 1 and less than the maximum available stock
    if (newQuantity < 1 || newQuantity > product.max_available_quantity) {
      setError(`Quantity must be between 1 and ${product.max_available_quantity}.`);
      return;
    }

    // Update the product quantity in the state
    setProductQuantities(prevQuantities => ({
      ...prevQuantities,
      [productid]: newQuantity,
    }));

    try {
      // Send the updated quantity to the backend
      await axios.post(
        import.meta.env.VITE_Backend_Domain_URL + '/products/alterProductToCart',
        { productid, quantity: newQuantity },
        { withCredentials: true }
      );
      fetchCartProducts(); // Refresh cart products after updating quantity
    } catch (err: any) {
      if (err.response?.status === 401) {
        console.error('Unauthorized, redirecting to login');
        navigate('/login');
      } else{
        console.error('Error updating product quantity.');
        setError('Failed to update product quantity.');
      }
    }
  };

  // Display an error message if there is an error
  if (error) return <Typography color="error">{error}</Typography>;

  // Calculate the total number of items and the total price in the cart
  const totalItems = cartProducts.reduce((total, product) => total + product.quantity, 0);
  const totalPrice = cartProducts.reduce((total, product) => total + product.quantity * product.price, 0);

  return (
    <Container sx={{ mt: 4 }}>
      {cartProducts.length === 0 ? (
        // Alternative view when the cart is empty
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height={650}
          textAlign="center"
          overflow="auto"
          bgcolor="#e8e8e8"
          p={2}
          borderRadius={2}
        >
          {/* SVG icon for an empty cart */}
          <svg
            style={{ stroke: theme.palette.text.secondary }}
            height="20em"
            width="20em"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M21 5L19 12H7.37671M20 16H8L6 3H3M11 3L13.5 5.5M13.5 5.5L16 8M13.5 5.5L16 3M13.5 5.5L11 8M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z"
                stroke="theme.palette.text.secondary"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </g>
          </svg>
          <Typography variant="h6" color="text.secondary">
            Your cart is empty.
          </Typography>
        </Box>
      ) : (
        // Normal view when there are products in the cart
        <Box
          marginLeft={20}
          overflow="auto"
          bgcolor="#e8e8e8"
          p={2}
          width={isSmallScreen ? '100%' : isMediumScreen ? '100%' : '800px'}
          borderRadius={2}
        >
          <Box
            sx={{
              maxHeight: '60vh', // Maximum height for the list container
              overflowY: 'auto', // Enable vertical scrolling
              width: '100%', // Ensure it takes up the full available width
            }}
          >
            <List sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              {cartProducts.map((product, index) => (
                <React.Fragment key={product.cartproductid}>
                  <ListItem
                    sx={{
                      display: 'flex',
                      flexDirection: isSmallScreen ? 'column' : 'row', // Change direction on small screens
                      width: '100%',
                      gap: isSmallScreen ? 2 : 5, // Adjust spacing on small screens
                      alignItems: isSmallScreen ? 'center' : 'flex-start', // Center on small screens
                      justifyContent: 'space-between', // Distribute items evenly
                    }}
                  >
                    <Box
                      component="img"
                      sx={{
                        width: 100,
                        height: 100,
                        marginRight: isSmallScreen ? 0 : 2, // Adjust margin on small screens
                        borderRadius: 1,
                      }}
                      alt={product.name}
                      src={product.imageurl}
                      onClick={() => handleOpenModal(product)}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography component="span" variant="h5" color="text.primary">
                        {product.name}
                      </Typography>
                    </Box>
                    <Box>
                      <Box display={'flex'} alignItems={'center'}>
                        <Typography component="span" variant="h6" color="text.primary">
                          Quantity:
                        </Typography>
                        <IconButton
                          aria-label="remove"
                          onClick={() => handleQuantityChange(product.productid, -1)}
                          disabled={product.quantity <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography component="span" variant="body2" color="text.primary" alignSelf={'center'}>
                          {productQuantities[product.productid] || product.quantity}
                        </Typography>
                        <IconButton
                          aria-label="add"
                          onClick={() => handleQuantityChange(product.productid, 1)}
                          disabled={product.quantity >= product.max_available_quantity} // Disable if maximum quantity is reached
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box display={'flex'} alignItems={'center'}>
                      <Typography component="span" variant="h6" color="text.primary">
                        Price: ${product.price}
                      </Typography>
                    </Box>
                    {/* Delete product button */}
                    <DeleteProductButton productId={product.productid} />
                  </ListItem>
                  {/* Divider between products */}
                  {index < cartProducts.length - 1 && (
                    <Divider variant="inset" component="li" sx={{ width: isSmallScreen ? '80%' : '45vw' }} /> // Adjust width on small screens
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>

          <Box
            sx={{
              display: 'flex',
              width: '100%', // Ensure the width matches the list
              height: '15vh',
              bgcolor: 'rgba(0, 123, 255, 0.1)', // Blue background with 20% opacity
              borderRadius: 2,
              marginTop: 2,
            }}
          >
            <Divider variant="inset" />

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                paddingLeft: isSmallScreen ? '10%' : '50%', // Adjust padding on small screens
                paddingTop: 2,
              }}
            >
              <Box sx={{ display: 'flex', verticalAlign: 'center' }}>
                <Typography component="span" variant="h6" color="text.primary">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', verticalAlign: 'center', justifyContent: 'center', gap: 1 }}>
                <Typography component="span" variant="h5" color="text.primary">
                  Total 
                </Typography>
                <Typography component="span" variant="h5" color="text.primary">
                  ${totalPrice.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

    {selectedProduct?.productid && (
      <CartProductModal
        productId={selectedProduct.productid}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    )}
    </Container>
  );
};

export default MyCart;