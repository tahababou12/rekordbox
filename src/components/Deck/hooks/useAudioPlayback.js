import { useState, useEffect, useCallback, useRef } from 'react';
import { createAudioGraph, cleanupAudioNodes, detectBPM } from '../audioUtils';

export const useAudioPlayback = (audioContext) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bpm, setBpm] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [error, setError] = useState('');

  const audioBufferRef = useRef(null);
  const sourceRef = useRef(null);
  const gainNodeRef = useRef(null);
  const startTimeRef = useRef(0);
  const eqNodesRef = useRef({
    low: null,
    mid: null,
    high: null
  });

  const handleFileUpload = async (file) => {
    if (file) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        cleanupAudioNodes(sourceRef, gainNodeRef, eqNodesRef);
        
        audioBufferRef.current = decodedBuffer;
        setDuration(decodedBuffer.duration);
        setCurrentTime(0);
        setIsPlaying(false);
        
        const detectedBpm = await detectBPM(decodedBuffer);
        setBpm(detectedBpm);
        setPlaybackRate(1);
        setError('');
        
        return true;
      } catch (error) {
        setError('Error loading audio file');
        console.error('Error loading audio file:', error);
        return false;
      }
    }
    return false;
  };

  const handleBPMChange = useCallback((newBpm, masterTempoEnabled) => {
    if (!bpm || !audioBufferRef.current) return;
    
    const rate = newBpm / bpm;
    setPlaybackRate(rate);
    
    if (sourceRef.current) {
      sourceRef.current.playbackRate.value = rate;
      
      if (masterTempoEnabled) {
        if (!sourceRef.current.detune) {
          console.warn('Detune not supported in this browser');
          return;
        }
        const cents = -1200 * Math.log2(rate);
        sourceRef.current.detune.value = cents;
      } else {
        if (sourceRef.current.detune) {
          sourceRef.current.detune.value = 0;
        }
      }
    }
  }, [bpm]);

  const handleSeek = useCallback((seekTime) => {
    if (!audioBufferRef.current) return;

    if (isPlaying) {
      sourceRef.current.stop();
    }

    setCurrentTime(seekTime);
    
    if (isPlaying) {
      sourceRef.current = createAudioGraph(audioContext, audioBufferRef.current, playbackRate, gainNodeRef, eqNodesRef);
      startTimeRef.current = audioContext.currentTime - seekTime;
      sourceRef.current.start(0, seekTime);
    }
  }, [audioContext, isPlaying, playbackRate]);

  const togglePlayback = useCallback(() => {
    if (!audioBufferRef.current) return;

    if (!isPlaying) {
      sourceRef.current = createAudioGraph(audioContext, audioBufferRef.current, playbackRate, gainNodeRef, eqNodesRef);
      startTimeRef.current = audioContext.currentTime - currentTime;
      sourceRef.current.start(0, currentTime);
      setIsPlaying(true);
    } else {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
      setIsPlaying(false);
    }
  }, [audioContext, isPlaying, currentTime, playbackRate]);

  const handleVolumeChange = useCallback((value) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = value;
    }
  }, []);

  useEffect(() => {
    let animationFrame;
    
    const updateTime = () => {
      if (isPlaying) {
        setCurrentTime(audioContext.currentTime - startTimeRef.current);
        animationFrame = requestAnimationFrame(updateTime);
      }
    };

    if (isPlaying) {
      animationFrame = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, audioContext]);

  useEffect(() => {
    return () => {
      cleanupAudioNodes(sourceRef, gainNodeRef, eqNodesRef);
    };
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    bpm,
    playbackRate,
    error,
    audioBufferRef,
    eqNodesRef,
    handleFileUpload,
    handleBPMChange,
    handleSeek,
    togglePlayback,
    handleVolumeChange
  };
};
