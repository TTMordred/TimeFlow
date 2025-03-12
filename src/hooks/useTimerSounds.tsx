
import { useState, useEffect, useRef } from 'react';

type SoundType = 'start' | 'pause' | 'resume' | 'complete' | 'tick';

export function useTimerSounds() {
  const [muted, setMuted] = useState(() => {
    const storedMuted = localStorage.getItem('timerSoundsMuted');
    return storedMuted ? storedMuted === 'true' : false;
  });
  
  const soundsRef = useRef<Record<SoundType, HTMLAudioElement | null>>({
    start: null,
    pause: null,
    resume: null,
    complete: null,
    tick: null
  });
  
  useEffect(() => {
    // Create audio elements
    soundsRef.current.start = new Audio(`${window.location.origin}/sounds/start.mp3`);
    soundsRef.current.pause = new Audio(`${window.location.origin}/sounds/pause.mp3`);
    soundsRef.current.resume = new Audio(`${window.location.origin}/sounds/resume.mp3`);
    soundsRef.current.complete = new Audio(`${window.location.origin}/sounds/complete.mp3`);
    soundsRef.current.tick = new Audio(`${window.location.origin}/sounds/tick.mp3`);
    
    // Set volume for tick sound (quieter)
    if (soundsRef.current.tick) {
      soundsRef.current.tick.volume = 0.3;
    }
    
    // Set volume for complete sound (louder)
    if (soundsRef.current.complete) {
      soundsRef.current.complete.volume = 0.7;
    }
    
    return () => {
      // Clean up audio elements
      Object.values(soundsRef.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);
  
  useEffect(() => {
    localStorage.setItem('timerSoundsMuted', muted.toString());
  }, [muted]);
  
  const playSound = (type: SoundType) => {
    if (muted || !soundsRef.current[type]) return;
    
    try {
      const sound = soundsRef.current[type];
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(err => console.error('Error playing sound:', err));
      }
    } catch (error) {
      console.error(`Error playing ${type} sound:`, error);
    }
  };
  
  const toggleMute = () => {
    setMuted(prev => !prev);
  };
  
  return { playSound, muted, toggleMute };
}
