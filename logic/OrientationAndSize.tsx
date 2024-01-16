import { atom } from "recoil";

export type Orientation = "landscape" | "portrait";

export const boardOrientationState = atom<Orientation>({
  key: "boardOrientation",
  default: "landscape"
});

export const windowWidthState = atom<number>({
  key: "windowWidth",
  default: 0
});

export const windowHeightState = atom<number>({
  key: "windowHeight",
  default: 0
});

export const getCardSize = (windowWidth: number, windowHeight: number) => {
  if (windowHeight < 500 && windowWidth >= 500) {
    return "small";
  } else if (windowHeight >= 1000) return "large";
  else if (windowWidth >= 675) {
    return "medium";
  } else if (windowWidth >= 500) {
    return "small";
  } else return "tiny";
};
