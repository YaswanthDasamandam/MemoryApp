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
  const [stage2Screen, setStage2Screen] = useState('grid'); // 'grid' or 'edit'
  const [selectedNumber, setSelectedNumber] = useState(null);

  // Track stats in localStorage
  function getStats() {
    return JSON.parse(localStorage.getItem('memoryStats') || '{}');
  }
  function setStats(stats) {
    localStorage.setItem('memoryStats', JSON.stringify(stats));
  }

  // Stage 2 words in localStorage
  function getWords() {
    return JSON.parse(localStorage.getItem('stage2Words') || '{}');
  }
  function setWords(words) {
    localStorage.setItem('stage2Words', JSON.stringify(words));
  }

  function handleStageSelect(stageId) {
    setStage(stageId);
    if (stageId === 2) {
      setScreen('stage2words');
      setStage2Screen('grid');
      setSelectedNumber(null);
    } else {
      setScreen('practice');
    }
  }

  function handleBack() {
    setScreen('home');
    setStage(null);
  }

  React.useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') {
        // Only go back if not on home
        if (screen === 'practice' || screen === 'progress') {
          handleBack();
        } else if (screen === 'stage2words') {
          // For Stage2WordsPage, let it handle Esc itself
          if (stage2Screen === 'grid') {
            handleBack();
          }
          // If in 'edit', Stage2WordsPage will handle
        }
      }
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [screen, stage2Screen]);

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
        <PracticeStage stage={stage} onBack={handleBack} getStats={getStats} setStats={setStats} />
      )}
      {screen === 'progress' && (
        <ProgressPage onBack={handleBack} getStats={getStats} />
      )}
      {screen === 'stage2words' && (
        <Stage2WordsPage
          onBack={handleBack}
          getWords={getWords}
          setWords={setWords}
          stage2Screen={stage2Screen}
          setStage2Screen={setStage2Screen}
          selectedNumber={selectedNumber}
          setSelectedNumber={setSelectedNumber}
        />
      )}
    </div>
  );
}

