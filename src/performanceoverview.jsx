import React, { useEffect, useState } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { ENDPOINTS } from './config';


const AnimatedBox = motion(Box);

export default function PerformanceOverview({ user }) {
  const [data, setData] = useState([]);

  const isAdmin = user.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
           isAdmin
            ? ENDPOINTS.HARDWARE_DETAILS
           : `${ENDPOINTS.HARDWARE_DETAILS}/${user.machine_id}`
          );
        const json = await res.json();
        setData(isAdmin ? json : [json]);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, [user]);

  const getColor = (cpu) => {
    if (cpu < 40) return '#4caf50'; // Verde
    if (cpu < 80) return '#ff9800'; // Portocaliu
    return '#f44336';               // Roșu
  };

  if (!data || data.length === 0) {
    const placeholderCount = isAdmin ? 6 : 1;

    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Performance Overview
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              animation="wave"
              width={isAdmin ? 120 : 160}
              height={isAdmin ? 120 : 160}
              sx={{
                borderRadius: 3,
                ml: isAdmin && i % 2 === 1 ? 4 : 0,
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Performance Overview
      </Typography>

      {isAdmin ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {data.map(({ machine_id, cpu }, index) => (
            <AnimatedBox
              key={machine_id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              sx={{
                width: 120,
                height: 120,
                backgroundColor: getColor(cpu),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: 4,
                color: '#fff',
                fontWeight: 'bold',
                textAlign: 'center',
                ml: index % 2 === 1 ? 4 : 0,
              }}
            >
              <Typography variant="body2">{machine_id}</Typography>
              <Typography variant="h6">{cpu}%</Typography>
            </AnimatedBox>
          ))}
        </Box>
      ) : (
        <AnimatedBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          sx={{
            width: 160,
            height: 160,
            backgroundColor: getColor(data[0].cpu),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: 5,
            color: '#fff',
            fontWeight: 'bold',
            textAlign: 'center',
            mx: 'auto',
          }}
        >
          <Typography variant="body1">{user.machine_id}</Typography>
          <Typography variant="h5">{data[0].cpu}% CPU</Typography>
        </AnimatedBox>
      )}
    </Box>
  );
}
