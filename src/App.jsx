import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  TextField,
  Select,
  MenuItem
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Login from './login';
import Problems from './problems';
import HostDetail from './hostdetail';
import { auth, db } from './firebaseconfig';
import HardwareCharts from "./hardwarecharts"; 
import Register from './register';
import PerformanceOverview from './performanceoverview';





const THRESHOLD = 80;

const getColor = (value) => {
  if (value < 50) return '#4caf50';
  if (value < THRESHOLD) return '#ff9800';
  return '#f44336';
};

function HardwareTable({ data, filter, setFilter, sortKey, setSortKey, sortOrder, setSortOrder }) {
  const filteredData = useMemo(() => {
    let filtered = data.filter(item => item.machine_id.toLowerCase().includes(filter.toLowerCase()));
    filtered.sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortKey] > b[sortKey]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [data, filter, sortKey, sortOrder]);

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Filter by Machine ID"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Select value={sortKey} onChange={e => setSortKey(e.target.value)} size="small">
          <MenuItem value="machine_id">Machine ID</MenuItem>
          <MenuItem value="cpu">CPU</MenuItem>
          <MenuItem value="ram">RAM</MenuItem>
          <MenuItem value="hdd">HDD</MenuItem>
        </Select>
        <Select value={sortOrder} onChange={e => setSortOrder(e.target.value)} size="small">
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </Select>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Machine ID</TableCell>
              {['cpu', 'ram', 'hdd'].map(res => (
                <TableCell key={res} align="center">{res.toUpperCase()}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map(({ machine_id, cpu, ram, hdd }) => {
              const renderCell = (val) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ color: getColor(val), fontWeight: 'bold' }}>{val}%</Typography>
                    {val > THRESHOLD && <WarningIcon color="error" titleAccess="Resource usage high!" />}
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={val}
                    sx={{
                      width: 100,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#eee',
                      '& .MuiLinearProgress-bar': { backgroundColor: getColor(val) }
                    }}
                  />
                </Box>
              );
              return (
                <TableRow key={machine_id} hover>
                  <TableCell>{machine_id}</TableCell>
                  <TableCell align="center">{renderCell(cpu)}</TableCell>
                  <TableCell align="center">{renderCell(ram)}</TableCell>
                  <TableCell align="center">{renderCell(hdd)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}



export default function App() {
  const [hardwareData, setHardwareData] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortKey, setSortKey] = useState('machine_id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');
  const alertedMachines = useRef(new Set());

  const visibleData = useMemo(() => {
    if (!user) return [];
    return user.role === 'admin' ? hardwareData : hardwareData.filter(d => d.machine_id === user.machine_id);
  }, [user, hardwareData]);

  const visibleProblems = useMemo(() => {
    if (!user) return [];
    const problems = hardwareData.filter(d => d.cpu > THRESHOLD || d.ram > THRESHOLD || d.hdd > THRESHOLD);
    return user.role === 'admin' ? problems : problems.filter(d => d.machine_id === user.machine_id);
  }, [user, hardwareData]);

  const [clientHistory, setClientHistory] = useState([]);
  

  useEffect(() => {
    fetch('https://hardware-backend-1045498097455.europe-central2.run.app/api/hardware')
      .then(res => res.json())
      .then(data => {
        setHardwareData(data); 

        if (user && user.role === 'client') {
        const clientData = data.find(d => d.machine_id === user.machine_id);
              if (clientData) {
                   setClientHistory(prev => [...prev.slice(-19), clientData]); // max 20 puncte
                   }
        }

        data.forEach(({ machine_id, cpu, ram, hdd }) => {
          if ((cpu > THRESHOLD || ram > THRESHOLD || hdd > THRESHOLD) && !alertedMachines.current.has(machine_id)) {
            alertedMachines.current.add(machine_id);
            window.alert(`Machine ${machine_id} has high usage!`);
            if (Notification.permission === 'granted') {
              new Notification(`⚠️ ${machine_id}`, {
                body: `CPU/RAM/HDD above threshold!`,
              });
            }
          }
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const renderPage = () => {
    if (page === 'login') {
      return (
        <Login
          user={user}
          onLogin={(info) => {
            setUser(info);
            setPage('home');
          }}
          onLogout={() => {
            setUser(null);
            setPage('login');
          }}
        />
      );
    }

    if (page === 'register') {
    return (
      <Register
        onRegisterSuccess={(info) => {
          setUser(info);
          setPage('home');
        }}
        onSwitchToLogin={() => setPage('login')}
      />
    );
  }

    if (!user) {
      
      setPage('login');
      return null;
    }
    if (page === 'home') {
      return (
        <>
          <HardwareTable
            data={visibleData}
            filter={filter}
            setFilter={setFilter}
            sortKey={sortKey}
            setSortKey={setSortKey}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
          {user.role === 'client' && (
        <HardwareCharts data={visibleData} />
      )}
        </>
      );
    }
    if (page === 'problems') {
      return <Problems data={visibleProblems} />;
    }
    if (page === 'hostDetail') {
      return <HostDetail user={user} />;
    }
    if (page === 'performance') {
      return <PerformanceOverview data={visibleData} user={user} />;
    }

    return <Typography>Page not found</Typography>;
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ cursor: 'pointer' }} onClick={() => setPage('home')}>
            Hardware Monitor
          </Typography>
          <Box>
            {user ? (
              <>
                <Button
                  color={page === 'home' ? "secondary" : "inherit"}
                  onClick={() => setPage('home')}
                >
                  Home
                </Button>
                <Button
                  color={page === 'problems' ? "secondary" : "inherit"}
                  onClick={() => setPage('problems')}
                >
                  Problems
                </Button>
                <Button
                  color={page === 'hostDetail' ? "secondary" : "inherit"}
                  onClick={() => setPage('hostDetail')}
                >
                  Host Detail
                </Button>
                <Button
                  color={page === 'performance' ? "secondary" : "inherit"}
                  onClick={() => setPage('performance')}
                >
                 Performance Overview
                </Button>

                <Button
                  color="inherit"
                  onClick={() => {
                    auth.signOut();
                    setUser(null);
                    setPage('login');
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <><Button
                  color={page === 'login' ? "secondary" : "inherit"}
                  onClick={() => setPage('login')}
                >
                  Login
                </Button><Button
                  color={page === 'register' ? "secondary" : "inherit"}
                  onClick={() => setPage('register')}
                >
                    Register
                  </Button></>

            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Toolbar />
      <Container sx={{ mt: 3, mb: 5 }}>
        {renderPage()}
      </Container>
    </>
  );
}
