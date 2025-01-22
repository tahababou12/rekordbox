export const detectBPM = async (audioBuffer) => {
  // Convert audio buffer to mono and normalize
  const rawData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;

  // Parameters for BPM detection
  const timeStep = 0.01; // 10ms intervals
  const samples = Math.floor(timeStep * sampleRate);
  const energyThreshold = 0.8;
  const minBPM = 60;
  const maxBPM = 180;

  // Calculate energy over time
  const energies = [];
  for (let i = 0; i < rawData.length; i += samples) {
    let energy = 0;
    for (let j = 0; j < samples && (i + j) < rawData.length; j++) {
      energy += Math.abs(rawData[i + j]);
    }
    energies.push(energy / samples);
  }

  // Find peaks (beats)
  const peaks = [];
  const maxEnergy = Math.max(...energies);
  const threshold = maxEnergy * energyThreshold;

  for (let i = 2; i < energies.length - 2; i++) {
    if (energies[i] > threshold &&
        energies[i] > energies[i - 1] &&
        energies[i] > energies[i - 2] &&
        energies[i] > energies[i + 1] &&
        energies[i] > energies[i + 2]) {
      peaks.push(i * timeStep);
    }
  }

  // Calculate intervals between peaks
  const intervals = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }

  if (intervals.length === 0) {
    return 120; // Default to 120 BPM if no clear beats detected
  }

  // Calculate average interval
  const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  let bpm = Math.round(60 / averageInterval);

  // Adjust BPM to be within reasonable range
  while (bpm < minBPM) bpm *= 2;
  while (bpm > maxBPM) bpm /= 2;

  return bpm;
};

export const createAudioGraph = (audioContext, audioBuffer, playbackRate, gainNode, eqNodes) => {
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.playbackRate.value = playbackRate;

  // Enable preservesPitch for browsers that support it
  if ('preservesPitch' in source) {
    source.preservesPitch = true;
  }

  if (!gainNode.current) {
    gainNode.current = audioContext.createGain();
  }

  if (!eqNodes.current.low) {
    eqNodes.current.low = audioContext.createBiquadFilter();
    eqNodes.current.low.type = 'lowshelf';
    eqNodes.current.low.frequency.value = 320;
  }

  if (!eqNodes.current.mid) {
    eqNodes.current.mid = audioContext.createBiquadFilter();
    eqNodes.current.mid.type = 'peaking';
    eqNodes.current.mid.frequency.value = 1000;
    eqNodes.current.mid.Q.value = 0.5;
  }

  if (!eqNodes.current.high) {
    eqNodes.current.high = audioContext.createBiquadFilter();
    eqNodes.current.high.type = 'highshelf';
    eqNodes.current.high.frequency.value = 3200;
  }

  source.connect(eqNodes.current.low);
  eqNodes.current.low.connect(eqNodes.current.mid);
  eqNodes.current.mid.connect(eqNodes.current.high);
  eqNodes.current.high.connect(gainNode.current);
  gainNode.current.connect(audioContext.destination);

  return source;
};

export const cleanupAudioNodes = (sourceRef, gainNodeRef, eqNodesRef) => {
  if (sourceRef.current) {
    sourceRef.current.stop();
    sourceRef.current.disconnect();
    sourceRef.current = null;
  }

  if (gainNodeRef.current) {
    gainNodeRef.current.disconnect();
    gainNodeRef.current = null;
  }

  Object.values(eqNodesRef.current).forEach(node => {
    if (node) {
      node.disconnect();
    }
  });

  eqNodesRef.current = {
    low: null,
    mid: null,
    high: null
  };
};

// Export all functions as a single object as well
export default {
  detectBPM,
  createAudioGraph,
  cleanupAudioNodes
};
