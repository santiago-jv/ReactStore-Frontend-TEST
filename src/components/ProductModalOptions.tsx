import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Slider,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';

const ProductOptions: React.FC<{ productId: string; stock: number }> = ({ productId, stock }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleQuantityChange = (_: Event, newValue: number | number[]) => {
    setQuantity(newValue as number);
  };

  const handleRedirect = () => {
    navigate('/messages', { state: { productId } });
  };

  const handleAddToCart = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await axios.post(
        import.meta.env.VITE_Backend_Domain_URL + '/products/alterProductToCart',
        { productid: productId, quantity },
        { withCredentials: true }
      );
      setSuccess(response.data.message || 'Product added to cart successfully.');
    } catch (err: any) {
      console.error('Error adding product to cart:', err);
      setError(err.response?.data?.message || 'Failed to add product to cart.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: 300, textAlign: 'center', margin: '0 auto' }}>
      <Slider
        value={quantity}
        onChange={handleQuantityChange}
        aria-labelledby="quantity-slider"
        step={1}
        marks
        min={1}
        max={stock} // Limits slider to available stock
        valueLabelDisplay="auto"
        sx={{ marginBottom: 3 }}
      />
      <Typography gutterBottom>
        Selected Quantity: <strong>{quantity}</strong>
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box sx={{display: "flex", gap: 5}}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddToCart}
            disabled={quantity < 1 || quantity > stock} // Intern validation of stock
          >
            Add to Cart
          </Button>
          <Button
                variant="contained"
                color="primary"
                onClick={handleRedirect}
          >
            Consult
          </Button>
        </Box>
      )}
      {success && (
        <Alert severity="success" sx={{ marginTop: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ marginTop: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ProductOptions;

