import React from 'react';
import styled from 'styled-components';

const EQContainer = styled.div`
  margin-top: 20px;
  background: #2a2a2a;
  padding: 15px;
  border-radius: 5px;
`;

const EQKnob = styled.input`
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
    background: ${props => props.color || '#00ccff'};
    cursor: pointer;
    border-radius: 50%;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: ${props => props.color || '#00ccff'};
    cursor: pointer;
    border-radius: 50%;
    border: none;
  }
`;

const EQLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  color: ${props => props.color || '#fff'};
  font-weight: bold;
`;

const EQBand = styled.div`
  margin-bottom: 15px;
`;

function EQControls({ eqNodes }) {
  const handleEQChange = (filter, value) => {
    if (filter) {
      filter.gain.value = value;
    }
  };

  return (
    <EQContainer>
      <EQBand>
        <EQLabel color="#ff3366">HIGH</EQLabel>
        <EQKnob
          type="range"
          min="-12"
          max="12"
          step="0.1"
          defaultValue="0"
          color="#ff3366"
          onChange={(e) => handleEQChange(eqNodes?.high, e.target.value)}
        />
      </EQBand>
      <EQBand>
        <EQLabel color="#00ff00">MID</EQLabel>
        <EQKnob
          type="range"
          min="-12"
          max="12"
          step="0.1"
          defaultValue="0"
          color="#00ff00"
          onChange={(e) => handleEQChange(eqNodes?.mid, e.target.value)}
        />
      </EQBand>
      <EQBand>
        <EQLabel color="#00ccff">LOW</EQLabel>
        <EQKnob
          type="range"
          min="-12"
          max="12"
          step="0.1"
          defaultValue="0"
          color="#00ccff"
          onChange={(e) => handleEQChange(eqNodes?.low, e.target.value)}
        />
      </EQBand>
    </EQContainer>
  );
}

export default EQControls;
