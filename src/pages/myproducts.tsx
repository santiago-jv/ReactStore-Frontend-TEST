import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Container,
  CircularProgress,
  Box,
  useMediaQuery,
} from '@mui/material';
import Grid from '@mui/material/Grid2'; // Importar Grid2
import ProductModal from '../components/MyProductModal';
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

const MyProducts: React.FC<ProductsGridProps> = ({ products, fetchUserProducts }) => {
  const [selectedProduct, setSelectedProduct] = useState<BaseProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // State to handle loading

  // Hook to detect screen size
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // Small screens (less than 600px)

  // Effect to load products when the component mounts
  useEffect(() => {
    const loadProducts = async () => {
      try {
        await fetchUserProducts(); // Call the function to load products
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false); // End loading
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

  // Show a loading indicator while products are being loaded
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
        // Alternative view when there are no products
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
            style={{ fill: theme.palette.text.secondary }}
            fill="#000000"
            height="20em"
            width="20em"
            version="1.1"
            id="Filled_Icons"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="-3.36 -3.36 30.72 30.72"
            enable-background="new 0 0 24 24"
          >
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
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
        // Normal view when there are products
        <Grid
          container
          spacing={isSmallScreen ? 2 : 4} // Adjust spacing on small screens
          justifyContent="center"
          overflow="auto"
          bgcolor="#e8e8e8"
          p={2}
          height={650}
          borderRadius={2}
        >
          {products.map((prod) => (
            <Grid
              key={prod.productid}
              component="div" // Especificar el componente base
              onClick={() => handleOpenModal(prod)}
              sx={{ cursor: 'pointer' }}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleOpenModal(prod)}
            >
              <Card>
                <CardMedia
                  component="img"
                  sx={{
                    height: isSmallScreen ? 150 : 220, // Adjust height on small screens
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

      {selectedProduct && (
        <ProductModal
          productId={selectedProduct.productid}
          open={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </Container>
  );
};

export default MyProducts;