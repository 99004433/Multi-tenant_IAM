import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';

const AuthPage = ({ onLoginSuccess }) => {
  const [openSignup, setOpenSignup] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSignup = () => {
    localStorage.setItem('user', JSON.stringify({ email, password, role }));
    alert('Signup successful!');
    setOpenSignup(false);
  };

  const handleLogin = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email === email && user.password === password) {
      localStorage.setItem('isLoggedIn', 'true');
      alert('Login successful!');
      setOpenLogin(false);
      onLoginSuccess();
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <h1>Welcome to HealthCare</h1>
      <Box sx={{ display: 'flex', gap: '20px' }}>
        <Button variant="contained" onClick={() => setOpenSignup(true)}>Sign Up</Button>
        <Button variant="outlined" onClick={() => setOpenLogin(true)}>Login</Button>
      </Box>

      {/* Sign Up Dialog */}
      <Dialog open={openSignup} onClose={() => setOpenSignup(false)}>
        <DialogTitle>Sign Up</DialogTitle>
        <DialogContent>
          <TextField label="Email" fullWidth margin="dense" onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Password" type="password" fullWidth margin="dense" onChange={(e) => setPassword(e.target.value)} />
          <TextField label="Role (admin/user)" fullWidth margin="dense" onChange={(e) => setRole(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSignup(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSignup}>Sign Up</Button>
        </DialogActions>
      </Dialog>

      {/* Login Dialog */}
      <Dialog open={openLogin} onClose={() => setOpenLogin(false)}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <TextField label="Email" fullWidth margin="dense" onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Password" type="password" fullWidth margin="dense" onChange={(e) => setPassword(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogin(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleLogin}>Login</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuthPage;



