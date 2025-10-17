import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";

import styles from "./PersonalData.module.css";

const PersonalData = () => {
    const { register, watch, setValue } = useForm();
    const { age, hormone = [], ancestral } = watch(); // Отслеживаем все поля

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

    const toggleHormoneDropdown = () => {
        setIsHormoneOpen((prev) => !prev);
    };

    // добавление/удаление выбранных гормонов

    // const handleHormoneChange = (value) => {
    //     const current = hormone || [];
    //     const updated = current.includes(value)
    //         ? current.filter((item) => item !== value)
    //         : [...current, value];
    //     setValue("hormone", updated);
    // };
    const handleHormoneChange = (value) => {
        const updated = hormone.includes(value)
            ? hormone.filter(item => item !== value)
            : [...hormone, value];
        setValue("hormone", updated);
    };

    // удалить гормон по клику на тег
    const handleRemoveHormone = (value) => {
        const updated = hormone.filter((item) => item !== value);
        setValue("hormone", updated);
    };

    // Закрытие при клике вне блока
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsHormoneOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // рекомендации
    const getRecommendation = () => {
        if (age === "18-24") {
            return "Your recommendation 18-24";
        } else if (age === "25-34") {
            return "Your recommendation 25-34";
        } else if (age === "35-44") {
            return "Your recommendation 35-44";
        } else if (age === "45-54") {
            return "Your recommendation 45-54";
        } else if (age === "55+") {
            return "Your recommendation 55+";
        }

    };

    return (
        <>
            <div className={styles.wrapper}>
                <h3 className={styles.heading}>Share data to get more personalised results (Optional)</h3>
                <div>
                    <form className={styles.form}>
                        <label className={styles.title} >Age Group
                            <select {...register("age")} className={styles.select}>
                                <option value="">Select age group</option>
                                <option value="18-24">18-24</option>
                                <option value="25-34">25-34</option>
                                <option value="35-44">35-44</option>
                                <option value="45-54">45-54</option>
                                <option value="55+">55+</option>
                            </select>
                        </label>

                        <label className={styles.title} ref={dropdownRef}>
                            Hormone Factors
                            <div
                                className={styles.select}
                                onClick={toggleHormoneDropdown}
                                tabIndex={0}
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
                                            <span>{option}</span>
                                            {hormone.includes(option) && (
                                                <span className={styles.checkmark}>✓</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* выбранные гормоны под инпутом */}
                            {hormone.length > 0 && (
                                <div className={styles.selectedList}>
                                    {hormone.map((h) => (
                                        <span key={h} className={styles.selectedTag}>
                                            {h}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {/* {(age || hormone.length > 0 || ancestral) && (
                                <div className={styles.wrapRecommendation}>
                                    <h3 className={styles.heading}>Personalized Insight</h3>
                                    <p className={styles.recommendation}>{getRecommendation()}</p>
                                </div>
                            )} */}
                        </label>

                    </form>
                </div>
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