import { Howl } from 'howler';
import buttonClickSound from '../sounds/button_stop.wav';

const useStopButtonClickSound = () => {
  const buttonClick = new Howl({
    src: [buttonClickSound],
    volume: 0.2,
  });

  const playButtonClick = () => {
    buttonClick.play();
  };

  return playButtonClick;
};

export default useStopButtonClickSound;