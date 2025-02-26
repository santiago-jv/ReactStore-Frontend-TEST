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

// Interface defining the structure of a Product
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

// ProductEditionModal component for editing product details
const ProductEditionModal: React.FC<{ productId: string }> = ({ productId }) => {
  const [open, setOpen] = useState(false); // State to manage modal open/close
  const [formData, setFormData] = useState<Product | null>(null); // State to hold product form data
  const [categories, setCategories] = useState<{ categoryid: number; category: string }[]>([]); // State to hold categories
  const [error, setError] = useState<string | null>(null); // State to manage error messages
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading state

  // Function to fetch product details
  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        import.meta.env.VITE_Backend_Domain_URL + '/products/showProduct',
        { productid: productId },
        { withCredentials: true }
      );
      const product = response.data.product;

      // Convert image URLs to File objects
      const imageFiles: File[] = await Promise.all(
        product.imageurls.map(async (url: string, index: number) => {
          const res = await fetch(url);
          const blob = await res.blob();
          return new File([blob], `image-${index}.jpg`, { type: blob.type });
        })
      );

      // Set form data with product details and images
      setFormData({
        ...product,
        images: imageFiles,
        categoryid: product.categoryid || categories[0]?.categoryid || '',
      });
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_Backend_Domain_URL + '/products/showCategories');
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch product details and categories when the modal opens
  useEffect(() => {
    if (open) {
      fetchProductDetails();
      fetchCategories();
    }
  }, [open]);

  // Handle input changes in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;

    // Validation for price and stock
    if (name === 'price' || name === 'stock') {
      const numericValue = parseFloat(value);
      if (numericValue <= 0) {
        return; // Do not update state if the value is less than or equal to zero
      }
    }

    // Update form data
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    });
  };

  // Handle category selection change
  const handleSelectChange = (e: SelectChangeEvent<number>) => {
    if (!formData) return;
    setFormData({ ...formData, categoryid: e.target.value as number });
  };

  // Handle file input change for images
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData || !e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setFormData({ ...formData, images: filesArray });
  };

  // Handle form submission
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

      // Send the updated product data to the backend
      const response = await axios.post(import.meta.env.VITE_Backend_Domain_URL + '/products/update', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      alert('Product updated successfully: ' + response.data.message);
      setOpen(false); // Close the modal after successful submission
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while updating the product.');
    }
  };

  // Check if the form is valid
  const isFormValid =
    formData &&
    formData.name.trim() !== '' &&
    formData.description.trim() !== '' &&
    formData.price > 0 &&
    formData.stock > 0 &&
    formData.categoryid !== 0 &&
    formData.images.length > 0;

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Edit</Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          {loading ? (
            <CircularProgress /> // Show loading spinner while fetching data
          ) : formData ? (
            <Container sx={{ display: 'flex', flexDirection: 'row' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* Name input field */}
                <TextField
                  margin="normal"
                  sx={{ width: '15vw' }}
                  name="name"
                  label="Name"
                  variant="outlined"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={formData.name.trim() === ''} // Show error if name is empty
                  helperText={formData.name.trim() === '' ? 'Name is required' : ''}
                />
                {/* Description input field */}
                <TextField
                  margin="normal"
                  multiline
                  sx={{ width: '20vw' }}
                  name="description"
                  label="Description"
                  variant="outlined"
                  value={formData.description}
                  onChange={handleInputChange}
                  error={formData.description.trim() === ''} // Show error if description is empty
                  helperText={formData.description.trim() === '' ? 'Description is required' : ''}
                />
                <Box>
                  {/* Price input field */}
                  <TextField
                    sx={{ width: '10vw' }}
                    margin="normal"
                    name="price"
                    label="Price"
                    type="number"
                    variant="outlined"
                    value={formData.price}
                    onChange={handleInputChange}
                    error={formData.price <= 0} // Show error if price is less than or equal to zero
                    helperText={formData.price <= 0 ? 'Price must be greater than zero' : ''}
                  />
                  {/* Stock input field */}
                  <TextField
                    sx={{ width: '10vw' }}
                    margin="normal"
                    name="stock"
                    label="Stock"
                    type="number"
                    variant="outlined"
                    value={formData.stock}
                    onChange={handleInputChange}
                    error={formData.stock <= 0} // Show error if stock is less than or equal to zero
                    helperText={formData.stock <= 0 ? 'Stock must be greater than zero' : ''}
                  />
                </Box>
                {/* Category selection dropdown */}
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
                    sx={{ width: '20vw' }}
                    error={formData.categoryid === 0} // Show error if no category is selected
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
                  {formData.categoryid === 0 && (
                    <Typography variant="caption" color="error">
                      Category is required
                    </Typography>
                  )}
                </FormControl>
              </Box>
              {/* Image upload section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'center', paddingLeft: 20 }}>
                <Typography variant="body2" sx={{ marginTop: 2 }}>
                  Upload images:
                </Typography>
                <Button variant="contained" component="label" sx={{ marginTop: 1, width: '10vw' }}>
                  Choose Files
                  <input type="file" multiple hidden onChange={handleFileChange} />
                </Button>
                {/* Display existing images */}
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
                {/* Show error if no images are uploaded */}
                {formData.images.length === 0 && (
                  <Typography variant="caption" color="error">
                    At least one image is required
                  </Typography>
                )}
              </Box>
            </Container>
          ) : (
            <Typography>Error loading product details.</Typography>
          )}
          {/* Display error message if any */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!isFormValid} // Disable the button if the form is not valid
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductEditionModal;