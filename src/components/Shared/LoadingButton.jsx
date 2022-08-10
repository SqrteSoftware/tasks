import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { green } from '@mui/material/colors';
import Button from '@mui/material/Button';


var buttonProgressStyle = {
  color: green[500],
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginTop: '-10px',
  marginLeft: '-5px',
}

export default function LoadingButton(props) {
  const [loading, setLoading] = React.useState(false);

  const handleButtonClick = (e) => {
    if (!loading) {
      setLoading(true);
    }
    props.onClick(e);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ m: 1, position: 'relative' }}>
        <Button
          variant="contained"
          color="primary"
          disabled={loading}
          onClick={handleButtonClick}>
          {props.children}
        </Button>
        {loading && <CircularProgress size={24} sx={buttonProgressStyle} />}
      </Box>
    </Box>
  );
}