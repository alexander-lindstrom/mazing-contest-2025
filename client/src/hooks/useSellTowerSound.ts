import { Howl } from 'howler';
import towerSellSound from '../sounds/selling_tower.wav';

const useSellTowerSound = () => {
  const buttonClick = new Howl({
    src: [towerSellSound],
    volume: 0.5,
  });

  const playButtonClick = () => {
    buttonClick.play();
  };

  return playButtonClick;
};

export default useSellTowerSound;