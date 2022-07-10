import React from "react";
import { useRecoilValue } from "recoil";
import { HomeComponent } from "../components/home";

import { darkModeAtom } from "../utils/store";

export default function Home() {
  const isDarkMode = useRecoilValue(darkModeAtom);
  return (
    <div className={`${isDarkMode ? "dark" : ""}`}>
      <HomeComponent />
    </div>
  );
}
