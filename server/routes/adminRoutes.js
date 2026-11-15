const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getDashboardStats,
  getAllRegistrations,
  deleteRegistration,
  changeAdminPassword,
  exportRegistrationsCsv,
  getSettings,
  updateSettings,
} = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/auth');

// Public admin login
router.post('/login', adminLogin);

// Protected routes
router.get('/stats', protectAdmin, getDashboardStats);
router.get('/registrations', protectAdmin, getAllRegistrations);
router.delete('/registrations/:id', protectAdmin, deleteRegistration);
router.post('/change-password', protectAdmin, changeAdminPassword);
router.get('/export', protectAdmin, exportRegistrationsCsv);
router.get('/settings', protectAdmin, getSettings);
router.put('/settings', protectAdmin, updateSettings);

module.exports = router;
