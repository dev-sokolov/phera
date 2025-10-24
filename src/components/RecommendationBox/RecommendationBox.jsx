import styles from "./RecommendationBox.module.css";

const RecommendationBox = ({ age, hormone, ancestral }) => {
  const getRecommendation = () => {
    if (age === "18-24") return "Your recommendation 18-24";
    if (age === "25-34") return "Your recommendation 25-34";
    if (age === "35-44") return "Your recommendation 35-44";
    if (age === "45-54") return "Your recommendation 45-54";
    if (age === "55+") return "Your recommendation 55+";
  };

  if (!(age || (hormone && hormone.length > 0) || ancestral)) return null;

  return (
    <div className={styles.wrapRecommendation}>
      <h3 className={styles.heading}>Personalized Insight</h3>
      <p className={styles.recommendation}>{getRecommendation()}</p>
    </div>
  );
};

export default RecommendationBox;