import React, { useState } from 'react';
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
} from '@mui/material';

interface Product {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryid: number;
  images: File[];
}

interface ProductCreationModalProps {
  open: boolean;
  onClose: () => void;
  onCreateProduct: (formData: FormData) => void;
  error: string | null;
}

const ProductCreationModal: React.FC<ProductCreationModalProps> = ({
  open,
  onClose,
  onCreateProduct,
  error,
}) => {
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryid: 0,
    images: [],
  });

  const [categories, setCategories] = useState<{ categoryid: number; category: string }[]>([]);

  React.useEffect(() => {
    axios
      .get('http://reactstore-a5hhdkhndkckfaf7.eastus2-01.azurewebsites.net/products/showCategories')
      .then((response) => {
        setCategories(response.data.categories || []);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<number>) => {
    setFormData({ ...formData, categoryid: e.target.value as number });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData({ ...formData, images: filesArray });
    }
  };

  const handleSubmit = () => {
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price.toString());
    formDataToSend.append('stock', formData.stock.toString());
    formDataToSend.append('categoryid', formData.categoryid.toString());
    formData.images.forEach((image) => {
      formDataToSend.append('images', image);
    });

    onCreateProduct(formDataToSend); // Llama a la función de creación de productos en App
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Product</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          name="name"
          label="Name"
          variant="outlined"
          value={formData.name}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          margin="normal"
          name="description"
          label="Description"
          variant="outlined"
          value={formData.description}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          margin="normal"
          name="price"
          label="Price"
          type="number"
          variant="outlined"
          value={formData.price}
          onChange={handleInputChange}
        />
        <TextField
          fullWidth
          margin="normal"
          name="stock"
          label="Stock"
          type="number"
          variant="outlined"
          value={formData.stock}
          onChange={handleInputChange}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={formData.categoryid}
            onChange={handleSelectChange}
            label="Category"
          >
            {categories.map((cat) => (
              <MenuItem key={cat.categoryid} value={cat.categoryid}>
                {cat.category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" sx={{ marginTop: 2 }}>
          Upload images:
        </Typography>
        <Button variant="contained" component="label" sx={{ marginTop: 1 }}>
          Choose Files
          <input type="file" multiple hidden onChange={handleFileChange} />
        </Button>

        {formData.images.length > 0 && (
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            {formData.images.map((image, index) => (
              <Grid item xs={4} key={index}>
                <Box
                  component="img"
                  src={URL.createObjectURL(image)}
                  alt={image.name}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: 1,
                  }}
                />
                <Typography variant="caption" sx={{ textAlign: 'center' }}>
                  {image.name}
                </Typography>
              </Grid>
            ))}
          </Grid>
        )}
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductCreationModal;
