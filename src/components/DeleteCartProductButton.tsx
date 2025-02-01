import React, { useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material';

const DeleteProductButton: React.FC<{ productId: string; onDeleteSuccess?: () => void }> = ({ productId, onDeleteSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        'http://reactstore-a5hhdkhndkckfaf7.eastus2-01.azurewebsites.net/cart/deleteProduct',
        { productid: productId },
        { withCredentials: true }
      );
      alert('Product deleted successfully: ' + response.data.message);
      setOpen(false);
      if (onDeleteSuccess) {
        onDeleteSuccess(); // Callback para actualizar la lista u otras acciones
      }
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Failed to delete the product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Chip
          label="Remove"
          onClick={() => setOpen(true)}
        />
      </Stack>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this product? This action cannot be undone.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteProductButton;
