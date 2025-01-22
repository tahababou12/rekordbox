import React, { useState, useRef } from 'react';
import EQControls from '../EQControls';
import Waveform from '../Waveform';
import VinylDisc from '../VinylDisc';
import BPMControl from '../BPMControl';
import { useAudioPlayback } from './hooks/useAudioPlayback';
import {
  DeckContainer,
  ControlsSection,
  FileInput,
  UploadButton,
  PlayButton,
  VolumeSlider,
  TrackName,
  DeckHeader,
  ErrorMessage,
  ControlLabel,
  VolumeContainer,
  ControlGroup,
  TimeDisplay,
  LoadingOverlay
} from './styles';

function Deck({ side, audioContext }) {
  const [trackName, setTrackName] = useState('No track loaded');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const {
    isPlaying,
    currentTime,
    duration,
    bpm,
    error,
    playbackRate,
    audioBufferRef,
    eqNodesRef,
    handleFileUpload: processAudioFile,
    handleBPMChange,
    handleSeek,
    togglePlayback,
    handleVolumeChange
  } = useAudioPlayback(audioContext);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setIsLoading(true);
        const success = await processAudioFile(file);
        if (success) {
          setTrackName(file.name);
        }
      } catch (error) {
        console.error('Error processing file:', error);
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <DeckContainer>
      <DeckHeader>Deck {side.toUpperCase()}</DeckHeader>
      
      <VinylDisc 
        isPlaying={isPlaying} 
        trackName={trackName}
        rotationSpeed={playbackRate}
      />
      
      <BPMControl 
        originalBpm={bpm} 
        onBpmChange={handleBPMChange}
        isEnabled={!!audioBufferRef.current}
      />
      
      <TimeDisplay>
        {formatTime(currentTime)} / {formatTime(duration)}
      </TimeDisplay>
      
      <Waveform 
        audioBuffer={audioBufferRef.current}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
      />
      
      <ControlsSection>
        <FileInput 
          ref={fileInputRef}
          type="file" 
          accept="audio/*" 
          id={`fileInput${side}`} 
          onChange={handleFileUpload}
        />
        
        <UploadButton 
          onClick={() => fileInputRef.current?.click()}
          disabled={isPlaying || isLoading}
        >
          {isLoading ? 'Loading...' : 'Upload Track'}
        </UploadButton>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <TrackName title={trackName}>
          {trackName}
        </TrackName>
        
        <ControlGroup>
          <PlayButton 
            isPlaying={isPlaying} 
            onClick={togglePlayback}
            disabled={!audioBufferRef.current || isLoading}
          >
            {isPlaying ? 'Stop' : 'Play'}
          </PlayButton>
        </ControlGroup>
        
        <VolumeContainer>
          <ControlLabel>Volume</ControlLabel>
          <VolumeSlider
            type="range"
            min="0"
            max="1"
            step="0.01"
            defaultValue="0.5"
            onChange={(e) => handleVolumeChange(e.target.value)}
            disabled={!audioBufferRef.current}
          />
        </VolumeContainer>
        
        <EQControls 
          eqNodes={eqNodesRef.current}
          isEnabled={!!audioBufferRef.current}
        />
      </ControlsSection>
      
      {isLoading && (
        <LoadingOverlay>
          Loading track...
        </LoadingOverlay>
      )}
    </DeckContainer>
  );
}

export default Deck;
