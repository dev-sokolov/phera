import { useState, useRef, useEffect, memo } from "react";
import styles from "./Symptoms.module.css";

const symptomOptions = [
    "Fatigue",
    "Acne",
    "Irritability",
    "Headache",
    "Mood swings",
    "Hot flashes",
    "Insomnia",
    "Anxiety",
    "Bloating",
    "Cramps",
];

const Symptoms = ({ isActive }) => {
    const [inputValue, setInputValue] = useState("");
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [filteredSymptoms, setFilteredSymptoms] = useState(symptomOptions);
    const [isOpen, setIsOpen] = useState(false);

    const containerRef = useRef(null);

    useEffect(() => {
        const filtered = symptomOptions.filter(
            (s) =>
                s.toLowerCase().includes(inputValue.toLowerCase()) &&
                !selectedSymptoms.includes(s)
        );
        setFilteredSymptoms(filtered);
    }, [inputValue, selectedSymptoms]);

    // click out
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const handleSelectSymptom = (symptom) => {
        setSelectedSymptoms((prev) => [...prev, symptom]);
        setInputValue("");
        setIsOpen(false);
    };

    const handleRemoveSymptom = (symptom) => {
        setSelectedSymptoms((prev) => prev.filter((s) => s !== symptom));
    };

    const handleInputFocus = () => {
        if (isActive) setIsOpen(true);
    };

    return (
        <div className={styles.wrap} ref={containerRef}>
            <h4 className={styles.title}>Symptoms</h4>
            <input
                type="text"
                className={`${styles.input} ${!isActive ? styles.inputDisabled : ""}`}
                placeholder="Type to search symptoms"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={handleInputFocus}
                disabled={!isActive}
            />
            {isOpen && inputValue.trim().length > 0 && filteredSymptoms.length > 0 && (
                <div className={styles.dropdown}>
                    {filteredSymptoms.map((symptom) => (
                        <div
                            key={symptom}
                            className={styles.dropdownItem}
                            onClick={() => handleSelectSymptom(symptom)}
                        >
                            {symptom}
                        </div>
                    ))}
                </div>
            )}
            {selectedSymptoms.length > 0 && (
                <div className={styles.selectedList}>
                    {selectedSymptoms.map((symptom) => (
                        <span key={symptom} className={styles.selectedTag}>
                            {symptom}
                            <button
                                type="button"
                                className={styles.removeBtn}
                                onClick={() => handleRemoveSymptom(symptom)}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default memo(Symptoms);


