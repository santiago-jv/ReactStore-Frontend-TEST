import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Alert,
  Grid,
  Box,
  CircularProgress,
  Container,
} from '@mui/material';

interface Product {
  productid: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryid: number;
  images: File[];
  imageurls: string[];
}

const ProductEditionModal: React.FC<{ productId: string }> = ({ productId }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Product | null>(null);
  const [categories, setCategories] = useState<{ categoryid: number; category: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'http://reactstore-a5hhdkhndkckfaf7.eastus2-01.azurewebsites.net/products/showProduct',
        { productid: productId },
        { withCredentials: true }
      );
      const product = response.data.product;
  
      const imageFiles: File[] = await Promise.all(
        product.imageurls.map(async (url: string, index: number) => {
          const res = await fetch(url);
          const blob = await res.blob();
          return new File([blob], `image-${index}.jpg`, { type: blob.type });
        })
      );
  
      setFormData({
        ...product,
        images: imageFiles,
        categoryid: product.categoryid || categories[0]?.categoryid || '',
      });
  
      setSelectedImage(product.imageurls?.[0] || null);
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://reactstore-a5hhdkhndkckfaf7.eastus2-01.azurewebsites.net/products/showCategories');
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProductDetails();
      fetchCategories();
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<number>) => {
    if (!formData) return;
    setFormData({ ...formData, categoryid: e.target.value as number });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData || !e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setFormData({ ...formData, images: filesArray });
  };

  const handleSubmit = async () => {
    if (!formData) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('productid', formData.productid);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('stock', formData.stock.toString());
      formDataToSend.append('categoryid', formData.categoryid.toString());
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const response = await axios.post('http://reactstore-a5hhdkhndkckfaf7.eastus2-01.azurewebsites.net/products/update', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      alert('Product updated successfully: ' + response.data.message);
      setOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while updating the product.');
    }
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Edit</Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          {loading ? (
            <CircularProgress />
          ) : formData ? (
            <Container sx={{display: 'flex', flexDirection: 'row'}}>
              <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <TextField
                  margin="normal"
                  sx={{width: '15vw'}}
                  name="name"
                  label="Name"
                  variant="outlined"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <TextField
                  margin="normal"
                  multiline
                  sx={{width: '20vw'}}
                  name="description"
                  label="Description"
                  variant="outlined"
                  value={formData.description}
                  onChange={handleInputChange}
                />
                <Box>
                  <TextField
                    sx={{width: '10vw'}}
                    margin="normal"
                    name="price"
                    label="Price"
                    type="number"
                    variant="outlined"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                  <TextField
                    sx={{width: '10vw'}}
                    margin="normal"
                    name="stock"
                    label="Stock"
                    type="number"
                    variant="outlined"
                    value={formData.stock}
                    onChange={handleInputChange}
                  />
                </Box>
                <FormControl margin="normal">
                  <InputLabel id="category-select-label">
                    {categories.length > 0 ? 'Category' : 'Loading categories...'}
                  </InputLabel>
                  <Select
                    labelId="category-select-label"
                    id="category-select"
                    value={formData.categoryid}
                    onChange={handleSelectChange}
                    label="Category"
                    sx={{width: '20vw'}}
                  >
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <MenuItem key={cat.categoryid} value={cat.categoryid}>
                          {cat.category}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Loading...</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'center', paddingLeft: 20}}>
                <Typography variant="body2" sx={{ marginTop: 2 }}>
                  Upload images:
                </Typography>
                <Button variant="contained" component="label" sx={{ marginTop: 1, width: '10vw' }}>
                  Choose Files
                  <input type="file" multiple hidden onChange={handleFileChange} />
                </Button>
                {formData.imageurls.length > 0 && (
                  <Grid container spacing={2} sx={{ marginTop: 2 }}>
                    {formData.imageurls.map((url, index) => (
                      <Grid item xs={4} key={index}>
                        <Box
                          component="img"
                          src={url}
                          alt={`Existing image ${index}`}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: '8px',
                            boxShadow: 1,
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
              
            </Container>
          ) : (
            <Typography>Error loading product details.</Typography>
          )}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductEditionModal;
