import React, { useState } from 'react'; 
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Box, TextField, Button, Typography } from '@mui/material';
import { ENDPOINTS } from './config';

export default function Login({ user, onLogin, onLogout }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const auth = getAuth();

    try {
      // 1. Login Firebase
      const res = await signInWithEmailAndPassword(auth, email, password);
      const emailLower = res.user.email.toLowerCase();

      // 2. Obține tokenul JWT Firebase
      const token = await res.user.getIdToken();

      // 3. Trimite tokenul backend-ului în header Authorization
      const backendRes = await fetch(ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: emailLower }) // poți trimite și alte date dacă vrei
      });

      const data = await backendRes.json();

      if (!backendRes.ok) {
        throw new Error(data.error || 'Eroare la autentificare backend');
      }

      // 4. Apelează onLogin cu datele primite
      const { role, machine_id } = data;
      onLogin({ email: emailLower, role, machine_id });

    } catch (err) {
      console.error(err);
      setError('Autentificare eșuată. Verifică datele introduse.');
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    onLogout();
  };

  if (user) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Salut, {user.email}</Typography>
        <Button variant="outlined" onClick={handleLogout}>Logout</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <TextField label="Parolă" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" onClick={handleLogin}>Login</Button>
    </Box>
  );
}
