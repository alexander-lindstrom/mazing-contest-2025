import { Howl } from 'howler';
import towerClapSound from '../sounds/clap_tower_effect.wav';

const useClapTowerSound = () => {
  const buttonClick = new Howl({
    src: [towerClapSound],
    volume: 0.5,
  });

  const playClapTower = () => {
    buttonClick.play();
  };

  return playClapTower;
};

export default useClapTowerSound;