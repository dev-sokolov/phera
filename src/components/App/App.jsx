// import { useState, useRef } from "react";
// import Webcam from "react-webcam";

// import styles from "./App.module.css"

// function App() {
//   const [isCameraOn, setIsCameraOn] = useState(false);
//   const [capturedImage, setCapturedImage] = useState(null);

//   const webcamRef = useRef(null);
//   // const WebcamComponent = () => <Webcam />;


//   // Настройки камеры: задняя камера на смартфонах
//   const videoConstraints = {
//     facingMode: { exact: "environment" }, // или просто "environment"
//   };

//   const handleStartCamera = () => {
//     setIsCameraOn(true);
//     setCapturedImage(null); // сброс предыдущего фото
//   }

//   const handleStopCamera = () => {
//     if (webcamRef.current) {
//       const tracks = webcamRef.current.video.srcObject?.getTracks();
//       tracks?.forEach((track) => track.stop());
//     }
//     setIsCameraOn(false);
//   };

//   // Настройки камеры: задняя камера на смартфонах
//   // const videoConstraints = {
//   //   facingMode: { exact: "environment" }, // или просто "environment"
//   // };

//   const handleCapture = () => {
//     if (webcamRef.current) {
//       const imageSrc = webcamRef.current.getScreenshot();
//       setCapturedImage(imageSrc);
//       handleStopCamera(); // остановка камеры после снимка (по желанию)
//     }
//   };

//   return (
//     <>
//       <div className={styles.wrapGreeting}>
//         <p className={styles.greeting}>Hello App!!!</p>
//       </div>

//       <div className={styles.wrapBtn}>
//         {!isCameraOn && !capturedImage && (
//           // {!isCameraOn && (
//           <button onClick={handleStartCamera} className={styles.btn}>
//             Start Camera
//           </button>
//         )}
//         {isCameraOn && (
//           <>
//             <button onClick={handleCapture} className={styles.btn}>
//               Scan pH strip
//             </button>
//             <button onClick={handleStopCamera} className={styles.btn}>
//               Stop Camera
//             </button>
//           </>
//         )}
//       </div>

//       {isCameraOn && (
//         <div className={styles.webcamWrap}>
//           <Webcam
//             ref={webcamRef}
//             audio={false}
//             screenshotFormat="image/png"
//             videoConstraints={videoConstraints}
//           />
//         </div>
//       )}
//       {/* {showWebcam && (
//         <div>
//           <Webcam />
//         </div>
//       )} */}
//       {/* ----------------------- */}

//       {capturedImage && (
//         <>
//           <div className={styles.capturedWrap}>
//             <p>Captured Image:</p>
//             <img src={capturedImage} alt="pH strip" className={styles.capturedImg} />
//             <button onClick={handleStartCamera} className={styles.btn}>
//               Retake
//             </button>
//             <button onClick={handleStopCamera} className={styles.btn}>
//               Reset
//             </button>
//           </div>
//         </>

//       )}





//     </>
//   )
// }

// export default App


// -----------------------------------------------------

import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import styles from "./App.module.css";

