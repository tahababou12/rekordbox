import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';

const WaveformContainer = styled.div`
  position: relative;
  width: 100%;
  margin: 20px 0;
  user-select: none;
`;

const WaveformWrapper = styled.div`
  position: relative;
  height: 180px;
  background: #1a1a1a;
  border-radius: 5px;
  overflow: hidden;
`;

const OverviewWaveform = styled.canvas`
  width: 100%;
  height: 40px;
  background: #000;
  cursor: pointer;
  margin-top: 10px;
`;

const DetailedWaveform = styled.canvas`
  width: 100%;
  height: 120px;
  background: #111;
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
`;

const FrequencyDisplay = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 120px;
  pointer-events: none;
`;

const Playhead = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  background-color: #fff;
  pointer-events: none;
`;

const TimeDisplay = styled.div`
  position: absolute;
  right: 10px;
  top: 5px;
  font-size: 12px;
  color: #fff;
  font-family: monospace;
  z-index: 2;
`;

const ZoomControls = styled.div`
  position: absolute;
  left: 10px;
  top: 5px;
  display: flex;
  gap: 5px;
  z-index: 2;
`;

const ZoomButton = styled.button`
  background: #333;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 2px 8px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #444;
  }
`;

function Waveform({ audioBuffer, isPlaying, currentTime, onSeek, duration }) {
  const overviewCanvasRef = useRef(null);
  const detailedCanvasRef = useRef(null);
  const frequencyCanvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewportOffset, setViewportOffset] = useState(0);
  const dragStartRef = useRef(null);
  const lastOffsetRef = useRef(0);
  const animationFrameRef = useRef(null);

  const analyzeFrequencies = useCallback((audioData, sampleRate, windowSize) => {
    const frequencies = {
      low: [],
      mid: [],
      high: []
    };
    
    const fft = new Float32Array(windowSize);
    const buffer = new Float32Array(windowSize);
    
    for (let i = 0; i < audioData.length; i += windowSize / 2) {
      buffer.fill(0);
      for (let j = 0; j < windowSize && (i + j) < audioData.length; j++) {
        const multiplier = 0.5 * (1 - Math.cos(2 * Math.PI * j / windowSize));
        buffer[j] = audioData[i + j] * multiplier;
      }
      
      const real = new Float32Array(buffer);
      const imag = new Float32Array(windowSize).fill(0);
      performFFT(real, imag);
      
      let lowBand = 0, midBand = 0, highBand = 0;
      
      for (let j = 0; j < windowSize / 2; j++) {
        const frequency = j * sampleRate / windowSize;
        const magnitude = Math.sqrt(real[j] * real[j] + imag[j] * imag[j]);
        
        if (frequency < 200) lowBand += magnitude;
        else if (frequency < 2000) midBand += magnitude;
        else highBand += magnitude;
      }
      
      frequencies.low.push(lowBand);
      frequencies.mid.push(midBand);
      frequencies.high.push(highBand);
    }
    
    return frequencies;
  }, []);

  const performFFT = (real, imag) => {
    const n = real.length;
    
    for (let i = 0; i < n; i++) {
      const j = reverseBits(i, Math.log2(n));
      if (j > i) {
        [real[i], real[j]] = [real[j], real[i]];
        [imag[i], imag[j]] = [imag[j], imag[i]];
      }
    }
    
    for (let size = 2; size <= n; size *= 2) {
      const halfsize = size / 2;
      const angle = -2 * Math.PI / size;
      
      for (let i = 0; i < n; i += size) {
        for (let j = 0; j < halfsize; j++) {
          const k = i + j;
          const l = k + halfsize;
          const tpre = real[l] * Math.cos(angle * j) - imag[l] * Math.sin(angle * j);
          const tpim = real[l] * Math.sin(angle * j) + imag[l] * Math.cos(angle * j);
          real[l] = real[k] - tpre;
          imag[l] = imag[k] - tpim;
          real[k] += tpre;
          imag[k] += tpim;
        }
      }
    }
  };

  const reverseBits = (x, bits) => {
    let y = 0;
    for (let i = 0; i < bits; i++) {
      y = (y << 1) | (x & 1);
      x >>= 1;
    }
    return y;
  };

  const drawWaveform = useCallback((canvas, data, frequencies, offset = 0, zoom = 1, isOverview = false) => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.fillStyle = isOverview ? '#000' : '#111';
    ctx.fillRect(0, 0, width, height);

    if (!isOverview) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      const gridSize = 50;
      
      for (let i = 0; i < width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      
      for (let i = 0; i < height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
    }

    const samplesPerPixel = Math.ceil((data.length / width) / zoom);
    const startSample = Math.floor(offset * data.length);

    if (!isOverview && frequencies) {
      const freqWidth = frequencies.low.length;
      const pixelsPerFreq = freqWidth / (data.length / samplesPerPixel);
      
      for (let i = 0; i < width; i++) {
        const freqIndex = Math.floor((startSample / samplesPerPixel + i) / pixelsPerFreq);
        if (freqIndex >= 0 && freqIndex < freqWidth) {
          const lowHeight = frequencies.low[freqIndex] * height * 0.5;
          ctx.fillStyle = `rgba(255, 0, 0, ${Math.min(0.5, frequencies.low[freqIndex])})`;
          ctx.fillRect(i, centerY - lowHeight / 2, 1, lowHeight);

          const midHeight = frequencies.mid[freqIndex] * height * 0.3;
          ctx.fillStyle = `rgba(0, 255, 0, ${Math.min(0.5, frequencies.mid[freqIndex])})`;
          ctx.fillRect(i, centerY - midHeight / 2, 1, midHeight);

          const highHeight = frequencies.high[freqIndex] * height * 0.2;
          ctx.fillStyle = `rgba(0, 0, 255, ${Math.min(0.5, frequencies.high[freqIndex])})`;
          ctx.fillRect(i, centerY - highHeight / 2, 1, highHeight);
        }
      }
    }

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      const startIdx = startSample + (i * samplesPerPixel);
      
      for (let j = 0; j < samplesPerPixel && (startIdx + j) < data.length; j++) {
        const datum = data[startIdx + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      if (isOverview) {
        gradient.addColorStop(0, '#ff3366');
        gradient.addColorStop(0.5, '#00ccff');
        gradient.addColorStop(1, '#ff3366');
      } else {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = isOverview ? 1 : 2;

      const amp = isOverview ? height / 2 : height / 3;
      
      if (isOverview) {
        ctx.beginPath();
        ctx.moveTo(i, centerY + min * amp);
        ctx.lineTo(i, centerY + max * amp);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(i, centerY + min * amp);
        ctx.lineTo(i, centerY + max * amp);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(i, centerY - min * amp);
        ctx.lineTo(i, centerY - max * amp);
        ctx.stroke();
      }
    }
  }, []);

  useEffect(() => {
    if (!audioBuffer) return;

    const data = audioBuffer.getChannelData(0);
    const frequencies = analyzeFrequencies(data, audioBuffer.sampleRate, 2048);

    const animate = () => {
      drawWaveform(overviewCanvasRef.current, data, frequencies, 0, 1, true);
      drawWaveform(detailedCanvasRef.current, data, frequencies, viewportOffset, zoomLevel, false);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioBuffer, viewportOffset, zoomLevel, analyzeFrequencies, drawWaveform]);

  useEffect(() => {
    if (!audioBuffer || !isPlaying) return;

    const newOffset = (currentTime / duration) - 0.5 / zoomLevel;
    setViewportOffset(Math.max(0, Math.min(newOffset, 1 - 1 / zoomLevel)));
  }, [currentTime, duration, zoomLevel, audioBuffer, isPlaying]);

  const handleDetailedClick = (e) => {
    if (!audioBuffer || isDragging) return;
    
    const rect = detailedCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const seekTime = duration * (viewportOffset + percentage / zoomLevel);
    onSeek(Math.min(seekTime, duration));
  };

  const handleOverviewClick = (e) => {
    if (!audioBuffer) return;

    const rect = overviewCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    onSeek(percentage * duration);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = e.clientX;
    lastOffsetRef.current = viewportOffset;
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragStartRef.current) return;

    const rect = detailedCanvasRef.current.getBoundingClientRect();
    const deltaX = (dragStartRef.current - e.clientX) / rect.width;
    const newOffset = lastOffsetRef.current + deltaX / zoomLevel;
    const clampedOffset = Math.max(0, Math.min(newOffset, 1 - 1 / zoomLevel));
    
    setViewportOffset(clampedOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const handleZoom = (direction) => {
    const newZoom = direction === 'in' ? 
      Math.min(zoomLevel * 1.5, 8) : 
      Math.max(zoomLevel / 1.5, 1);
    setZoomLevel(newZoom);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <WaveformContainer>
      <WaveformWrapper>
        <ZoomControls>
          <ZoomButton onClick={() => handleZoom('in')}>+</ZoomButton>
          <ZoomButton onClick={() => handleZoom('out')}>-</ZoomButton>
        </ZoomControls>
        <TimeDisplay>
          {formatTime(currentTime)} / {formatTime(duration)}
        </TimeDisplay>
        <DetailedWaveform
          ref={detailedCanvasRef}
          onClick={handleDetailedClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          isDragging={isDragging}
        />
        <FrequencyDisplay ref={frequencyCanvasRef} />
        <OverviewWaveform 
          ref={overviewCanvasRef}
          onClick={handleOverviewClick}
        />
        <Playhead />
      </WaveformWrapper>
    </WaveformContainer>
  );
}

export default Waveform;
