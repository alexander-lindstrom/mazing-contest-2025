import { Howl } from 'howler';
import buttonClickSound from '../sounds/button_start.wav';

const useStartButtonClickSound = () => {
  const buttonClick = new Howl({
    src: [buttonClickSound],
    volume: 0.4,
  });

  const playButtonClick = () => {
    buttonClick.play();
  };

  return playButtonClick;
};

export default useStartButtonClickSound;