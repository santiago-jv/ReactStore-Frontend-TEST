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
import { Container } from '@mui/material';
import CartProductModal from '../components/CartProductModal';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'; // Ícono para mostrar cuando el carrito está vacío
import theme from '../theme';

interface CartProduct {
  cartproductid: string;
  productid: string;
  name: string;
  quantity: number;
  price: number;
  imageurl: string;
}

const MyCart: React.FC = () => {
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [productQuantities, setProductQuantities] = useState<{ [key: string]: number }>({});
  const [selectedProduct, setSelectedProduct] = useState<CartProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (product: CartProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchCartProducts();
  }, []);

  useEffect(() => {
    if (cartProducts.length > 0) {
      const initialQuantities: { [key: string]: number } = {};
      cartProducts.forEach(product => {
        initialQuantities[product.productid] = product.quantity;
      });
      setProductQuantities(initialQuantities);
    }
  }, [cartProducts]);

  const fetchCartProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get<{ cartProducts: CartProduct[] }>(
        'http://reactstore-a5hhdkhndkckfaf7.eastus2-01.azurewebsites.net/cart/showUserProducts',
        { withCredentials: true }
      );
      setCartProducts(response.data.cartProducts);
    } catch (err) {
      setError('Failed to load cart products.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productid: string, change: number) => {
    const currentQuantity = productQuantities[productid] || 0;
    const newQuantity = currentQuantity + change;

    if (newQuantity < 0) return; // Evita cantidades negativas

    setProductQuantities(prevQuantities => ({
      ...prevQuantities,
      [productid]: newQuantity,
    }));

    try {
      await axios.post(
        'http://reactstore-a5hhdkhndkckfaf7.eastus2-01.azurewebsites.net/products/alterProductToCart',
        { productid, quantity: newQuantity },
        { withCredentials: true }
      );
      fetchCartProducts();
    } catch (err) {
      setError('Failed to update product quantity.');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  const totalItems = cartProducts.reduce((total, product) => total + product.quantity, 0);
  const totalPrice = cartProducts.reduce((total, product) => total + product.quantity * product.price, 0);

  return (
    <Container sx={{ mt: 4 }}>
      {cartProducts.length === 0 ? (
        // Vista alternativa cuando el carrito está vacío
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height= {650}
          textAlign="center"
          overflow="auto"
          bgcolor="#e8e8e8" p={2}
          borderRadius={2}
        >
          <svg style={{stroke: theme.palette.text.secondary}} height="20em" width="20em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21 5L19 12H7.37671M20 16H8L6 3H3M11 3L13.5 5.5M13.5 5.5L16 8M13.5 5.5L16 3M13.5 5.5L11 8M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z" stroke="theme.palette.text.secondary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
          <Typography variant="h6" color="text.secondary">
            Your cart is empty.
          </Typography>
        </Box>
      ) : (
        // Vista normal cuando hay productos en el carrito
        <Box overflow="auto" bgcolor="#e8e8e8" p={2} width={800}>
          <List sx={{ display: 'flex', flexDirection: 'column' }}>
            {cartProducts.map((product, index) => (
              <React.Fragment key={product.cartproductid}>
                <ListItem sx={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 5 }}>
                  <Box
                    component="img"
                    sx={{
                      width: 100,
                      height: 100,
                      marginRight: 2,
                      borderRadius: 1,
                    }}
                    alt={product.name}
                    src={product.imageurl}
                    onClick={() => handleOpenModal(product)}
                  />
                  <Box>
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
                  <DeleteProductButton productId={product.productid} />
                </ListItem>
                {index < cartProducts.length - 1 && <Divider variant="inset" component="li" sx={{ width: '45vw' }} />}
              </React.Fragment>
            ))}
          </List>

          <Box
            sx={{
              display: "flex",
              width: "50vw",
              height: "15vh",
              bgcolor: "rgba(0, 123, 255, 0.1)", // Fondo azul con 20% de opacidad
              borderRadius: 2,
            }}
          >
            <Divider variant="inset" />

            <Box sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              paddingLeft: '28.5vw',
              paddingTop: 2
            }}>
              <Box sx={{
                display: "flex",
                verticalAlign: "center"
              }}
              >
                <Typography component="span" variant="h9" color="text.primary">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </Typography>
              </Box>
              <Box sx={{
                display: "flex",
                flexDirection: "row",
                verticalAlign: "center",
                justifyContent: "center"
              }}
              >
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

      <CartProductModal
        productId={selectedProduct?.productid}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </Container>
  );
};

export default MyCart;