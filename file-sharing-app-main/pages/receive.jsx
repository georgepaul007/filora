import React from "react";
import { useRecoilValue } from "recoil";
import { ReceiveComponent } from "../components/receive";

import { darkModeAtom } from "../utils/store";

export default function Receive() {
  const isDarkMode = useRecoilValue(darkModeAtom);
  return (
    <>
      <div className={`${isDarkMode ? "dark" : ""}`}>
        <ReceiveComponent />
      </div>
    </>
  );
}
