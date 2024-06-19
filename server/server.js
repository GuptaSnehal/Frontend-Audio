const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const audioFolderPath = path.join(__dirname, 'audio');

// Serve static files from the 'audio' folder
app.use('/api/audio', express.static(audioFolderPath));

// Endpoint to get the list of available audio files
app.get('/api/audio', (req, res) => {
  fs.readdir(audioFolderPath, (err, files) => {
    if (err) {
      console.error('Error reading audio directory:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      const audioFiles = files.filter(file => file.endsWith('.wav'));
      console.log('Available audio files:', audioFiles);
      res.json(audioFiles);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
