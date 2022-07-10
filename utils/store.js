import { atom } from "recoil";

const darkModeAtom = atom({
    key: "darkModeAtom", 
    default: false, 
  });

export { darkModeAtom };