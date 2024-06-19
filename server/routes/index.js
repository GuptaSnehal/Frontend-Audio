const express = require('express');
const router = express.Router();
const audioRoutes = require('./audioRoutes');

router.use('/audio', audioRoutes);

module.exports = router;
