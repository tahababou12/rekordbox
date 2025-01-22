import styled from 'styled-components';

export const DeckContainer = styled.div`
  background-color: #333;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const ControlsSection = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: #2a2a2a;
  border-radius: 5px;
`;

export const FileInput = styled.input`
  display: none;
`;

export const UploadButton = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin-bottom: 10px;
  width: 100%;
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover {
    background-color: #45a049;
    opacity: ${props => props.disabled ? 0.6 : 0.9};
  }
`;

export const PlayButton = styled.button`
  background-color: ${props => props.isPlaying ? '#ff4444' : '#4CAF50'};
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin: 10px 0;
  width: 100%;
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover {
    background-color: ${props => props.isPlaying ? '#ff3333' : '#45a049'};
    opacity: ${props => props.disabled ? 0.6 : 0.9};
  }
`;

export const VolumeContainer = styled.div`
  margin: 15px 0;
`;

export const VolumeSlider = styled.input`
  width: 100%;
  margin: 10px 0;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: ${props => props.disabled ? '#444' : '#666'};
  outline: none;
  border-radius: 2px;
  opacity: ${props => props.disabled ? 0.6 : 0.7};
  transition: opacity 0.2s;

  &:hover {
    opacity: ${props => props.disabled ? 0.6 : 1};
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: ${props => props.disabled ? '#666' : '#00ccff'};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: ${props => props.disabled ? '#666' : '#00ccff'};
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    border-radius: 50%;
    border: none;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  }
`;

export const TrackName = styled.div`
  text-align: center;
  margin: 10px 0;
  font-size: 0.9em;
  color: #ddd;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 10px;
`;

export const DeckHeader = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.5em;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export const ErrorMessage = styled.div`
  color: #ff4444;
  text-align: center;
  margin: 10px 0;
  font-size: 0.9em;
  padding: 10px;
  background-color: rgba(255, 68, 68, 0.1);
  border-radius: 4px;
`;

export const ControlLabel = styled.div`
  color: #888;
  font-size: 0.8em;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const ControlGroup = styled.div`
  margin: 15px 0;
`;

export const TimeDisplay = styled.div`
  text-align: center;
  color: #00ccff;
  font-family: monospace;
  font-size: 0.9em;
  margin: 5px 0;
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-radius: 10px;
`;
