const getEcoScoreCaption = (score) => {
  if (score >= 80) {
    return "Exceptional sustainability and eco-friendly performance.";
  } else if (score >= 60 && score < 80) {
    return "Good environmental impact with sustainable features.";
  } else if (score >= 40 && score < 60) {
    return "Moderate sustainability with room for improvement.";
  } else {
    return "Lower eco-friendliness compared to sustainable alternatives.";
  }
};

export default getEcoScoreCaption;
