import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const BPMContainer = styled.div`
  margin: 10px 0;
  padding: 15px;
  background: #2a2a2a;
  border-radius: 5px;
`;

const BPMSlider = styled.input`
  width: 100%;
  margin: 10px 0;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: #666;
  outline: none;
  border-radius: 2px;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #00ccff;
    cursor: pointer;
    border-radius: 50%;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #00ccff;
    cursor: pointer;
    border-radius: 50%;
    border: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BPMDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-family: monospace;
  margin-bottom: 10px;
`;

const BPMValue = styled.span`
  font-size: 1.2em;
  color: #00ccff;
`;

const BPMLabel = styled.span`
  color: #888;
`;

const MasterTempoButton = styled.button`
  background-color: ${props => props.active ? '#00ccff' : '#444'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 0.8em;
  margin-left: 10px;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.active ? '#00bbee' : '#555'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function BPMControl({ originalBpm, onBpmChange, isEnabled = true }) {
  const [currentBpm, setCurrentBpm] = useState(originalBpm);
  const [masterTempoEnabled, setMasterTempoEnabled] = useState(false);
  const minBpm = Math.max(originalBpm * 0.5, 40);
  const maxBpm = Math.min(originalBpm * 2, 200);

  useEffect(() => {
    setCurrentBpm(originalBpm);
  }, [originalBpm]);

  const handleBpmChange = (e) => {
    const newBpm = parseFloat(e.target.value);
    setCurrentBpm(newBpm);
    onBpmChange(newBpm, masterTempoEnabled);
  };

  const toggleMasterTempo = () => {
    setMasterTempoEnabled(!masterTempoEnabled);
    // Reapply current BPM with new master tempo setting
    onBpmChange(currentBpm, !masterTempoEnabled);
  };

  return (
    <BPMContainer>
      <BPMDisplay>
        <BPMLabel>BPM:</BPMLabel>
        <div>
          <BPMValue>
            {currentBpm?.toFixed(2)} 
            {originalBpm ? ` (Original: ${originalBpm})` : ''}
          </BPMValue>
          <MasterTempoButton
            active={masterTempoEnabled}
            onClick={toggleMasterTempo}
            disabled={!isEnabled}
          >
            MT
          </MasterTempoButton>
        </div>
      </BPMDisplay>
      <BPMSlider
        type="range"
        min={minBpm || 40}
        max={maxBpm || 200}
        step="0.01"
        value={currentBpm || 0}
        onChange={handleBpmChange}
        disabled={!isEnabled}
      />
    </BPMContainer>
  );
}

export default BPMControl;
