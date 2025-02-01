import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, ListItem, Box, Typography, Divider, Container } from '@mui/material';
import CartProductModal from '../components/CartProductModal';

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
        'http://reactstore-a5hhdkhndkckfaf7.eastus2-01.azurewebsites.net/purchases/showPurchasedProducts',
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
    <Container>
      {purchasedProducts.length === 0 ? (
        <Typography>You have no purchased products.</Typography>
      ) : (
        <Box overflow="auto"
          bgcolor="#e8e8e8"
          p={2}
          width={800}
          borderRadius={2}
          sx={{ mt: 4 }}
        >
          <List sx={{display: 'flex', flexDirection: 'column'}}>
            {purchasedProducts.map((product, index) => (
              <React.Fragment key={product.productid}>
                <ListItem sx={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 5}}>
                  <Box
                    component="img"
                    sx={{
                      display: 'flex',
                      width: 100,
                      height: 100,
                      marginRight: 2,
                      borderRadius: 1,
                      gap: 20
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
      <CartProductModal
        productId={selectedProduct?.productid}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </Container>
  );
};

export default MyPurchases;

