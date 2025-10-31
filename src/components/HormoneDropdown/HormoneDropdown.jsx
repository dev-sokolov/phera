import { useState, useRef, useEffect, memo } from "react";
import styles from "./HormoneDropdown.module.css";

const hormoneOptions = [
  "Estrogen",
  "Progesterone",
  "Testosterone",
  "Cortisol",
  "Thyroid hormones",
];

const HormoneDropdown = ({ isActive, hormone, onChange, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const toggle = () => isActive && setIsOpen((prev) => !prev);

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

  // click Escape
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const displayText = hormone.length === 0 ? "Choose all that apply" : `${hormone.length} selected`;

  return (
    <div className={styles.wrap} ref={containerRef}>
      <h4 className={styles.title}>Hormone Status</h4>
      <div
        className={`${styles.select} ${!isActive ? styles.selectDisabled : ""}`}
        onClick={toggle}
        tabIndex={isActive ? 0 : -1}
      >
        {displayText}
        <span className={styles.arrow}>{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {hormoneOptions.map((option) => (
            <div
              key={option}
              className={styles.dropdownItem}
              onClick={() => onChange(option)}
            >
              <span
                className={`${styles.checkmarkLeft} ${hormone.includes(option) ? styles.visible : ""}`}>
                ✓
              </span>
              <span>{option}</span>
            </div>
          ))}
        </div>
      )}

      {hormone.length > 0 && (
        <div className={styles.selectedList}>
          {hormone.map((item) => (
            <span key={item} className={styles.selectedTag}>
              {item}
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => onRemove(item)}
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

export default memo(HormoneDropdown);
