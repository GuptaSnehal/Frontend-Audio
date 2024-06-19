import React, { useState, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Spectrogram from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';
import axios from 'axios';
import './App.css';

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [waveSurfer, setWaveSurfer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFiles, setAudioFiles] = useState([]);

  useEffect(() => {
    if (audioFile && !waveSurfer) {
      const waveSurferInstance = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#FFF', // Light color for waveform
        progressColor: '#E0E0E0', // Light color for progress
        cursorColor: '#2099cc',
        barWidth: 3,
        barHeight: 1,
        responsive: true,
        height: 100
      });
      setWaveSurfer(waveSurferInstance);
      waveSurferInstance.loadBlob(audioFile);

      waveSurferInstance.registerPlugin(
        Spectrogram.create({
          labels: true,
          height: 200,
          splitChannels: true,
          colorMap: generateColorMap(),
        }),
      );
    }
  }, [audioFile, waveSurfer]);

  // Function to generate the color map
  // Function to generate the color map
const generateColorMap = () => {
  const colorMap = [];
  const lightBluePurplePalette = [
    '#AED6F1', '#85C1E9', '#5DADE2', '#3498DB', '#2E86C1', '#2874A6',
    '#21618C', '#1B4F72', '#154360', '#0D2E50', '#78281F', '#512E5F'
  ];

  for (let i = 0; i < 256; i++) {
    const colorIndex = Math.floor(i / 256 * (lightBluePurplePalette.length - 1));
    const color = hexToRgb(lightBluePurplePalette[colorIndex]);
    colorMap.push(color);
  }

  return colorMap;
};

// Function to convert hex color to RGB
const hexToRgb = (hex) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
    1
  ] : null;
};

// Function to generate the color map



  const handleFileChange = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
      setIsPlaying(false);
    }
  };

  const handlePlay = () => {
    if (waveSurfer) {
      waveSurfer.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const handlePlayWaveform = (audioFileName , waveSurferInstance) => {
    // Find the WaveSurfer instance corresponding to the audio file name
    const containerId = `waveform-${audioFileName}`;
   // const waveSurferInstance = WaveSurfer.instances.find(instance => instance.container.id === containerId);
  
    if (waveSurferInstance) {
      // Play the WaveSurfer instance
      waveSurferInstance.playPause();
      
    }
  };
  

  const handleAnalyzeClick = async (event) => {
    try {
      const response = await axios.get('http://localhost:5000/api/audio');
      setAudioFiles(response.data);
      event.preventDefault();
      response.data.forEach((audioFileName) => {
        const containerId = `waveformee`;
        let containerElement = document.getElementById(containerId);
        if (!containerElement) {
          containerElement = document.createElement('div');
          containerElement.id = containerId;
          containerElement.className = 'waveform'; // Add class for waveform container
          document.body.appendChild(containerElement);
        }
  
        const waveSurferInstance = WaveSurfer.create({
          container: containerElement,
          waveColor: '#FFF', // Light color for waveform
          progressColor: '#E0E0E0', // Light color for progress
          cursorColor: '#2099cc',
          barWidth: 3,
          barHeight: 1,
          responsive: true,
          height: 100
        });
  
        waveSurferInstance.load(`http://localhost:5000/api/audio/${audioFileName}`);
  
        // Creating spectrogram container
        const spectrogramContainer = document.createElement('div');
        spectrogramContainer.className = 'spectrogram-container'; // Add class for spectrogram container
        containerElement.appendChild(spectrogramContainer);
  
        waveSurferInstance.registerPlugin(
          Spectrogram.create({
            container: spectrogramContainer, // Set spectrogram container
            labels: true,
            height: 200,
            splitChannels: true,
            colorMap: generateColorMap(),
            fequencyMax: 6
          }),
        );
  
        // Create a play button for each waveform
        const playButton = document.createElement('button');
        playButton.textContent = 'Play';
        playButton.className = 'play-button';
        playButton.addEventListener('click', () => {
          handlePlayWaveform(audioFileName, waveSurferInstance);
        });
        
        containerElement.appendChild(playButton);
      });
    } catch (error) {
      console.error('Error fetching audio files:', error);
    }
  };
  

  return (
    <div className="app-container">
      <h1 className="app-title">Audio Analyzer</h1>
      <div className="button-container">
        <div className="file-input-container">
          <label className="file-input-label">
            <input type="file" accept="audio/*" onChange={handleFileChange} />
            Choose Audio File
          </label>
        </div>
        <button className="analyze-button" onClick={handleAnalyzeClick}>Analyze</button>
      </div>
      <div className="audio-player">
        {audioFile && (
          <>
            <audio controls>
              <source src={URL.createObjectURL(audioFile)} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
            <button className="play-button" onClick={handlePlay}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </>
        )}
      </div>
      <div id="waveform" className="waveform"></div>
      {audioFiles.length > 0 && (
        <div className="audio-list">
          {audioFiles.map((fileName, index) => (
            <div key={index} className="audio-item">
              <audio controls>
                <source src={`http://localhost:5000/api/audio/${fileName}`} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
