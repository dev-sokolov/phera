import { useNavigate, useLocation } from "react-router-dom";
import JSZip from "jszip";
import { useState, useRef } from "react";

import PersonalData from "../../components/PersonalData/PersonalData";
import importSvg from "../../assets/icons/importSvg.svg";
import exportSvg from "../../assets/icons/exportSvg.svg";
import talk from "../../assets/icons/talk.svg";
import checkedYes from "../../assets/icons/checkedYes.svg";
import checkedNo from "../../assets/icons/checkedNo.svg";
import icon_clock from "../../assets/icons/icon_clock.svg";

import styles from "./ResultPage.module.css";

const ResultPage = () => {
    const { state } = useLocation();
    console.log("📸 Данные с камеры:", state);
    const { phValue, date, confidence } = state;
    console.log(`phValue: ${phValue}, date: ${date}, confidence: ${confidence}`);

    // дальше можно использовать state.phValue, state.image и т.д.
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [isDataSharingActive, setIsDataSharingActive] = useState(false);
    const [age, setAge] = useState("");
    const [hormone, setHormone] = useState([]);
    const [ancestral, setAncestral] = useState("");

    //  Экспорт ZIP
    const handleExportZip = async () => {
        const data = {
            phValue: phValue,
            date: date,
            confidence: confidence
        };

        const json = JSON.stringify(data, null, 2);
        const zip = new JSZip();
        zip.file("ph_results.json", json);

        const content = await zip.generateAsync({ type: "blob" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "ph_results.zip";
        link.click();

        URL.revokeObjectURL(link.href);
    };

    //  Импорт JSON
    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith(".json")) {
            alert("Пожалуйста, выберите файл формата JSON");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const data = JSON.parse(content);
                console.log("Импортированные данные:", data);
            } catch (err) {
                console.error("Ошибка при чтении файла", err);
            }
        };
        reader.readAsText(file);
    };

    // 👩‍⚕️ Переход к врачу
    const handleTalkToDoctor = () => {
        window.open("https://phera.digital/doctor", "_blank");
    };

    return (
        <div className={`${styles.wrapResultPage} ${styles.fadeIn}`}>
            <div className={styles.content}>
                {/* pH результат */}
                <div className={styles.ph}>
                    <p className={styles.phTitle}>Your pH</p>
                    <p className={styles.phValue}>{state.phValue}</p>
                    <div className={styles.phInfo}>
                        <div className={styles.clock}><img src={icon_clock} alt="clock" /></div>
                        <div className={styles.date}>{state.date}</div>
                        <div className={styles.phConfidence}>
                            <div>{state.confidence}<span>% Confidence</span></div>
                        </div>
                    </div>
                </div>

                {/* Описание */}
                <div className={styles.phDescription}>
                    <h3>What This Means</h3>
                    <p>Your pH is within the typical acidic range associated with Lactobacillus dominance.</p>
                </div>

                {/* Кнопки */}
                <div className={styles.processingResults}>
                    <div className={styles.wrapBtn}>
                        <button className={styles.btn} onClick={handleExportZip}>
                            <div className={styles.icon}>
                                <img src={exportSvg} alt="export" />
                            </div>
                            Export Results
                        </button>

                        <button className={styles.btn} onClick={handleImportClick}>
                            <div className={styles.icon}>
                                <img src={importSvg} alt="import" />
                            </div>
                            Import Results
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept=".json"
                            onChange={handleFileChange}
                        />

                        <button
                            className={styles.btn}
                            onClick={() => setIsDataSharingActive((prev) => !prev)}
                        >
                            <div className={styles.icon}>
                                <img
                                    src={isDataSharingActive ? checkedYes : checkedNo}
                                    alt="check"
                                />
                            </div>
                            Share Data
                        </button>

                        <button className={styles.btn} onClick={handleTalkToDoctor}>
                            <div className={styles.icon}>
                                <img src={talk} alt="talk to a Doctor" />
                            </div>
                            Talk to a Doctor
                        </button>
                    </div>
                </div>

                {/* Персональные данные */}
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

            {/* Footer */}
            <div className={styles.footer}>
                Privacy: Frames are processed in memory and discarded. Results are not saved unless you export.
            </div>
        </div>
    );
};

export default ResultPage;