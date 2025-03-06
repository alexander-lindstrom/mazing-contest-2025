import { Howl } from 'howler';
import towerBuildSound from '../sounds/building_tower.wav';

const useBuildTowerSound = () => {
  const buttonClick = new Howl({
    src: [towerBuildSound],
    volume: 0.5,
  });

  const playBuildTower = () => {
    buttonClick.play();
  };

  return playBuildTower;
};

export default useBuildTowerSound;