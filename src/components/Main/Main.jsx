import qr from "../../assets/icons/qr.svg";
import privacy from "../../assets/icons/privacy.svg";
import insights from "../../assets/icons/insights.svg";

import styles from "./Main.module.css";

const Main = ({ handleStartCamera }) => {
    return (
        <>
            <main>
                <div className={styles.heading}>
                    <h1 className={styles.title}>Vaginal Health, <span>Simplified</span></h1>
                    <p className={styles.subtitle}>Quick, private pH testing right from your phone. No lab visits, no waiting.</p>
                    <div className={styles.wrapBtn}>
                        <button className={styles.btn} onClick={handleStartCamera}>Tty Demo</button>
                        <button className={styles.btnTransparent}>Learn More</button>
                    </div>
                </div>
                <div className={styles.info}>
                    <div className={styles.block}>
                        <div className={styles.blockItem}>
                            <div className={styles.iconWrap}>
                                <div className={styles.icon}>
                                    <img src={qr} alt="qr-code" />
                                </div>
                            </div>
                            <h4>Instant Results</h4>
                            <p>Scan the QR code on your test kit and get results in seconds using your phone camera.</p>
                        </div>
                        <div className={styles.blockItem}>
                            <div className={styles.iconWrap}>
                                <div className={styles.icon}>
                                    <img src={privacy} alt="privacy" />
                                </div>
                            </div>
                            <h4>Privacy First</h4>
                            <p>All processing happens on your device. No images are uploaded or stored anywhere.</p>
                        </div>
                        <div className={styles.blockItem}>
                            <div className={styles.iconWrap}>
                                <div className={styles.icon}>
                                    <img src={insights} alt="insights" />
                                </div>
                            </div>
                            <h4>Personalized Insights</h4>
                            <p>Optional context helps tailor guidance to your unique situation and life stage.</p>
                        </div>
                    </div>
                </div>
                <div className={styles.description}>
                    <h3>How it works</h3>
                    <div className={styles.list}>
                        <div className={styles.item}>
                            <div className={styles.number}><span>1</span></div>
                            <div>
                                <h4>Scan your kit</h4>
                                <p>Use your phone to scan the QR code on your pHera test kit.</p>
                            </div>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.number}><span>2</span></div>
                            <div>
                                <h4>Allow Camera Access</h4>
                                <p>Grant one-time camera permission to read your test card.</p>
                            </div>
                        </div>
                        <div className={styles.item}>
                            <div className={styles.number}><span>3</span></div>
                            <div>
                                <h4>Get Your Results</h4>
                                <p>See your pH reading instantly with personalized guidance and export options.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
};

export default Main;

