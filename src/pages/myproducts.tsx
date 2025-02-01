import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Container,
  CircularProgress,
  Box,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ProductModal from '../components/MyProductModal';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';

export interface BaseProduct {
  productid: string;
  name: string;
  price: number;
  imageurls: string[];
}

interface ProductsGridProps {
  products: BaseProduct[];
  fetchUserProducts: () => void;
}

const ProductsGrid: React.FC<ProductsGridProps> = ({ products, fetchUserProducts }) => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<BaseProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Estado para manejar la carga

  // Efecto para cargar los productos al montar el componente
  useEffect(() => {
    const loadProducts = async () => {
      try {
        await fetchUserProducts(); // Llama a la función para cargar los productos
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false); // Finaliza la carga
      }
    };

    loadProducts();
  }, [fetchUserProducts]);

  const handleOpenModal = (product: BaseProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  // Mostrar un indicador de carga mientras los productos se están cargando
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={650}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      {products.length === 0 ? (
        // Vista alternativa cuando no hay productos
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
          <svg style={{ fill: theme.palette.text.secondary }} fill="#000000" height="20em" width="20em" version="1.1" id="Filled_Icons" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="-3.36 -3.36 30.72 30.72" enable-background="new 0 0 24 24">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <g id="Status-Error-Filled">
                <path d="M12,0C5.37,0,0,5.37,0,12s5.37,12,12,12s12-5.37,12-12S18.63,0,12,0z M18.38,16.62l-1.77,1.77L12,13.77l-4.62,4.62 l-1.77-1.77L10.23,12L5.62,7.38l1.77-1.77L12,10.23l4.62-4.62l1.77,1.77L13.77,12L18.38,16.62z"></path>
              </g>
            </g>
          </svg>
          <Typography variant="h6" color="text.secondary">
            You have no created products yet.
          </Typography>
        </Box>
      ) : (
        // Vista normal cuando hay productos
        <Grid container spacing={5} justifyContent="center" overflow="auto" bgcolor="#e8e8e8" p={2} height={650} borderRadius={2}>
          {products.map((prod) => (
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 'auto',
              }}
              key={prod.productid}
              onClick={() => handleOpenModal(prod)}
              sx={{ cursor: 'pointer' }}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenModal(prod)}
            >
              <Card>
                <CardMedia
                  component="img"
                  sx={{
                    height: {
                      xs: 100,
                      lg: 220,
                    },
                    objectFit: 'cover',
                  }}
                  image={prod.imageurls[0] || '/path-to-placeholder-image.jpg'}
                  alt={prod.name}
                />
                <CardContent>
                  <Typography variant="h6" component="div">
                    {prod.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${prod.price.toLocaleString('es-CO')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ProductModal
        productId={selectedProduct?.productid}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </Container>
  );
};

export default ProductsGrid;