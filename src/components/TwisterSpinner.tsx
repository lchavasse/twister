import { useState, useEffect, useCallback } from 'react';
import Confetti from 'react-confetti';
import '../styles/TwisterSpinner.css';

type SpinResult = {
  bodyPart: string;
  color: string;
  name: string;
};

import names from '../../names.json';
const BODY_PARTS = ['Left Hand', 'Right Hand', 'Left Foot', 'Right Foot'];
const COLORS = ['Red', 'Blue', 'Yellow', 'Green', 'Orange'];
const synth = window.speechSynthesis;

export const TwisterSpinner = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [currentBodyPartIndex, setCurrentBodyPartIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNames, setShowNames] = useState(true);

  useEffect(() => {
    const handleKeyPress = (_event: KeyboardEvent) => {
      if (!isSpinning) {
        spin();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isSpinning]);

  useEffect(() => {
    let interval: number | null = null;
    if (isSpinning) {
      interval = window.setInterval(() => {
        setCurrentBodyPartIndex(prev => (prev + 1) % BODY_PARTS.length);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpinning]);

  const speak = useCallback((text: string) => {
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 2;
    synth.speak(utterance);
  }, []);

  const spin = () => {
    setIsSpinning(true);
    setShowConfetti(false);
    
    // Random duration between 2-3 seconds
    const spinDuration = 2000 + Math.random() * 1000;
    
    // Generate new random result
    const finalBodyPartIndex = Math.floor(Math.random() * BODY_PARTS.length);
    const finalColorIndex = Math.floor(Math.random() * COLORS.length);
    const finalNameIndex = Math.floor(Math.random() * names.length);
    
    setTimeout(() => {
      const newResult = {
        bodyPart: BODY_PARTS[finalBodyPartIndex],
        color: COLORS[finalColorIndex],
        name: names[finalNameIndex],
      };
      setResult(newResult);
      setCurrentBodyPartIndex(finalBodyPartIndex);
      setIsSpinning(false);
      
      speak(
        showNames 
          ? `${newResult.name} place ${newResult.bodyPart} on ${newResult.color}`
          : `${newResult.bodyPart} on ${newResult.color}`
      );
      
      requestAnimationFrame(() => {
        setShowConfetti(true);
      });
    }, spinDuration);
  };

  return (
    <div className="spinner-container">
      <h1 className="game-title">Twister Spinner</h1>
      {showConfetti && result && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={100}
          recycle={false}
          colors={[result.color.toLowerCase()]}
          gravity={0.25}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            zIndex: 3,
            willChange: 'transform',
            transform: 'translateZ(0)'
          }}
          tweenDuration={1500}
          friction={0.95}
          onConfettiComplete={() => {
            setShowConfetti(false);
          }}
        />
      )}
      <div className="spinner-wrapper">
        {isSpinning ? (
          <div className="spinning-display">
            <div 
              className="color-ring"
              style={{ 
                background: `conic-gradient(
                  ${COLORS.map((color, i) => 
                    `${color} ${i * (360/COLORS.length)}deg ${(i + 1) * (360/COLORS.length)}deg`
                  ).join(', ')}
                )`,
                animation: 'rotate 1s linear infinite'
              }}
            >
              <div className="inner-circle" />
            </div>
            <div className="body-part-display-wrapper">
              <div className="body-part-display">
                {BODY_PARTS[currentBodyPartIndex]}
              </div>
            </div>
          </div>
        ) : (
          result && (
            <div className="result-display">
              <div 
                className="color-ring"
                style={{ 
                  backgroundColor: result.color.toLowerCase(),
                  boxShadow: `0 0 100px ${result.color.toLowerCase()}50`
                }}
              >
              </div>
              <div className="body-part-display-wrapper">
                <div 
                  className="body-part-display"
                  style={{ 
                    color: 'white',
                    textShadow: `0 0 20px ${result.color.toLowerCase()}`
                  }}
                >
                  {showNames && <div className="player-name">{result.name}</div>}
                  {result.bodyPart}
                </div>
              </div>
            </div>
          )
        )}
        
        <button 
          className="spin-button" 
          onClick={spin} 
          disabled={isSpinning}
        >
          {isSpinning ? 'Spinning...' : 'SPIN!'}
        </button>
      </div>
      <div className="name-toggle">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={showNames}
            onChange={(e) => setShowNames(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
        <span className="toggle-label">Show Names</span>
      </div>
    </div>
  );
};
