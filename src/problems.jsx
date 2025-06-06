import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

const THRESHOLD = 80;

// Returnează culoarea bazată pe valoare
const getColor = (value) => {
  if (value < 50) return '#4caf50';
  if (value < THRESHOLD) return '#ff9800';
  return '#f44336';
};

// Evidențiază rânduri cu probleme multiple
const isProblematic = (cpu, ram, hdd) =>
  [cpu, ram, hdd].filter((v) => v >= THRESHOLD).length >= 2;

export default function Problems({ data, user }) {
  // Protecție dacă user lipsește
  if (!user) {
    return <Typography variant="h6" sx={{ mt: 4 }}>Utilizatorul nu este disponibil.</Typography>;
  }

  // Filtrare date pentru client
  const filteredData = user.role === 'admin'
    ? data
    : data.filter(item => item.machine_id === user.machine_id);

  // Schelet de tabel gol dacă nu sunt probleme
  if (!filteredData.length) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Nu există probleme active.
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Machine ID</TableCell>
                <TableCell align="center">CPU Usage</TableCell>
                <TableCell align="center">RAM Usage</TableCell>
                <TableCell align="center">HDD Usage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell align="center"><Skeleton /></TableCell>
                  <TableCell align="center"><Skeleton /></TableCell>
                  <TableCell align="center"><Skeleton /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Probleme active {user.role === 'admin' ? 'pe toate calculatoarele' : 'pe calculatorul tău'}
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Machine ID</TableCell>
              <TableCell align="center">CPU Usage</TableCell>
              <TableCell align="center">RAM Usage</TableCell>
              <TableCell align="center">HDD Usage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map(({ machine_id, cpu, ram, hdd }) => {
              const highlight = isProblematic(cpu, ram, hdd);
              return (
                <TableRow
                  key={machine_id}
                  hover
                  sx={{
                    backgroundColor: highlight ? '#fff3e0' : 'inherit',
                    fontWeight: highlight ? 'bold' : 'normal'
                  }}
                >
                  <TableCell>{machine_id}</TableCell>
                  {[cpu, ram, hdd].map((val, idx) => (
                    <TableCell
                      key={idx}
                      align="center"
                      sx={{ color: getColor(val), fontWeight: val >= THRESHOLD ? 'bold' : 'normal' }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                        {val}%
                        {val >= THRESHOLD && <WarningIcon color="error" fontSize="small" />}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
