import React from 'react';
import { useSnackbar } from 'notistack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const AlertDemo = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showSuccess = () => {
    enqueueSnackbar('Operation successful!', { variant: 'success' });
  };

  const showError = () => {
    enqueueSnackbar('Something went wrong!', { variant: 'error' });
  };

  const showCustom = () => {
    enqueueSnackbar('Custom action alert!', {
      variant: 'info',
      action: (key) => (
        <IconButton size="small" color="inherit" onClick={() => closeSnackbar(key)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      ),
    });
  };

  return (
    <div>
      <Button variant="contained" onClick={showSuccess} style={{ margin: '10px' }}>
        Show Success
      </Button>
      <Button variant="contained" onClick={showError} style={{ margin: '10px' }}>
        Show Error
      </Button>
      <Button variant="contained" onClick={showCustom} style={{ margin: '10px' }}>
        Show Custom
      </Button>
    </div>
  );
};

export default AlertDemo;