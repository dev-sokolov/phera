import { useLocation, useNavigate } from "react-router-dom";
import JSZip from "jszip";
import { useState, useRef, useEffect } from "react";

import PersonalData from "../../components/PersonalData/PersonalData";
// import Button from "../../components/Button/Button";

import styles from "./ResultPage.module.css";

const ResultPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [isDataSharingActive, setIsDataSharingActive] = useState(false);

    const [age, setAge] = useState("");
    const [hormone, setHormone] = useState([]);
    const [ancestral, setAncestral] = useState("");

    // Получаем переданные данные
    const { capturedImage } = location.state || {}; //////////////////////////

    useEffect(() => {
        if (!capturedImage) {
            navigate("/", { replace: true });
        }
    }, [capturedImage, navigate]);

    const handleExportZip = async () => {
        // 1. Данные для экспорта
        const data = {
            phValue: 4.3,
            date: "15.10.2025, 20:12:09",
            confidence: "98%",
        };

        // 2. Преобразуем в JSON
        const json = JSON.stringify(data, null, 2);

        // 3. Создаем ZIP
        const zip = new JSZip();
        zip.file("ph_results.json", json); // добавляем файл в архив

        // 4. Генерируем ZIP как Blob
        const content = await zip.generateAsync({ type: "blob" });

        // 5. Создаем ссылку и скачиваем
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "ph_results.zip"; // имя архива
        link.click();

        // 6. Очищаем объект URL
        URL.revokeObjectURL(link.href);
    };

    const handleImportClick = () => {
        fileInputRef.current.click(); // имитация нажатия на скрытый input
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Проверяем расширение файла на всякий случай
        if (!file.name.endsWith(".json")) {
            alert("Пожалуйста, выберите файл формата JSON");
            return;
        }

        // Чтение файла (например, JSON)
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const data = JSON.parse(content);
                // Здесь можно обновить состояние или что-то сделать с данными
            } catch (err) {
                console.error("Ошибка при чтении файла", err);
            }
        };
        reader.readAsText(file);
    };

    const handleTalkToDoctor = () => {
        window.open("https://phera.digital/doctor", "_blank");
    };

    return (
        <div className={styles.wrapResultPage}>
            <div className={styles.content}>
                <div className={styles.ph}>
                    <p className={styles.phTitle}>Your pH</p>
                    <p className={styles.phValue}>4.3</p>
                    <div className={styles.phInfo}>
                        <div>clock</div>
                        <div>15.10.2025, 20:12:09</div>
                        <div className={styles.phConfidence}>
                            <div>98%</div>
                            <div>Confidence</div>
                        </div>
                    </div>
                </div>
                <div className={styles.phDescription}>
                    <h3>What This Means</h3>
                    <p>Your pH is within the typical acidic range associated with Lactobacillus dominance.</p>
                </div>
                <div className={styles.processingResults}>
                    <div className={styles.btnsBlock}>
                        <button className={styles.btn} onClick={handleExportZip}>Export Results</button>
                        <button className={styles.btn} onClick={handleImportClick}>Import Results</button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            accept=".json" // разрешаем только JSON-файлы 
                            onChange={handleFileChange}
                        />
                        {/* <button className={styles.btn}  onClick={() => setIsDataSharingActive(true)}>Share Data</button> */}
                        <button
                            className={`${styles.btn} ${styles.btnShare} ${isDataSharingActive ? styles.btnActive : ""}`}
                            onClick={() => setIsDataSharingActive(prev => !prev)}
                        >
                            Share Data
                        </button>
                        <button className={styles.btn} onClick={handleTalkToDoctor}>Talk to a Doctor</button>
                    </div>
                </div>
                <div className={styles.personalData}> <PersonalData
                    isActive={isDataSharingActive}
                    age={age}
                    setAge={setAge}
                    hormone={hormone}
                    setHormone={setHormone}
                    ancestral={ancestral}
                    setAncestral={setAncestral} />
                </div>
            </div>
        </div>
    );
};

export default ResultPage;