import styles from "./Button.module.css";

const Button = ({onClick, children}) => {
    return (
        <button type="button" onClick={onClick} className={styles.btn}>
            {children}
        </button>
    )
};

export default Button;