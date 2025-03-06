import { Howl } from 'howler';
import invalidActionSound from '../sounds/invalid_action.mp3';

const useInvalidActionSound = () => {
  const buttonClick = new Howl({
    src: [invalidActionSound],
    volume: 0.3,
  });

  const playInvalidAction = () => {
    buttonClick.play();
  };

  return playInvalidAction;
};

export default useInvalidActionSound;