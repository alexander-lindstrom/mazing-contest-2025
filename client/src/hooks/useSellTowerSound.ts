import { Howl } from 'howler';
import towerSellSound from '../sounds/selling_tower.wav';

const useSellTowerSound = () => {
  const buttonClick = new Howl({
    src: [towerSellSound],
    volume: 0.5,
  });

  const playSellTower = () => {
    buttonClick.play();
  };

  return playSellTower;
};

export default useSellTowerSound;