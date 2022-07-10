import React from "react";
import { useRecoilValue } from "recoil";
import { SendComponent } from "../components/send";

import { darkModeAtom } from "../utils/store";

export default function Send() {
  const isDarkMode = useRecoilValue(darkModeAtom);
  return (
    <>
      <div className={`${isDarkMode ? "dark" : ""}`}>
        <SendComponent />
      </div>
    </>
  );
}
