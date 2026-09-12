/**
 * Backdrops for the player's own chambers on the Home screen.
 *
 * Home is no longer tied to whichever companion is on display — she is a
 * guest in the player's own space now, not the other way around — so the
 * scene is its own pickable thing. The player cycles through these from the
 * Home screen; the choice persists in the save.
 */
export interface HomeScene {
  id: string;
  /** Shown in the location label and the scene-picker tooltip. */
  name: string;
  imageUrl: string;
}

export const HOME_SCENES: HomeScene[] = [
  {
    id: 'dusk_gold',
    name: 'The Gold Hour',
    imageUrl: 'backgrounds/home_dusk_gold.jpg',
  },
  {
    id: 'daylight_garden',
    name: 'The Terrace',
    imageUrl: 'backgrounds/home_daylight_garden.png',
  },
  {
    id: 'moonlit_crimson',
    name: 'Moonlit Chambers',
    imageUrl: 'backgrounds/home_moonlit_crimson.png',
  },
];

export function homeSceneAt(index: number): HomeScene {
  const scene = HOME_SCENES[((index % HOME_SCENES.length) + HOME_SCENES.length) % HOME_SCENES.length];
  return scene ?? HOME_SCENES[0];
}
