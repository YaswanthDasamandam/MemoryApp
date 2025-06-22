import { useState, useEffect } from 'react'
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
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  const notificationTimeout = React.useRef();

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

  function showNotification(message, type = 'success') {
    setNotification({ message, type });
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    notificationTimeout.current = setTimeout(() => {
      setNotification({ message: '', type });
    }, 2200);
  }

  React.useEffect(() => {
    return () => {
      if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    };
  }, []);

  return (
    <div className="app-container">
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: notification.type })}
      />
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
          onPractice={() => setScreen('stage2practice')}
          showNotification={showNotification}
        />
      )}
      {screen === 'stage2practice' && (
        <Stage2Practice
          onBack={() => setScreen('stage2words')}
          getWords={getWords}
          setWords={setWords}
          showNotification={showNotification}
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

function getMajorSystemDigits(word) {
  const soundToDigit = {};
  MAJOR_SYSTEM.forEach(({ digit, sounds }) => {
    sounds.forEach(sound => {
      const base = sound[0].toUpperCase();
      if (!soundToDigit[base]) soundToDigit[base] = [];
      soundToDigit[base].push(digit);
    });
  });
  const ignored = /[AEIOUWHY]/i;
  let digits = [];
  for (let i = 0; i < word.length; i++) {
    const ch = word[i].toUpperCase();
    if (ignored.test(ch)) continue;
    if (soundToDigit[ch]) {
      digits.push(soundToDigit[ch][0]);
    }
  }
  return digits.join('');
}

// Shared card style for practice/edit screens
const cardStyle = {
  maxWidth: 500,
  margin: '32px auto',
  width: '100%',
  background: '#23272f',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

function Stage1Practice({ onBack, getStats, setStats }) {
  const [mode, setMode] = useState('mixed'); // or 'sound-to-digit' or 'digit-to-sound'
  const [question, setQuestion] = useState(generateQuestion('mixed'));
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

  function handleInputChange(v) {
    setUserAnswer(v);
    setFeedback('');
  }

  function handleSubmit() {
    if (!userAnswer.trim()) return;
    validateAnswer(userAnswer);
  }

  return (
    <div style={cardStyle}>
      <button onClick={onBack} style={{ alignSelf: 'flex-start', marginBottom: 8 }}>← Back</button>
      <h2 style={{ color: '#f3f3f3', marginBottom: 12 }}>Stage 1: Single Digit ↔ Sound</h2>
      <div style={{ marginBottom: 16 }}>
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
      <div style={{ marginBottom: 16, fontSize: 18 }}>
        <b>Score:</b> {score.correct} / {score.total}
      </div>
      <div style={{ fontSize: 22, marginBottom: 10 }}>
        {mode === 'digit-to-sound' || (mode === 'mixed' && currentMode === 'digit-to-sound') ? (
          <>
            Digit: <b>{question.digit}</b>
          </>
        ) : (
          <>
            Sound: <b>{question.sound}</b>
          </>
        )}
      </div>
      <WordInputBox
        inputValue={userAnswer}
        setInputValue={handleInputChange}
        onSubmit={handleSubmit}
        inputRef={inputRef}
        placeholder={mode === 'digit-to-sound' || (mode === 'mixed' && currentMode === 'digit-to-sound') ? 'Enter first letter (e.g. S, Z)' : 'Enter digit (0-9)'}
        asForm={true}
      />
      {feedback && <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#fff' }}>{feedback}</div>}
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

// Reusable input box for adding/checking words
function WordInputBox({ inputValue, setInputValue, onSubmit, inputRef, placeholder, buttonLabel, error, style, disabled, asForm }) {
  const inputElement = (
    <input
      type="text"
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
      placeholder={placeholder}
      style={{
        marginRight: 8,
        flex: '1 1 300px',
        minWidth: 200,
        fontSize: 20,
        background: '#181b20',
        color: '#f3f3f3',
        border: '1.5px solid #353a45',
        borderRadius: 8,
        padding: '14px 16px',
        ...((style && style.input) || {})
      }}
      ref={inputRef}
      autoFocus
      disabled={disabled}
    />
  );
  if (asForm) {
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          onSubmit();
        }}
        style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, ...style }}
      >
        {inputElement}
        {error && <div style={{ color: 'red', marginTop: 8, width: '100%' }}>{error}</div>}
      </form>
    );
  }
  return (
    <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, ...style }}>
      {inputElement}
      <button
        style={{
          background: '#353a45',
          color: '#f3f3f3',
          border: 'none',
          borderRadius: 8,
          padding: '14px 24px',
          fontSize: 18,
          ...((style && style.button) || {})
        }}
        onClick={onSubmit}
        disabled={disabled}
      >
        {buttonLabel}
      </button>
      {error && <div style={{ color: 'red', marginTop: 8, width: '100%' }}>{error}</div>}
    </div>
  );
}

function Notification({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 32,
        right: 32,
        zIndex: 1000,
        minWidth: 220,
        maxWidth: 340,
        padding: '16px 28px',
        background: type === 'success' ? '#2ecc40' : '#ff4136',
        color: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        fontSize: 18,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        transition: 'opacity 0.3s',
      }}
      role="alert"
      onClick={onClose}
    >
      {message}
      <span style={{ marginLeft: 16, cursor: 'pointer', fontWeight: 700 }}>&times;</span>
    </div>
  );
}

