import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const DiscContainer = styled.div`
  width: 200px;
  height: 200px;
  margin: 0 auto 20px;
  position: relative;
`;

const Disc = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    #000 0%,
    #000 47%,
    transparent 47.5%,
    transparent 52.5%,
    #000 53%,
    #000 100%
  );
  position: relative;
  animation: ${spin} 2s linear infinite;
  animation-play-state: ${props => props.isPlaying ? 'running' : 'paused'};

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 15px;
    height: 15px;
    background: #888;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: repeating-radial-gradient(
      circle at center,
      #333 0px,
      #333 1px,
      transparent 1px,
      transparent 3px
    );
  }
`;

const Label = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 8px;
  padding: 5px;
  word-break: break-word;
  z-index: 1;
`;

function VinylDisc({ isPlaying, trackName }) {
  return (
    <DiscContainer>
      <Disc isPlaying={isPlaying}>
        <Label>{trackName}</Label>
      </Disc>
    </DiscContainer>
  );
}

export default VinylDisc;
