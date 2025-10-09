import Button from "../Button/Button";

import styles from "./CapturedImage.module.css";

const CapturedImage = ({src, handleStartCamera, handleReset}) => {
    return (
        <>
            <div className={styles.capturedWrap}>
                <img src={src} alt="pH strip" className={styles.capturedImg} />
            </div>
            <div className={styles.wrapBtn}>
                <Button onClick={handleStartCamera}>Retake</Button>
                <Button onClick={handleReset}>Home</Button>
            </div>
        </>
    )
}

export default CapturedImage;