function Stage2WordsPage({ onBack, getWords, setWords, stage2Screen, setStage2Screen, selectedNumber, setSelectedNumber, onPractice, showNotification }) {
  const [words, updateWords] = useState(getWords());
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
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
    setError('');
  }

  function handleAddWord() {
    setError('');
    if (!inputValue.trim()) return;
    const num = selectedNumber;
    // Validate: word must encode the number (e.g. 23 for 'name')
    const expected = num;
    const actual = getMajorSystemDigits(inputValue.trim()).padStart(2, '0');
    if (actual.slice(0, 2) !== expected) {
      showNotification(`Word does not match the Major System for ${num}. Encoded: ${actual}`, 'error');
      return;
    }
    const newWords = { ...words };
    newWords[num] = newWords[num] || [];
    if (!newWords[num].includes(inputValue.trim())) {
      newWords[num].push(inputValue.trim());
      updateWords(newWords);
      setWords(newWords);
      showNotification('Word added!', 'success');
    } else {
      showNotification('Word already exists for this number.', 'error');
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
    setError('');
  }

  // Grid of numbers 00-99
  if (stage2Screen === 'grid') {
    return (
      <div>
        <button onClick={onBack}>← Back</button>
        <h2>Edit Words for Numbers (00–99)</h2>
        <button style={{ marginBottom: 12 }} onClick={onPractice}>Practice Mode</button>
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
        <WordInputBox
          inputValue={inputValue}
          setInputValue={v => { setInputValue(v); setError(''); }}
          onSubmit={handleAddWord}
          inputRef={inputRef}
          placeholder="Add a word"
          buttonLabel="Add"
          error={error}
          asForm={true}
        />
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

// Stage 2 Practice Mode: Number → Word, with add-new-word option
function Stage2Practice({ onBack, getWords, setWords, showNotification }) {
  const [words, setWordsState] = useState(getWords());
  const [currentNum, setCurrentNum] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const inputRef = React.useRef(null);

  useEffect(() => {
    setWordsState(getWords());
  }, []);

  function getRandomNum() {
    // Always pick from all numbers 00-99, not just those with words
    const allNums = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, '0'));
    return allNums[Math.floor(Math.random() * allNums.length)];
  }

  useEffect(() => {
    setCurrentNum(getRandomNum());
    setInputValue('');
    setFeedback('');
    if (inputRef.current) inputRef.current.focus();
    // eslint-disable-next-line
  }, [words, score.total]);

  function handleInputChange(v) {
    setInputValue(v);
    setFeedback('');
  }

  function handleSubmit() {
    if (!inputValue.trim()) return;
    const num = currentNum;
    const userWord = inputValue.trim();
    const wordList = words[num] || [];
    const expected = num;
    const actual = getMajorSystemDigits(userWord).padStart(2, '0');
    // Check if word is already in the list (case-insensitive, trimmed)
    if (wordList.some(w => w.trim().toLowerCase() === userWord.toLowerCase())) {
      setFeedback('✅ Correct!');
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
      showNotification('Correct!', 'success');
      setTimeout(() => {
        setInputValue('');
        setFeedback('');
        setCurrentNum(getRandomNum());
      }, 1000);
    } else if (actual === expected) {
      // New valid word: add to list immediately
      const newWords = { ...words };
      newWords[num] = newWords[num] || [];
      newWords[num].push(userWord);
      setWordsState(newWords);
      setWords(newWords);
      setFeedback('New word detected and added to your list!');
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
      showNotification('New word detected and added to your list!', 'success');
      setTimeout(() => {
        setInputValue('');
        setFeedback('');
        setCurrentNum(getRandomNum());
      }, 1000);
    } else {
      setFeedback(`❌ Incorrect. Your words: ${wordList.length ? wordList.join(', ') : 'None yet.'}`);
      setScore(s => ({ ...s, total: s.total + 1 }));
      showNotification('Incorrect. Not a valid word for this number.', 'error');
    }
  }

  if (!currentNum) return null;

  return (
    <div style={cardStyle}>
      <button onClick={onBack} style={{ alignSelf: 'flex-start', marginBottom: 8 }}>← Back</button>
      <h2 style={{ color: '#f3f3f3', marginBottom: 12 }}>Stage 2 Practice: Number → Word</h2>
      <div style={{ marginBottom: 16, fontSize: 18 }}>
        <b>Score:</b> {score.correct} / {score.total}
      </div>
      <div style={{ fontSize: 22, marginBottom: 10 }}>
        Number: <b>{currentNum}</b>
      </div>
      <WordInputBox
        inputValue={inputValue}
        setInputValue={handleInputChange}
        onSubmit={handleSubmit}
        inputRef={inputRef}
        placeholder="Type a word you associate with this number"
        asForm={true}
      />
      {feedback && <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#fff' }}>{feedback}</div>}
    </div>
  );
}

export default App
