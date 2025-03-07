import { useRef } from 'react';
import { Howl, HowlOptions } from 'howler';

const useSound = (soundFile: string, volume: number = 0.5) => {
  const soundRef = useRef<Howl | null>(null);

  if (!soundRef.current) {
    soundRef.current = new Howl({
      src: [soundFile],
      volume,
      preload: true,
    } as HowlOptions);
  }

  const playSound = () => {
    if (soundRef.current) {
      soundRef.current.play();
    }
  };

  return playSound;
};

export default useSound;