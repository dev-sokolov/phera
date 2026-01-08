import { useLocation, Navigate } from "react-router-dom";
import { useState } from "react";

import PersonalData from "../../components/PersonalData/PersonalData";
import icon_clock from "../../assets/icons/icon_clock.svg";
import ActionButtons from "../../components/ActionButtons/ActionButtons";

import styles from "./ResultPage.module.css";

const ResultPage = () => {
    const { state } = useLocation();
    if (!state || !state.phValue || !state.date || !state.confidence) {
        return <Navigate to="/" replace />;
    }
    console.log("Данные с камеры:", state);
    const { phValue, date, confidence } = state;
    const value = Number(phValue);
    const safePh = isNaN(value) ? "N/A" : value;
    console.log(`phValue: ${safePh}, date: ${date}, confidence: ${confidence}`);

    const [isDataSharingActive, setIsDataSharingActive] = useState(false);
    const [age, setAge] = useState("");
    const [hormone, setHormone] = useState([]);
    const [ancestral, setAncestral] = useState([]);

    return (
        <div className={`${styles.wrapResultPage} ${styles.fadeIn}`}>
            <div className={styles.content}>
                <div className={styles.ph}>
                    <p className={styles.phTitle}>Your pH</p>
                    <p className={styles.phValue}>{safePh}</p>
                    <div className={styles.phInfo}>
                        <div className={styles.clock}><img src={icon_clock} alt="clock" /></div>
                        <div className={styles.date}>{date}</div>
                        <div className={styles.phConfidence}>
                            <div>{confidence}<span>% Confidence</span></div>
                        </div>
                    </div>
                </div>

                <div className={styles.phDescription}>
                    <h3>What This Means</h3>
                    <p>Your pH is within the typical acidic range associated with Lactobacillus dominance.</p>
                </div>

                <div className={styles.processingResults}>
                    <ActionButtons
                        phValue={safePh}
                        date={date}
                        confidence={confidence}
                        isDataSharingActive={isDataSharingActive}
                        setIsDataSharingActive={setIsDataSharingActive}
                    />
                </div>

                <div className={styles.personalData}>
                    <PersonalData
                        isActive={isDataSharingActive}
                        age={age}
                        setAge={setAge}
                        hormone={hormone}
                        setHormone={setHormone}
                        ancestral={ancestral}
                        setAncestral={setAncestral}
                    />
                </div>
            </div>

            <div className={styles.footer}>
                Privacy: Frames are processed in memory and discarded. Results are not saved unless you export.
            </div>
        </div>
    );
};

export default ResultPage;
