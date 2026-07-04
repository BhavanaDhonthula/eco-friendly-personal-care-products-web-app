function calculateSpecificationsScore(category, specifications = []) {
  // Normalize inputs
  category = category.toLowerCase().trim();

  specifications = specifications.map((spec) => spec.toLowerCase().trim());

  const universalSpecs = {
    vegan: 2,
    "cruelty free": 2,
    "chemical free": 2,
    "natural ingredients": 2,
    "paraben free": 2,
    "sulfate free": 2,
    "silicone free": 2,
    "alcohol free": 2,
    "no synthetic fragrance": 2,
    "eco friendly design": 2,
    "biodegradable handle": 3,
  };

  const categoryRules = {
    "oral care": {
      "fluoride free": 3,
      "natural whitening": 3,
      "fresh breath protection": 3,
      "fresh breath": 2,
      "gum friendly": 3,
      "gum protection": 3,
      "daily oral care": 2,
      "daily oral hygiene": 2,
      "natural oral care": 3,
      "traditional blend": 2,
      "eco friendly formula": 2,
      "sustainable oral care": 3,
    },

    "hair care": {
      "anti dandruff": 3,
      "hair strengthening": 3,
      "herbal formula": 3,
      "herbal infusion": 2,
      "nourishing scalp care": 3,
      "suitable for all hair types": 2,
      "frizz control": 2,
      "deep conditioning": 3,
      "hair refreshing spray": 2,
      "shine enhancing": 2,
      "ph balanced": 2,
    },

    "skin care": {
      "oil control": 3,
      "deep cleansing": 3,
      "pore purifying": 3,
      "acne care support": 3,
      "glow enhancing": 2,
      "dermatologically tested": 3,
      "hydrating formula": 2,
      "gentle exfoliation": 2,
      "brightening support": 2,
      "daily skincare": 2,
      "weekly skincare": 1,
    },

    "body care": {
      "deep moisturizing": 3,
      "long lasting hydration": 3,
      "moisturizing formula": 3,
      "suitable for dry skin": 3,
      "quick absorption": 2,
      "smooth finish": 2,
      "non greasy texture": 2,
      "daily use": 1,
      "suitable for sensitive skin": 3,
    },

    "hygiene & welness": {
      "stress relief support": 3,
      "relaxation support": 3,
      "relaxing aroma": 2,
      "aromatic blend": 2,
      "bedtime support": 2,
      "mineral rich": 2,
      "wellness support": 3,
      "fresh fragrance": 1,
      "daily hygiene care": 2,
      "skin friendly": 2,
      "easy dissolving": 2,
      "relaxing experience": 3,
      "suitable for bath therapy": 3,
    },
  };

  let score = 0;

  // Universal specifications
  specifications.forEach((spec) => {
    score += universalSpecs[spec] || 0;
  });

  // Category-specific specifications
  const rules = categoryRules[category] || {};

  specifications.forEach((spec) => {
    score += rules[spec] || 0;
  });

  return Math.min(score, 25);
}

export default calculateSpecificationsScore;
