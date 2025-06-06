import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Select, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableRow
} from '@mui/material';

export default function HostDetail({ user }) {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');

  useEffect(() => {
    console.log('User:', user);

    if (user.role === 'admin') {
      fetch('http://192.168.56.1:5000/api/hardware/details')
        .then(res => {
          console.log('Admin fetch response status:', res.status);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          console.log('Admin fetch data:', data);
          setMachines(data);

          // Setăm prima mașină selectată automat, dacă există
          if (data.length > 0) {
            setSelectedMachine(data[0].machine_id);
          } else {
            setSelectedMachine('');
          }
        })
        .catch(err => {
          console.error('Admin fetch error:', err);
          setMachines([]);
          setSelectedMachine('');
        });
    } else {
      // client non-admin
      if (user.machine_id) {
        fetch(`http://192.168.56.1:5000/api/hardware/details/${user.machine_id}`)
          .then(res => {
            console.log('Client fetch response status:', res.status);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
          .then(data => {
            console.log('Client fetch data:', data);
            setMachines([data]);
            setSelectedMachine(data.machine_id);
          })
          .catch(err => {
            console.error('Client fetch error:', err);
            setMachines([]);
            setSelectedMachine('');
          });
      } else {
        console.warn('Client user does not have a valid machine_id');
        setMachines([]);
        setSelectedMachine('');
      }
    }
  }, [user]);

  const details = machines.find(m => m.machine_id === selectedMachine);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Host Detail</Typography>

      {user.role === 'admin' && machines.length > 0 && (
        <Select
          value={selectedMachine}
          onChange={e => setSelectedMachine(e.target.value)}
          sx={{ mb: 3, minWidth: 150 }}
        >
          {machines.map(m => (
            <MenuItem key={m.machine_id} value={m.machine_id}>
              {m.machine_id}
            </MenuItem>
          ))}
        </Select>
      )}

      {details ? (
        <TableContainer component={Paper} sx={{ maxWidth: 700 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell><b>CPU Utilizare pe nuclee (%)</b></TableCell>
                <TableCell>{details.cpu_cores_usage.join(', ')}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Frecvența CPU (MHz)</b></TableCell>
                <TableCell>{details.cpu_frequency}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Tensiune CPU (V)</b></TableCell>
                <TableCell>{details.cpu_voltage}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Număr procese active</b></TableCell>
                <TableCell>{details.active_processes}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell><b>Memorie RAM Utilizată (MB)</b></TableCell>
                <TableCell>{details.ram_used}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Memorie RAM liberă (MB)</b></TableCell>
                <TableCell>{details.ram_free}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Swap utilizare (MB)</b></TableCell>
                <TableCell>{details.swap_used}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell><b>Stocare folosită (GB)</b></TableCell>
                <TableCell>{details.storage_used}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Sănătatea unității (S.M.A.R.T.)</b></TableCell>
                <TableCell>{details.smart_status}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Temperatura stocării (°C)</b></TableCell>
                <TableCell>{details.storage_temp}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Rată citire/scriere (MB/s)</b></TableCell>
                <TableCell>{details.read_write_rate}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell><b>Viteză upload (Mbps)</b></TableCell>
                <TableCell>{details.net_upload}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Viteză download (Mbps)</b></TableCell>
                <TableCell>{details.net_download}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Adresă IP internă</b></TableCell>
                <TableCell>{details.ip_internal}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Adresă IP externă</b></TableCell>
                <TableCell>{details.ip_external}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Utilizare totală rețea (MB)</b></TableCell>
                <TableCell>{details.net_total_usage}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Pachete trimise</b></TableCell>
                <TableCell>{details.net_packets_sent}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Pachete primite</b></TableCell>
                <TableCell>{details.net_packets_received}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell><b>Nivel baterie (%)</b></TableCell>
                <TableCell>{details.battery_level}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><b>Stare încărcare</b></TableCell>
                <TableCell>{details.battery_status}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>
          {machines.length === 0 ? 'Nu există date pentru afișare.' : 'Se încarcă detaliile...'}
        </Typography>
      )}
    </Box>
  );
}
