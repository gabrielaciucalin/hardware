import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Box, TextField, Button, Typography } from '@mui/material';
import { ENDPOINTS } from './config';

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!email || !password || !confirmPassword) {
      setError('Toate câmpurile sunt obligatorii.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Parolele nu coincid.');
      return;
    }

    setLoading(true);
    const auth = getAuth();

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const emailLower = res.user.email.toLowerCase();

      const role = 'client';

      // Mapare simplă machine_id (poți adapta)
      const machineIdMap = {
        'client@example.com': '171728318016306',
        'anotherclient@example.com': '1234567890',
      };
      const machine_id = machineIdMap[emailLower] || null;

      // Apelează backend să salveze și în Firestore
      const backendRes = await fetch(ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower, password, role, machine_id }),
      });

      if (!backendRes.ok) {
        const errorData = await backendRes.json();
        throw new Error(errorData.error || 'Eroare la înregistrare backend');
      }

      onRegisterSuccess({ email: emailLower, role, machine_id });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Eroare la înregistrare.');
    }

    setLoading(false);
  };

  return (
    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
      <Typography variant="h6">Înregistrare cont nou</Typography>
      <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <TextField label="Parolă" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <TextField label="Confirmă parola" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" onClick={handleRegister} disabled={loading}>
        {loading ? 'Înregistrare...' : 'Înregistrare'}
      </Button>
      <Button variant="text" onClick={onSwitchToLogin} disabled={loading}>
        Ai deja cont? Conectează-te
      </Button>
    </Box>
  );
}
