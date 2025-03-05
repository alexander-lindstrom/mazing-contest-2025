import React from 'react';
import { Howl } from 'howler';
import buttonClickSound from '../sounds/button_default.wav';

interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
}

const SoundButton: React.FC<SoundButtonProps> = ({ onClick, children, className, disabled, ...props }) => {
  const buttonClick = new Howl({
    src: [buttonClickSound],
    volume: 1,
  });

  const handleClick = () => {
    if (!disabled) {
      buttonClick.play();
      onClick();
    }
  };

  return (
    <button className={className} onClick={handleClick} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default SoundButton;
