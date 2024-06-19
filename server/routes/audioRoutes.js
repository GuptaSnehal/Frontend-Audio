const express = require('express');
const router = express.Router();
const path = require('path');

// Define a route to serve audio files
router.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'audio', filename);
  
  // Send the audio file as a response
  res.sendFile(filePath);
});

module.exports = router;
