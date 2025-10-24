import { useNavigate } from "react-router-dom";

import styles from "./NotFoundPage.module.css";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <div className={styles.box}>
        <h1>404</h1>
        <p>Oops! Page not found</p>
        <button className={styles.returnButton} onClick={() => navigate("/")}>
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;