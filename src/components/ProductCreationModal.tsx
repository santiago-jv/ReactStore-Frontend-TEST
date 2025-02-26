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
      .get(import.meta.env.VITE_Backend_Domain_URL + '/products/showCategories')
      .then((response) => {
        setCategories(response.data.categories || []);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validación para price y stock
    if (name === 'price' || name === 'stock') {
      const numericValue = parseFloat(value);
      if (numericValue <= 0) {
        return; // No actualiza el estado si el valor es menor o igual a cero
      }
    }

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

  // Verifica si todos los campos están llenos y son válidos
  const isFormValid =
    formData.name.trim() !== '' &&
    formData.description.trim() !== '' &&
    formData.price > 0 &&
    formData.stock > 0 &&
    formData.categoryid !== 0 &&
    formData.images.length > 0;

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
          error={formData.name.trim() === ''} // Muestra un error si el nombre está vacío
          helperText={formData.name.trim() === '' ? 'Name is required' : ''}
        />
        <TextField
          fullWidth
          margin="normal"
          name="description"
          label="Description"
          variant="outlined"
          value={formData.description}
          onChange={handleInputChange}
          error={formData.description.trim() === ''} // Muestra un error si la descripción está vacía
          helperText={formData.description.trim() === '' ? 'Description is required' : ''}
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
          error={formData.price <= 0} // Muestra un error si el precio es menor o igual a cero
          helperText={formData.price <= 0 ? 'Price must be greater than zero' : ''}
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
          error={formData.stock <= 0} // Muestra un error si el stock es menor o igual a cero
          helperText={formData.stock <= 0 ? 'Stock must be greater than zero' : ''}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={formData.categoryid}
            onChange={handleSelectChange}
            label="Category"
            error={formData.categoryid === 0} // Muestra un error si no se ha seleccionado una categoría
          >
            <MenuItem value={0} disabled>
              Select a category
            </MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.categoryid} value={cat.categoryid}>
                {cat.category}
              </MenuItem>
            ))}
          </Select>
          {formData.categoryid === 0 && (
            <Typography variant="caption" color="error">
              Category is required
            </Typography>
          )}
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
        {formData.images.length === 0 && (
          <Typography variant="caption" color="error">
            At least one image is required
          </Typography>
        )}
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!isFormValid} // Disables the button if the form is not valid
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductCreationModal;
