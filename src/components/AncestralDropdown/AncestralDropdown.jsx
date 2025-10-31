import { useState, useRef, useEffect, memo } from "react";
import styles from "./AncestralDropdown.module.css";

const ancestralOptions = [
  "European",
  "Asian",
  "African",
  "Native American",
  "Other",
];

const AncestralDropdown = ({ isActive, ancestral, onChange, onRemove }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const toggle = () => isActive && setIsOpen((prev) => !prev);

  // Закрытие при клике вне
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Закрытие по Esc
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const displayText =
    ancestral.length === 0
      ? "Choose all that apply"
      : `${ancestral.length} selected`;

  return (
    <div className={styles.wrap} ref={containerRef}>
      <h4 className={styles.title}>Ancestral Background(s)</h4> 
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
          {ancestralOptions.map((option) => (
            <div
              key={option}
              className={styles.dropdownItem}
              onClick={() => onChange(option)}
            >
              <span
                className={`${styles.checkmarkLeft} ${
                  ancestral.includes(option) ? styles.visible : ""
                }`}
              >
                ✓
              </span>
              <span>{option}</span>
            </div>
          ))}
        </div>
      )}

      {ancestral.length > 0 && (
        <div className={styles.selectedList}>
          {ancestral.map((item) => (
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

export default memo(AncestralDropdown);
