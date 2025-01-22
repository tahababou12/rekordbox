import React, { useState } from 'react';
import styled from 'styled-components';
import Deck from './components/Deck/index';
import Mixer from './components/Mixer';

const AppContainer = styled.div`
  background-color: #2a2a2a;
  min-height: 100vh;
  padding: 20px;
  color: white;
`;

const DeckContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
`;

function App() {
  const [audioContexts] = useState({
    left: new AudioContext(),
    right: new AudioContext()
  });

  return (
    <AppContainer>
      <DeckContainer>
        <Deck side="left" audioContext={audioContexts.left} />
        <Mixer />
        <Deck side="right" audioContext={audioContexts.right} />
      </DeckContainer>
    </AppContainer>
  );
}

export default App;
