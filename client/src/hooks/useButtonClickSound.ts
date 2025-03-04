import { Howl } from 'howler';
import buttonClickSound from '../sounds/button_default.wav';

const useButtonClickSound = () => {
  const buttonClick = new Howl({
    src: [buttonClickSound],
    volume: 1,
  });

  const playButtonClick = () => {
    buttonClick.play();
  };

  return playButtonClick;
};

export default useButtonClickSound;