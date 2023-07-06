import { Game } from "./api/game";
import { LoadImage } from "./utils/load";

(async () => {
  let manifest = await fetch('./src/assets/assets.json').then((x) => x.json());
  let imageArr = await Promise.all(manifest.map(({name, link}: {[index: string]: string}): any => LoadImage(name, link)));

  const assets = Object();
  imageArr.forEach(({ name, image }) => assets[name] = image);
    
  const g = new Game(assets);
  g.start()
})();