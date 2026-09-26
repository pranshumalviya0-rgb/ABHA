const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const abhaRoutes = require('./routes/abha.routes');
const emergencyRoutes = require('./routes/emergency.routes');
const patientRoutes = require('./routes/patient.routes');
const facilityRoutes = require('./routes/facility.routes');
const dischargeRoutes = require('./routes/discharge.routes');
const auditRoutes = require('./routes/audit.routes');

const app = express();

// Standard Middlewares
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base /api check
app.get('/api', (req, res) => {
  res.json({ message: 'Golden Hour API Server Active' });
});

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/abha', abhaRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/facility', facilityRoutes);
app.use('/api/discharge', dischargeRoutes);
app.use('/api/audit', auditRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
