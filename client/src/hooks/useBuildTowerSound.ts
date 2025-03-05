import { Howl } from 'howler';
import towerBuildSound from '../sounds/building_tower.wav';

const useBuildTowerSound = () => {
  const buttonClick = new Howl({
    src: [towerBuildSound],
    volume: 0.5,
  });

  const playButtonClick = () => {
    buttonClick.play();
  };

  return playButtonClick;
};

export default useBuildTowerSound;