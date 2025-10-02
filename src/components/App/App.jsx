import { useState } from "react";
import Webcam from "react-webcam";

import styles from "./App.module.css"

function App() {
  const [showWebcam, setShowWebkam] = useState(false);
  // const WebcamComponent = () => <Webcam />;
  const cameraTurnOn = () => {
    setShowWebkam(true);
  }

  return (
    <>
      <div className={styles.wrapGreeting}>
        <p className={styles.greeting}>Hello App!!!</p>
      </div>
      <div className={styles.wrapBtn}>
        <button onClick={cameraTurnOn} className={styles.btn}>Scan pH strip </button>
      </div>
      {showWebcam && (
        <div>
          <Webcam />
        </div>
      )}





    </>
  )
}

export default App
