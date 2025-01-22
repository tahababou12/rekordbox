import React from 'react';
import styled from 'styled-components';

const MixerContainer = styled.div`
  background-color: #333;
  padding: 20px;
  border-radius: 10px;
  width: 200px;
`;

const CrossFader = styled.input`
  width: 100%;
  margin: 20px 0;
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
    height: 40px;
    background: #00ccff;
    cursor: pointer;
    border-radius: 4px;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 40px;
    background: #00ccff;
    cursor: pointer;
    border-radius: 4px;
    border: none;
  }
`;

const Label = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
`;

function Mixer() {
  return (
    <MixerContainer>
      <Label>Mixer</Label>
      <CrossFader
        type="range"
        min="-1"
        max="1"
        step="0.01"
        defaultValue="0"
      />
    </MixerContainer>
  );
}

export default Mixer;
