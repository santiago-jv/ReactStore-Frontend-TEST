import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
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
  productId: string | null; // Solo el ID del producto
  open: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ productId, open, onClose }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>(''); // Estado para la imagen principal
  const [loading, setLoading] = useState<boolean>(false); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores

  // Función para obtener los detalles del producto
  const fetchSelectedProduct = async () => {
    if (!productId) return; // Si no hay ID, no hacemos nada
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://reactstore-a5hhdkhndkckfaf7.eastus2-01.azurewebsites.net/products/showProduct',
        { productid: productId },
        { withCredentials: true }
      );
      const product = response.data.product; // Suponiendo que el backend devuelve `product`
      setSelectedProduct(product);
      setSelectedImage(product.imageurls[0] || ''); // Establecer la primera imagen
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  // Llamar a `fetchSelectedProduct` cada vez que el modal se abra o cambie el ID
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
      <DialogContent sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
        {loading ? (
          <Typography variant="h6">Cargando...</Typography>
        ) : error ? (
          <Typography variant="h6" color="error">{error}</Typography>
        ) : selectedProduct ? (
          <>
            {/* Galería de miniaturas */}
            <Box sx={{display: 'flex', flexDirection: 'row' }}>
              <ImageList sx={{ height: 420 }} cols={1} rowHeight={100}>
                {(selectedProduct.imageurls || []).map((url, index) => (
                  <ImageListItem
                    key={index}
                    onMouseEnter={() => setSelectedImage(url)} // Cambiar imagen al pasar el cursor
                    sx={{
                      cursor: 'pointer',
                      border: selectedImage === url ? '2px solid blue' : 'none', // Resaltar miniatura activa
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
              <img
                src={selectedImage} // Imagen principal basada en el estado
                alt="Selected product"
                style={{
                  width: '30em',
                  height: '30em',
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            </Box>

            {/* Imagen principal y detalles del producto */}
            <Box flex={1} display="flex" flexDirection="column" gap={2} >
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
                  marginTop: 'auto'
                }}
              >
                <ProductEditionModal
                  productId={selectedProduct?.productid}
                />
                <DeleteProductButton
                  productId={selectedProduct?.productid}
                />
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

export default ProductModal;



