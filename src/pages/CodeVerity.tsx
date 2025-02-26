import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

const CodeVerity: React.FC = () => {
  // Gets query string from URL
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email'); // Extracts the email

  // State of verification code digits
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [message, setMessage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State for controlling the modal

  // Handles the cnages in each digit
  const handleDigitChange = (index: number, value: string) => {
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Changes digit position if recives one
    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handles backspace key
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // If space is empty and backspace is pressed, moves the digit position to the previous one
      const prevInput = document.getElementById(`digit-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Handles pasting the code
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault(); // Avoids the default behavior for pasting
    const pastedText = e.clipboardData.getData('text'); // gets the pasted text

    // Verifies if the pasted text contains exactly 6 digits 
    if (pastedText.length === 6) {
      const newDigits = pastedText.split(''); // Divides the chain in characters
      setDigits(newDigits); // Updates the state with the new digits

      // Moves the
      const lastInput = document.getElementById(`digit-5`);
      if (lastInput) {
        lastInput.focus();
      }
    } else {
      setMessage('El código debe tener exactamente 6 caracteres.');
    }
  };

  // Submits the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage('Email is missing in the URL.');
      setIsModalOpen(true); // Opens the modal to show the error message
      return;
    }

    // Unites the digits to create the completed code
    const code = digits.join('');

    try {
      const response = await axios.post(import.meta.env.VITE_Backend_Domain_URL + '/users/verify', { email, code });
      setMessage(response.data.message);
      setIsModalOpen(true); // Opens the modal to show the success message
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error verifying account');
      setIsModalOpen(true); // Opens the modal to show the error message
    }
  };

  // Cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Verify Your Account
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            {digits.map((digit, index) => (
              <TextField
                key={index}
                id={`digit-${index}`}
                variant="outlined"
                margin="normal"
                inputProps={{
                  maxLength: 1, // Only alows one character
                  style: { textAlign: 'center' }, // Aligns center the text
                }}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)} // Hanles backspace key
                onPaste={index === 0 ? handlePaste : undefined} // Handles the paste option only at the first position
                required
              />
            ))}
          </Box>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Verify
          </Button>
        </Box>
      </Box>

      {/* Modal for show the success or error message */}
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Verification Result</DialogTitle>
        <DialogContent>
          <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CodeVerity;