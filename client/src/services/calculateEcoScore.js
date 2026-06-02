const calculateEcoScore = (productDetails) => {
  const { ingredientType, packagingType, carbonFootprint, specifications } =
    productDetails;

  // console.log(specifications);

  let ingredientTypeScore = 0;
  let packagingTypeScore = 0;
  let carbonFootprintScore = 0;
  let specificationsScore = 0;

  // IngredientType Scoring start //
  const ingredientScores = {
    Organic: 30,
    "Most Natural": 25,
    "Herbal Extracts": 25,
    "Essential Oils": 20,
  };
  ingredientTypeScore = ingredientScores[ingredientType] || 0;
  // IngredientType Scoring end  //

  // PackagingType Scoring start //

  const packagingScores = {
    Refillable: 25,
    Reusable: 23,
    Glass: 22,
    Biodegradable: 22,
    Recyclable: 20,
    "Paper&Cardboard": 18,
    Bamboo: 20,
    "Zero-Waste": 25,
  };

  packagingTypeScore = packagingScores[packagingType] || 0;

  // PackagingType Scoring end //

  //CarbonFootprint Scoring start
  if (carbonFootprint <= 1) carbonFootprintScore = 25;
  else if (carbonFootprint <= 2) carbonFootprintScore = 20;
  else if (carbonFootprint <= 3) carbonFootprintScore = 15;
  else if (carbonFootprint <= 5) carbonFootprintScore = 10;
  else carbonFootprintScore = 5;

  //CarbonFootprint Scoring start

  //Specifications Scoring start

  const specs = specifications.map((s) => s.trim().toLowerCase());

  const highValueSpecs = {
    vegan: 3,
    "cruelty free": 3,
    "cruelty-free": 3,
    "chemical free": 3,
    "chemical-free": 3,
    "paraben free": 3,
    "paraben-free": 3,
    "sulfate free": 3,
    "sulfate-free": 3,
    "silicone free": 3,
    "silicone-free": 3,
    "fluoride free": 3,
    "fluoride-free": 3,
    "eco friendly": 3,
    "eco-friendly": 3,
    "biodegradable handle": 3,
    "natural ingredients": 2,
    "herbal formula": 2,
    "herbal blend": 2,
  };

  const mediumValueSpecs = {
    "dermatologically tested": 1,
    "ph balanced": 1,
    "daily use": 1,
    "lightweight formula": 1,
    "quick absorption": 1,
    "oil control": 1,
    "anti dandruff": 1,
    "deep moisturizing": 1,
    "long lasting hydration": 1,
    "gum friendly": 1,
    "natural whitening": 1,
    "fresh breath protection": 1,
    "suitable for sensitive skin": 1,
    "suitable for dry skin": 1,
    "suitable for all hair types": 1,
  };

  specs.forEach((spec) => {
    specificationsScore += highValueSpecs[spec] || 0;
    specificationsScore += mediumValueSpecs[spec] || 0;
  });

  specificationsScore = Math.min(specificationsScore, 20);

  return {
    ingredientTypeScore,
    packagingTypeScore,
    carbonFootprintScore,
    specificationsScore,
    ecoScore:
      ingredientTypeScore +
      packagingTypeScore +
      carbonFootprintScore +
      specificationsScore,
  };
};

//Specifications Scoring end

export default calculateEcoScore;
