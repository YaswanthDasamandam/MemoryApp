import { useState } from 'react'
import './App.css'
import React from 'react'

const STAGES = [
  { id: 1, name: 'Stage 1: Single Digit ↔ Sound' },
  { id: 2, name: 'Stage 2: Two Digits ↔ Word' },
];

function App() {
  const [screen, setScreen] = useState('home');
  const [stage, setStage] = useState(null);

  function handleStageSelect(stageId) {
    setStage(stageId);
    setScreen('practice');
  }

  function handleBack() {
    setScreen('home');
    setStage(null);
  }

  return (
    <div className="app-container">
      {screen === 'home' && (
        <>
          <h1>Memory Practice App</h1>
          <h2>Select Practice Stage</h2>
          <ul>
            {STAGES.map((s) => (
              <li key={s.id}>
                <button onClick={() => handleStageSelect(s.id)}>{s.name}</button>
              </li>
            ))}
          </ul>
          <button onClick={() => setScreen('progress')}>View Progress</button>
        </>
      )}
      {screen === 'practice' && (
        <PracticeStage stage={stage} onBack={handleBack} />
      )}
      {screen === 'progress' && (
        <ProgressPage onBack={handleBack} />
      )}
    </div>
  );
}

function PracticeStage({ stage, onBack }) {
  if (stage === 1) {
    return <Stage1Practice onBack={onBack} />;
  }
  // Stage 2 placeholder
  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h2>Practice: Two Digits ↔ Word</h2>
      <p>Coming soon!</p>
    </div>
  );
}

const MAJOR_SYSTEM = [
  { digit: 0, sounds: ['S', 'Z'] },
  { digit: 1, sounds: ['T', 'D'] },
  { digit: 2, sounds: ['N'] },
  { digit: 3, sounds: ['M'] },
  { digit: 4, sounds: ['R'] },
  { digit: 5, sounds: ['L'] },
  { digit: 6, sounds: ['J', 'SH', 'CH', 'G (soft)'] },
  { digit: 7, sounds: ['K', 'G (hard)', 'C (hard)'] },
  { digit: 8, sounds: ['F', 'V'] },
  { digit: 9, sounds: ['P', 'B'] },
];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function Stage1Practice({ onBack }) {
  const [mode, setMode] = useState('digit-to-sound'); // or 'sound-to-digit'
  const [question, setQuestion] = useState(generateQuestion('digit-to-sound'));
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const inputRef = React.useRef(null);

  function generateQuestion(mode) {
    if (mode === 'digit-to-sound') {
      const idx = getRandomInt(10);
      return { digit: MAJOR_SYSTEM[idx].digit, sounds: MAJOR_SYSTEM[idx].sounds };
    } else {
      const idx = getRandomInt(10);
      const sound = MAJOR_SYSTEM[idx].sounds[getRandomInt(MAJOR_SYSTEM[idx].sounds.length)];
      return { digit: MAJOR_SYSTEM[idx].digit, sound };
    }
  }

  function handleModeChange(newMode) {
    setMode(newMode);
    setQuestion(generateQuestion(newMode));
    setUserAnswer('');
    setFeedback('');
    if (inputRef.current) inputRef.current.focus();
  }

  function validateAnswer(answer) {
    let isCorrect = false;
    let correctDisplay = '';
    if (mode === 'digit-to-sound') {
      isCorrect = question.sounds.some(
        s => s[0].toLowerCase() === answer.trim().toLowerCase()
      );
      correctDisplay = `Correct answers: ${question.sounds.map(s => s[0].toUpperCase() + s.slice(1)).join(', ')}`;
    } else {
      isCorrect = String(question.digit) === answer.trim();
      correctDisplay = `Correct answer: ${question.digit}`;
    }
    setFeedback((isCorrect ? '✅ Correct! ' : '❌ Incorrect. ') + correctDisplay);
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    setTimeout(() => {
      setQuestion(generateQuestion(mode));
      setUserAnswer('');
      setFeedback('');
      if (inputRef.current) inputRef.current.focus();
    }, 1200);
  }

  function handleInputChange(e) {
    const value = e.target.value;
    setUserAnswer(value);
    if (value.length === 1) {
      validateAnswer(value);
    }
  }

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h2>Stage 1: Single Digit ↔ Sound</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => handleModeChange('digit-to-sound')} disabled={mode === 'digit-to-sound'}>
          Digit → Sound
        </button>
        <button onClick={() => handleModeChange('sound-to-digit')} disabled={mode === 'sound-to-digit'} style={{ marginLeft: 8 }}>
          Sound → Digit
        </button>
      </div>
      <div style={{ marginBottom: 12 }}>
        <b>Score:</b> {score.correct} / {score.total}
      </div>
      <form onSubmit={e => e.preventDefault()}>
        {mode === 'digit-to-sound' ? (
          <div>
            <div>Digit: <b style={{ fontSize: 24 }}>{question.digit}</b></div>
            <input
              type="text"
              placeholder="Enter first letter (e.g. S, Z)"
              value={userAnswer}
              onChange={handleInputChange}
              maxLength={1}
              ref={inputRef}
              autoFocus
            />
          </div>
        ) : (
          <div>
            <div>Sound: <b style={{ fontSize: 24 }}>{question.sound}</b></div>
            <input
              type="text"
              placeholder="Enter digit (0-9)"
              value={userAnswer}
              onChange={handleInputChange}
              maxLength={1}
              ref={inputRef}
              autoFocus
            />
          </div>
        )}
      </form>
      {feedback && <div style={{ marginTop: 10, fontWeight: 'bold' }}>{feedback}</div>}
    </div>
  );
}

function ProgressPage({ onBack }) {
  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h2>Your Progress</h2>
      <p>Progress tracking coming soon!</p>
    </div>
  );
}

export default App
