import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, ListItem, Box, Typography, Divider, Container } from '@mui/material';
import CartProductModal from '../components/CartProductModal';
import theme from '../theme';

export interface PurchasedProduct {
  productid: string;
  name: string;
  quantity: number;
  price: number;
  imageurl: string;
  createdat: string;
}

const MyPurchases: React.FC = () => {
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<PurchasedProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (product: PurchasedProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchPurchasedProducts();
  }, []);

  const fetchPurchasedProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get<{ purchasedProducts: PurchasedProduct[] }>(
        import.meta.env.VITE_Backend_Domain_URL + '/purchases/showPurchasedProducts',
        { withCredentials: true }
      );
      setPurchasedProducts(response.data.purchasedProducts);
    } catch (err) {
      setError('Failed to load purchased products.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container sx={{ mt: 4 }}>
      {purchasedProducts.length === 0 ? (
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
          <svg
            style={{ stroke: theme.palette.text.secondary }}
            fill="none"
            height="20em"
            width="20em"
            viewBox="-3.36 -3.36 30.72 30.72"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M9 11V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V10.9673M10.4 21H13.6C15.8402 21 16.9603 21 17.816 20.564C18.5686 20.1805 19.1805 19.5686 19.564 18.816C20 17.9603 20 16.8402 20 14.6V12.2C20 11.0799 20 10.5198 19.782 10.092C19.5903 9.71569 19.2843 9.40973 18.908 9.21799C18.4802 9 17.9201 9 16.8 9H7.2C6.0799 9 5.51984 9 5.09202 9.21799C4.71569 9.40973 4.40973 9.71569 4.21799 10.092C4 10.5198 4 11.0799 4 12.2V14.6C4 16.8402 4 17.9603 4.43597 18.816C4.81947 19.5686 5.43139 20.1805 6.18404 20.564C7.03968 21 8.15979 21 10.4 21Z"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </g>
          </svg>
          <Typography variant="h6" color="text.secondary">
            You have no purchased products.
          </Typography>
        </Box>
      ) : (
        <Box
          marginLeft={20}
          overflow="auto"
          bgcolor="#e8e8e8"
          p={2}
          width={800}
          borderRadius={2}
          sx={{ mt: 4, height: '70vh', overflowY: 'auto' }}
        >
          <List sx={{ display: 'flex', flexDirection: 'column' }}>
            {purchasedProducts.map((product, index) => (
              <React.Fragment key={product.productid}>
                <ListItem sx={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 5 }}>
                  <Box
                    component="img"
                    sx={{
                      display: 'flex',
                      width: 100,
                      height: 100,
                      marginRight: 2,
                      borderRadius: 1,
                      gap: 20,
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
                    <Typography component="span" variant="body2" color="text.secondary">
                      Purchased on: {new Date(product.createdat).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography component="span" variant="h6" color="text.primary">
                      Quantity: {product.quantity}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography component="span" variant="h6" color="text.primary">
                      Price: ${product.price}
                    </Typography>
                  </Box>
                </ListItem>
                {index < purchasedProducts.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
      {selectedProduct && (
        <CartProductModal
          productId={selectedProduct.productid}
          open={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </Container>
  );
};

export default MyPurchases;
