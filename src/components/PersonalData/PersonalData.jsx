import { useRef } from "react";
import AgeDropdown from "../AgeDropdown/AgeDropdown";
import HormoneDropdown from "../HormoneDropdown/HormoneDropdown";
import RecommendationBox from "../RecommendationBox/RecommendationBox";
import AncestralDropdown from "../AncestralDropdown/AncestralDropdown";
import Symptoms from "../Symptoms/Symptoms";

import styles from "./PersonalData.module.css";

const PersonalData = ({ isActive, age, setAge, hormone, setHormone, ancestral, setAncestral }) => {
    const dropdownRef = useRef(null);

    const handleHormoneChange = (value) => {
        setHormone((prev) =>
            prev.includes(value)
                ? prev.filter((h) => h !== value)
                : [...prev, value]
        );
    };

    const handleHormoneRemove = (value) => {
        setHormone((prev) => prev.filter((h) => h !== value));
    };

    const handleAncestralChange = (value) => {
        setAncestral((prev) =>
            prev.includes(value)
                ? prev.filter((h) => h !== value)
                : [...prev, value]
        );
    };

    const handleAncestralRemove = (value) => {
        setAncestral((prev) => prev.filter((h) => h !== value));
    };

    return (
        <>
            <div className={styles.wrapper} ref={dropdownRef}>
                <h3 className={styles.heading}>
                    Share data to get more personalised results (Optional)
                </h3>
                <form className={styles.form}>
                    <AgeDropdown isActive={isActive} age={age} onSelect={setAge} />
                    <HormoneDropdown
                        isActive={isActive}
                        hormone={hormone}
                        onChange={handleHormoneChange}
                        onRemove={handleHormoneRemove}
                    />
                    <AncestralDropdown
                        isActive={isActive}
                        ancestral={ancestral}
                        onChange={handleAncestralChange}
                        onRemove={handleAncestralRemove}
                    />
                    <Symptoms isActive={isActive}/>
                </form>
            </div>
            <RecommendationBox age={age} hormone={hormone} ancestral={ancestral} />
        </>
    );
};

export default PersonalData;