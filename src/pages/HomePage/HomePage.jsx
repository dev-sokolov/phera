import { useState } from "react";
import Main from "../../components/Main/Main";
import CameraViewPage from "../CameraViewPage/CameraViewPage";

import styles from "./HomePage.module.css";

const HomePage = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);

  return (
    <>
      {!isCameraOn ? (
        <div className={styles.wrapHomePage}>
          <Main handleStartCamera={() => setIsCameraOn(true)} />
          <footer className={styles.footer}>
            <p>pHera • Empowering vaginal health through accessible testing</p>
          </footer>
        </div>
      ) : (
        <CameraViewPage onExit={() => setIsCameraOn(false)} />
      )}
    </>
  );
};

export default HomePage;