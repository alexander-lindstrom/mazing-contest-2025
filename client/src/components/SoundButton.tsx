import React from 'react';
import { Howl } from 'howler';
import buttonClickSound from '../sounds/button_default.wav';

interface SoundButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

const SoundButton: React.FC<SoundButtonProps> = ({ onClick, children, className }) => {
  const buttonClick = new Howl({
    src: [buttonClickSound],
    volume: 1,
  });

  const handleClick = () => {
    buttonClick.play();
    onClick();
  };

  return (
    <button className={className} onClick={handleClick}>
      {children}
    </button>
  );
};

export default SoundButton;