function App() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);

  // Задняя камера
  const videoConstraints = {
    facingMode: { ideal: "environment" },
  };

  const handleStartCamera = () => {
    setIsCameraOn(true);
    setCapturedImage(null);
  };

  const handleStopCamera = () => {
    if (webcamRef.current) {
      const tracks = webcamRef.current.video.srcObject?.getTracks();
      tracks?.forEach((track) => track.stop());
    }
    setIsCameraOn(false);
  };

  // Снимок с кадрированием
  // const handleCapture = () => {
  //   if (webcamRef.current) {
  //     const imageSrc = webcamRef.current.getScreenshot();

  //     // создаём временное изображение
  //     const img = new Image();
  //     img.src = imageSrc;
  //     img.onload = () => {
  //       // создаём canvas для обрезки
  //       const canvas = document.createElement("canvas");
  //       const ctx = canvas.getContext("2d");

  //       // const cropWidth = img.width * 0.8; // ширина обрезки (примерно 80% кадра)
  //       // const cropHeight = img.height * 0.25; // высота обрезки (примерно 25% кадра)
  //       // const x = (img.width - cropWidth) / 2; // центр по X
  //       // const y = img.height * 0.55; // нижняя часть кадра (предположим, что полоска держится ниже центра)

  //       const cropWidth = img.width * 0.8; // ширина обрезки (примерно 80% кадра)
  //       const cropHeight = img.height * 0.25; // высота обрезки (примерно 25% кадра)
  //       const x = (img.width - cropWidth) / 2; // центр по X
  //       const y = img.height * 0.55; // нижняя часть кадра (предположим, что полоска держится ниже центра)

  //       canvas.width = 320;
  //       canvas.height = 480;
  //       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  //       const cropped = canvas.toDataURL("image/png");
  //       setCapturedImage(cropped);
  //     };
  //     handleStopCamera();
  //   }
  // };

  const handleCapture = () => {
  if (webcamRef.current) {
    const imageSrc = webcamRef.current.getScreenshot();
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Размер исходного изображения (в пикселях)
      const imgWidth = img.width;
      const imgHeight = img.height;

      // Пропорции рамки из CSS:
      const topOffset = 0.20;    // top: 20%
      const bottomOffset = 0.20; // bottom: 20%
      const leftOffset = 0.10;   // left: 10%
      const rightOffset = 0.10;  // right: 10%

      // Рассчитываем координаты рамки
      const x = imgWidth * leftOffset;
      const y = imgHeight * topOffset;
      const cropWidth = imgWidth * (1 - leftOffset - rightOffset);
      const cropHeight = imgHeight * (1 - topOffset - bottomOffset);

      // Размер итогового кадра (фиксированный для анализа)
      canvas.width = 120;
      canvas.height = 280;

      // Вырезаем нужную область
      ctx.drawImage(
        img,
        x,
        y,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const cropped = canvas.toDataURL("image/png");
      setCapturedImage(cropped);

      handleStopCamera();
    };
  }
};

  return (
    <div className={styles.container}>
      <div className={styles.wrapGreeting}>
        <p className={styles.greeting}>pH Scanner</p>
      </div>

      <div className={styles.wrapBtn}>
        {!isCameraOn && !capturedImage && (
          <button onClick={handleStartCamera} className={styles.btn}>
            Start Camera
          </button>
        )}

        {isCameraOn && (
          <>
            <button onClick={handleCapture} className={styles.btn}>
              Scan pH strip
            </button>
            <button onClick={handleStopCamera} className={styles.btn}>
              Stop
            </button>
          </>
        )}
      </div>

      {isCameraOn && (
        <div className={styles.webcamWrap}>
          <Webcam
            ref={webcamRef}
            audio={false}
            videoConstraints={videoConstraints}
            screenshotFormat="image/png"
            className={styles.webcam}
          />
          {/* Рамка для ориентира полоски */}
          {/* <div className={styles.overlay}>
            <div className={styles.frame}></div>
          </div> */}

          <div className={styles.overlay}>
            <div className={`${styles.corner} ${styles.topLeft}`}></div>
            <div className={`${styles.corner} ${styles.topRight}`}></div>
            <div className={`${styles.corner} ${styles.bottomLeft}`}></div>
            <div className={`${styles.corner} ${styles.bottomRight}`}></div>
          </div>

        </div>
      )}

      {capturedImage && (
        <div className={styles.capturedWrap}>
          <p>Captured (cropped) Image:</p>
          <img src={capturedImage} alt="pH strip" className={styles.capturedImg} />
          <button onClick={() => setCapturedImage(null)} className={styles.btn}>
            Retake
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

// ---------------------------------------

// import { useState, useRef } from "react";
// import Webcam from "react-webcam";
// import styles from "./App.module.css";

// function App() {
//   const [isCameraOn, setIsCameraOn] = useState(false);
//   const webcamRef = useRef(null);

//   const videoConstraints = {
//     facingMode: { ideal: "environment" },
//   };

//   return (
//     <div className={styles.container}>
//       {!isCameraOn ? (
//         <button onClick={() => setIsCameraOn(true)} className={styles.btn}>
//           Start Camera
//         </button>
//       ) : (
//         <div className={styles.webcamWrap}>
//           <Webcam
//             ref={webcamRef}
//             audio={false}
//             videoConstraints={videoConstraints}
//             screenshotFormat="image/png"
//             className={styles.webcam}
//           />

//           {/* Рамка с углами */}
//           <div className={styles.overlay}>
//             <div className={`${styles.corner} ${styles.topLeft}`}></div>
//             <div className={`${styles.corner} ${styles.topRight}`}></div>
//             <div className={`${styles.corner} ${styles.bottomLeft}`}></div>
//             <div className={`${styles.corner} ${styles.bottomRight}`}></div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
