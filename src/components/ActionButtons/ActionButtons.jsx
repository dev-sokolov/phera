import React, { useRef } from "react";
import JSZip from "jszip";
import importSvg from "../../assets/icons/importSvg.svg";
import exportSvg from "../../assets/icons/exportSvg.svg";
import talk from "../../assets/icons/talk.svg";
import checkedYes from "../../assets/icons/checkedYes.svg";
import checkedNo from "../../assets/icons/checkedNo.svg";
import styles from "./ActionButtons.module.css";

const ActionButtons = ({ phValue, date, confidence, isDataSharingActive, setIsDataSharingActive }) => {
const fileInputRef = useRef(null);

// Asynchronous export, does not block the UI
const handleExportZip = () => {  
    setTimeout(async () => {  
        try {  
            const data = { phValue, date, confidence: Number(confidence) };  
            if (typeof data.phValue !== "number" || typeof data.date !== "string" || typeof data.confidence !== "number") {  
                alert("Incorrect file format");  
                return;  
            }  
            const zip = new JSZip();  
            zip.file("ph_results.json", JSON.stringify(data, null, 2));  
            const content = await zip.generateAsync({ type: "blob" });  
            const link = document.createElement("a");  
            link.href = URL.createObjectURL(content);  
            link.download = "ph_results.zip";  
            link.click();  
            URL.revokeObjectURL(link.href);  
        } catch (err) {  
            console.error("ZIP export error", err);  
            alert("Failed to export results.");  
        }  
    }, 0);  
};  

const handleImportClick = () => { fileInputRef.current.click(); };  

const handleFileChange = (event) => {  
    const file = event.target.files[0];  
    if (!file) return;  
    if (!file.name.toLowerCase().endsWith(".json")) { alert("Please select a JSON file"); return; }  

    setTimeout(() => {  
        const reader = new FileReader();  
        reader.onload = (e) => {  
            try {  
                const data = JSON.parse(e.target.result);  
                if (typeof data.phValue !== "number" || typeof data.date !== "string" || typeof data.confidence !== "number") {  
                    alert("Invalid JSON format");  
                    return;  
                }  
                console.log("Imported data:", data);  
            } catch (err) {  
                console.error("File read error", err);  
            }  
        };  
        reader.readAsText(file);  
    }, 0);  
};  

const handleTalkToDoctor = () => { window.open("https://phera.digital/doctor", "_blank"); };  

return (  
    <div className={styles.wrapBtn}>  
        <button className={styles.btn} onClick={handleExportZip}>  
            <div className={styles.icon}><img src={exportSvg} alt="export" /></div>  
            Export Results  
        </button>  

        <button className={styles.btn} onClick={handleImportClick}>  
            <div className={styles.icon}><img src={importSvg} alt="import" /></div>  
            Import Results  
        </button>  

        <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".json" onChange={handleFileChange} />  

        <button className={styles.btn} onClick={() => setIsDataSharingActive(prev => !prev)}>  
            <div className={styles.icon}><img src={isDataSharingActive ? checkedYes : checkedNo} alt="check" /></div>  
            Share Data  
        </button>  

        <button className={styles.btn} onClick={handleTalkToDoctor}>  
            <div className={styles.icon}><img src={talk} alt="talk to a Doctor" /></div>  
            Talk to a Doctor  
        </button>  
    </div>  
);  

};

export default ActionButtons;