function PracticeStage({ stage, onBack, getStats, setStats }) {
  if (stage === 1) {
    return <Stage1Practice onBack={onBack} getStats={getStats} setStats={setStats} />;
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

function Stage1Practice({ onBack, getStats, setStats }) {
  const [mode, setMode] = useState('digit-to-sound'); // or 'sound-to-digit' or 'mixed'
  const [question, setQuestion] = useState(generateQuestion('digit-to-sound'));
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const inputRef = React.useRef(null);
  const [currentMode, setCurrentMode] = useState('digit-to-sound'); // for mixed mode

  function getRandomMode() {
    return Math.random() < 0.5 ? 'digit-to-sound' : 'sound-to-digit';
  }

  function generateQuestion(mode) {
    let actualMode = mode;
    if (mode === 'mixed') {
      actualMode = getRandomMode();
    }
    if (actualMode === 'digit-to-sound') {
      const idx = getRandomInt(10);
      return { type: 'digit-to-sound', digit: MAJOR_SYSTEM[idx].digit, sounds: MAJOR_SYSTEM[idx].sounds };
    } else {
      const idx = getRandomInt(10);
      const sound = MAJOR_SYSTEM[idx].sounds[getRandomInt(MAJOR_SYSTEM[idx].sounds.length)];
      return { type: 'sound-to-digit', digit: MAJOR_SYSTEM[idx].digit, sound };
    }
  }

  function handleModeChange(newMode) {
    setMode(newMode);
    const q = generateQuestion(newMode);
    setQuestion(q);
    setCurrentMode(q.type || newMode);
    setUserAnswer('');
    setFeedback('');
    if (inputRef.current) inputRef.current.focus();
  }

  function validateAnswer(answer) {
    let isCorrect = false;
    let correctDisplay = '';
    let qMode = mode === 'mixed' ? currentMode : mode;
    let stats = getStats();
    if (qMode === 'digit-to-sound') {
      isCorrect = question.sounds.some(
        s => s[0].toLowerCase() === answer.trim().toLowerCase()
      );
      correctDisplay = `Correct answers: ${question.sounds.map(s => s[0].toUpperCase() + s.slice(1)).join(', ')}`;
      // Track per-digit
      const key = `digit_${question.digit}`;
      stats[key] = stats[key] || { attempts: 0, correct: 0 };
      stats[key].attempts++;
      if (isCorrect) stats[key].correct++;
    } else {
      isCorrect = String(question.digit) === answer.trim();
      correctDisplay = `Correct answer: ${question.digit}`;
      // Track per-sound
      const key = `sound_${question.sound.toUpperCase()}`;
      stats[key] = stats[key] || { attempts: 0, correct: 0 };
      stats[key].attempts++;
      if (isCorrect) stats[key].correct++;
    }
    setStats(stats);
    setFeedback((isCorrect ? '✅ Correct! ' : '❌ Incorrect. ') + correctDisplay);
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    setTimeout(() => {
      const q = generateQuestion(mode);
      setQuestion(q);
      setCurrentMode(q.type || mode);
      setUserAnswer('');
      setFeedback('');
      if (inputRef.current) inputRef.current.focus();
    }, 1200);
  }

  function handleInputChange(e) {
    const value = e.target.value;
    setUserAnswer(value);
    let qMode = mode === 'mixed' ? currentMode : mode;
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
        <button onClick={() => handleModeChange('mixed')} disabled={mode === 'mixed'} style={{ marginLeft: 8 }}>
          Mixed
        </button>
      </div>
      <div style={{ marginBottom: 12 }}>
        <b>Score:</b> {score.correct} / {score.total}
      </div>
      <form onSubmit={e => e.preventDefault()}>
        {(mode === 'digit-to-sound' || (mode === 'mixed' && currentMode === 'digit-to-sound')) ? (
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

function ProgressPage({ onBack, getStats }) {
  const stats = getStats();
  // Gather digit stats
  const digitStats = [];
  for (let d = 0; d <= 9; d++) {
    const key = `digit_${d}`;
    const s = stats[key] || { attempts: 0, correct: 0 };
    digitStats.push({ digit: d, ...s });
  }
  // Gather sound stats
  const soundKeys = Object.keys(stats).filter(k => k.startsWith('sound_'));
  const soundStats = soundKeys.map(k => ({ sound: k.replace('sound_', ''), ...stats[k] }));

  // Sort by lowest accuracy, only show those with at least 3 attempts
  const weakestDigits = digitStats
    .filter(s => s.attempts >= 3)
    .map(s => ({ ...s, accuracy: s.attempts > 0 ? s.correct / s.attempts : 1 }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);
  const weakestSounds = soundStats
    .filter(s => s.attempts >= 3)
    .map(s => ({ ...s, accuracy: s.attempts > 0 ? s.correct / s.attempts : 1 }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  function handleRestart() {
    localStorage.removeItem('memoryStats');
    window.location.reload();
  }

  function handleDownload() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "memoryStats.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h2>Your Weakest Areas</h2>
      <div style={{ marginBottom: 16 }}>
        <button onClick={handleRestart} style={{ marginRight: 8 }}>Restart Progress</button>
        <button onClick={handleDownload}>Download Data</button>
      </div>
      {weakestDigits.length === 0 && weakestSounds.length === 0 && (
        <p>Practice more to see your weak areas!</p>
      )}
      {weakestDigits.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <b>Digits:</b>
          <ul>
            {weakestDigits.map(({ digit, correct, attempts, accuracy }) => (
              <li key={digit}>
                {digit} (Digit): {(accuracy * 100).toFixed(0)}% correct ({correct}/{attempts})
              </li>
            ))}
          </ul>
        </div>
      )}
      {weakestSounds.length > 0 && (
        <div>
          <b>Sounds:</b>
          <ul>
            {weakestSounds.map(({ sound, correct, attempts, accuracy }) => (
              <li key={sound}>
                {sound} (Sound): {(accuracy * 100).toFixed(0)}% correct ({correct}/{attempts})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stage2WordsPage({ onBack, getWords, setWords, stage2Screen, setStage2Screen, selectedNumber, setSelectedNumber }) {
  const [words, updateWords] = useState(getWords());
  const [inputValue, setInputValue] = useState('');
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    updateWords(getWords());
  }, [stage2Screen]);

  // Esc key handling for edit mode
  React.useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape' && stage2Screen === 'edit') {
        // Only go back if input is not focused or is empty
        if (!inputRef.current || document.activeElement !== inputRef.current || !inputValue) {
          setStage2Screen('grid');
          setSelectedNumber(null);
        }
      }
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [stage2Screen, inputValue]);

  function handleNumberClick(num) {
    setSelectedNumber(num);
    setStage2Screen('edit');
    setInputValue('');
  }

  function handleAddWord() {
    if (!inputValue.trim()) return;
    const num = selectedNumber;
    const newWords = { ...words };
    newWords[num] = newWords[num] || [];
    if (!newWords[num].includes(inputValue.trim())) {
      newWords[num].push(inputValue.trim());
      updateWords(newWords);
      setWords(newWords);
    }
    setInputValue('');
  }

  function handleRemoveWord(word) {
    const num = selectedNumber;
    const newWords = { ...words };
    newWords[num] = newWords[num].filter(w => w !== word);
    updateWords(newWords);
    setWords(newWords);
  }

  function handleEditBack() {
    setStage2Screen('grid');
    setSelectedNumber(null);
  }

  // Grid of numbers 00-99
  if (stage2Screen === 'grid') {
    return (
      <div>
        <button onClick={onBack}>← Back</button>
        <h2>Edit Words for Numbers (00–99)</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
            gap: 8,
            maxWidth: 1100,
            margin: '0 auto',
            width: '100%',
            background: 'var(--stage2-bg, #23272f)',
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
            padding: 8,
          }}
        >
          {Array.from({ length: 100 }, (_, i) => {
            const num = i.toString().padStart(2, '0');
            const wordList = words[num] || [];
            let preview = '';
            if (wordList.length > 0) {
              preview = wordList.slice(0, 2).join(', ');
              if (wordList.length > 2) {
                preview += ` +${wordList.length - 2} more`;
              }
            }
            return (
              <button
                key={num}
                style={{
                  padding: 6,
                  minHeight: 36,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  wordBreak: 'break-word',
                  background: '#23272f',
                  color: '#f3f3f3',
                  border: '1px solid #353a45',
                  borderRadius: 8,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                  transition: 'background 0.2s',
                }}
                onClick={() => handleNumberClick(num)}
              >
                <div style={{ fontWeight: 'bold', fontSize: 15 }}>{num}</div>
                <div style={{ fontSize: 10, color: '#b0b6c3', marginTop: 2, minHeight: 12 }}>
                  {preview}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Edit words for a selected number
  if (stage2Screen === 'edit') {
    const num = selectedNumber;
    return (
      <div style={{ maxWidth: 500, margin: '0 auto', width: '100%', background: '#23272f', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', padding: 24 }}>
        <button onClick={handleEditBack}>← Back to Grid</button>
        <h2 style={{ color: '#f3f3f3' }}>Words for {num}</h2>
        <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Add a word"
            style={{ marginRight: 8, flex: '1 1 200px', minWidth: 120, background: '#181b20', color: '#f3f3f3', border: '1px solid #353a45', borderRadius: 8, padding: '8px 10px' }}
            ref={inputRef}
          />
          <button style={{ background: '#353a45', color: '#f3f3f3', border: 'none', borderRadius: 8, padding: '8px 16px' }} onClick={handleAddWord}>Add</button>
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 16,
        }}>
          {(words[num] || []).map(word => (
            <div
              key={word}
              style={{
                background: '#353a45',
                color: '#f3f3f3',
                padding: '8px 14px',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                marginBottom: 6,
                fontSize: 16,
              }}
            >
              {word}
              <button
                onClick={() => handleRemoveWord(word)}
                style={{ marginLeft: 8, fontSize: 13, padding: '2px 8px', borderRadius: 8, background: '#181b20', color: '#f3f3f3', border: 'none' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {(!words[num] || words[num].length === 0) && <div style={{ color: '#888' }}>No words yet for {num}.</div>}
      </div>
    );
  }
  return null;
}

export default App
