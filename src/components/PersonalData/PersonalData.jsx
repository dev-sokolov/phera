import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";

import styles from "./PersonalData.module.css";

const PersonalData = ({ isActive }) => {
    const { register, watch, setValue } = useForm();
    const { age, hormone = [], ancestral } = watch(); // Отслеживаем все поля

    const [isAgeOpen, setIsAgeOpen] = useState(false);
    const [isHormoneOpen, setIsHormoneOpen] = useState(false); // состояние открытия списка
    const dropdownRef = useRef(null);

    // массив всех вариантов гормонов
    const hormoneOptions = [
        "Estrogen",
        "Progesterone",
        "Testosterone",
        "Cortisol",
        "Thyroid hormones",
    ];

    const ageOptions = ["18-24", "25-34", "35-44", "45-54", "55+"];

    // ▼ Тогглы
    const toggleAgeDropdown = () => {
        setIsAgeOpen((prev) => {
            const newState = !prev;
            if (newState) setIsHormoneOpen(false); // закрыть гормоны
            return newState;
        });
    };

    const toggleHormoneDropdown = () => {
        setIsHormoneOpen((prev) => {
            const newState = !prev;
            if (newState) setIsAgeOpen(false); // закрыть age
            return newState;
        });
    };

    // добавление/удаление выбранных гормонов

    const handleHormoneChange = (value) => {
        const updated = hormone.includes(value)
            ? hormone.filter(item => item !== value)
            : [...hormone, value];
        setValue("hormone", updated);
    };

    const handleAgeSelect = (value) => {
        setValue("age", value);
        setIsAgeOpen(false);
    };

    // удалить гормон по клику на тег
    const handleRemoveHormone = (value) => {
        const updated = hormone.filter((item) => item !== value);
        setValue("hormone", updated);
    };

    useEffect(() => {
        const handleClick = (event) => {
            const container = dropdownRef.current;
            if (!container) return;

            const clickedInside = container.contains(event.target);
            if (!clickedInside) {
                setIsAgeOpen(false);
                setIsHormoneOpen(false);
                return;
            }

            const isDropdown = event.target.closest('[class*="dropdown"]');
            const isSelect = event.target.closest('[class*="select"]');

            if (!isDropdown && !isSelect) {
                setIsAgeOpen(false);
                setIsHormoneOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // рекомендации
    const getRecommendation = () => {
        if (age === "18-24") return "Your recommendation 18-24";
        if (age === "25-34") return "Your recommendation 25-34";
        if (age === "35-44") return "Your recommendation 35-44";
        if (age === "45-54") return "Your recommendation 45-54";
        if (age === "55+") return "Your recommendation 55+";
    };

    return (
        <>
            <div className={styles.wrapper} ref={dropdownRef}>
                <h3 className={styles.heading}>Share data to get more personalised results (Optional)</h3>
                <form className={styles.form}>
                    {/* AGE GROUP */}
                    <label className={styles.title}>
                        Age Group
                        <div
                            // className={styles.select}
                            // onClick={toggleAgeDropdown}
                            className={`${styles.select} ${!isActive ? styles.selectDisabled : ""}`}
                            onClick={isActive ? toggleAgeDropdown : undefined}
                            tabIndex={isActive ? 0 : -1}
                        >
                            {age || "Select age group"}
                            <span className={styles.arrow}>{isAgeOpen ? "▲" : "▼"}</span>
                        </div>

                        {isAgeOpen && (
                            <div className={styles.dropdown}>
                                {ageOptions.map((option) => (
                                    <div
                                        key={option}
                                        className={styles.dropdownItem}
                                        onClick={() => handleAgeSelect(option)}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </label>

                    {/* HORMONE FACTORS */}
                    <label className={styles.title}>
                        Hormone Status
                        <div
                            // className={styles.select}
                            // onClick={toggleHormoneDropdown}
                            // tabIndex={0}
                            className={`${styles.select} ${!isActive ? styles.selectDisabled : ""}`}
                            onClick={isActive ? toggleHormoneDropdown : undefined}
                            tabIndex={isActive ? 0 : -1}
                        >
                            Select hormone factors
                            <span className={styles.arrow}>{isHormoneOpen ? "▲" : "▼"}</span>
                        </div>

                        {isHormoneOpen && (
                            <div className={styles.dropdown}>
                                {hormoneOptions.map((option) => (
                                    <div
                                        key={option}
                                        className={styles.dropdownItem}
                                        onClick={() => handleHormoneChange(option)}
                                    >
                                        <span
                                            className={`${styles.checkmarkLeft} ${hormone.includes(option) ? styles.visible : ""
                                                }`}
                                        >
                                            ✓
                                        </span>
                                        <span>{option}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </label>

                    {/* выбранные гормоны под инпутом */}
                    {hormone.length > 0 && (
                        <div className={styles.selectedList}>
                            {hormone.map((item) => (
                                <span key={item} className={styles.selectedTag}>
                                    {item}
                                    <button
                                        type="button"
                                        className={styles.removeBtn}
                                        onClick={() => handleRemoveHormone(item)}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                </form>
            </div>
            {(age || (hormone && hormone.length > 0) || ancestral) && (
                <div className={styles.wrapRecommendation}>
                    <h3 className={styles.heading}>Personalized Insight</h3>
                    <p className={styles.recommendation}>{getRecommendation()}</p>
                </div>
            )}
        </>
    )
};

export default PersonalData;