import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ProductEditionModal from '../components/ProductEditionModal';
import DeleteProductButton from './DeleteProductButton';

export interface Product {
  productid: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageurls: string[];
}

interface ProductModalProps {
  productId: string | null; // Only the ID of the product
  open: boolean;
  onClose: () => void;
}

const MyProductModal: React.FC<ProductModalProps> = ({ productId, open, onClose }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>(''); // State for main image
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // State for error handeling

  // Hook to detect the size of the display
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Small displays (lower than 600px)

  //Function to get the details from the product
  const fetchSelectedProduct = async () => {
    if (!productId) return; // If there's no ID, nothing happens
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        import.meta.env.VITE_Backend_Domain_URL + '/products/showProduct',
        { productid: productId },
        { withCredentials: true }
      );
      const product = response.data.product; // Suposing the backend gives back the `product`
      setSelectedProduct(product);
      setSelectedImage(product.imageurls[0] || ''); // Sets the first image
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  // Calls `fetchSelectedProduct` The modal opens or changes ID
  useEffect(() => {
    if (open) {
      fetchSelectedProduct();
    } else {
      setSelectedProduct(null);
      setSelectedImage('');
    }
  }, [productId, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: isSmallScreen ? 'column' : 'row', // Changes direction for small displays
          gap: 2,
          padding: isSmallScreen ? 1 : 3, // Adjust padding for small displays
        }}
      >
        {loading ? (
          <Typography variant="h6">Cargando...</Typography>
        ) : error ? (
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        ) : selectedProduct ? (
          <>
            {/* Container selector for images and main image */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: isSmallScreen ? 'column' : 'row', // Changes direction for small displays
                gap: 2,
                alignItems: 'center',
              }}
            >
              {/* Image selector (vertical) */}
              <ImageList
                sx={{
                  height: isSmallScreen ? 100 : 420, // Adjust hight for small displays
                  width: isSmallScreen ? '100%' : 100, // Adjust width for small displays
                  flexDirection: 'column', // Siempre vertical
                }}
                cols={1} // A column for vertical selector
                rowHeight={100} // Fixed hight for miniature
              >
                {(selectedProduct.imageurls || []).map((url, index) => (
                  <ImageListItem
                    key={index}
                    onMouseEnter={() => setSelectedImage(url)} // Changes image while hover an image
                    sx={{
                      cursor: 'pointer',
                      border: selectedImage === url ? '2px solid blue' : 'none', // Highlights an active miniature
                    }}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>

              {/* Main image */}
              <img
                src={selectedImage} // Main image based on state
                alt="Selected product"
                style={{
                  width: isSmallScreen ? '100%' : '30em', // Adjust width for small displays
                  height: isSmallScreen ? 'auto' : '30em', // Adjust hight for small displays
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            </Box>

            {/* Product details */}
            <Box
              flex={1}
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{
                padding: isSmallScreen ? 1 : 0, // Adjust padding in small displays
              }}
            >
              <DialogTitle variant="h3">{selectedProduct.name || 'No title'}</DialogTitle>
              <Typography variant="h4">
                ${selectedProduct.price?.toLocaleString('es-CO') || 'N/A'}
              </Typography>
              <Typography variant="body1">
                {selectedProduct.description || 'No description available'}
              </Typography>
              <Typography variant="body1">Stock: {selectedProduct.stock || 'N/A'}</Typography>
              <Typography variant="body1">Category: {selectedProduct.category || 'N/A'}</Typography>

              <DialogActions
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: 'auto',
                }}
              >
                <ProductEditionModal productId={selectedProduct?.productid} />
                <DeleteProductButton productId={selectedProduct?.productid} />
              </DialogActions>
            </Box>
          </>
        ) : (
          <Typography variant="h6">Producto no encontrado.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MyProductModal;