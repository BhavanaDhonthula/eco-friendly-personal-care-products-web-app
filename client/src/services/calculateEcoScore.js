import calculateSpecificationsScore from "../../../client/src/services/calculateSpecificationsScore";

const calculateEcoScore = (productDetails) => {
  const {
    ingredientType,
    packagingType,
    carbonFootprint,
    specifications,
    category,
  } = productDetails;

  // console.log(specifications);

  let ingredientTypeScore = 0;
  let packagingTypeScore = 0;
  let carbonFootprintScore = 0;
  let specificationsScore = 0;

  // IngredientType Scoring start //
  const ingredientScores = {
    Organic: 25,
    "Most Natural": 20,
    "Harbal Extracts": 10,
    "Essential Oils": 15,
  };
  ingredientTypeScore = ingredientScores[ingredientType] || 0;
  // IngredientType Scoring end  //

  // PackagingType Scoring start //

  const packagingScores = {
    Refillable: 22,
    Reusable: 20,
    Glass: 16,
    Biodegradable: 18,
    Recyclable: 12,
    "Paper&Cardboard": 10,
    Bamboo: 15,
    "Zero Waste": 25,
  };

  packagingTypeScore = packagingScores[packagingType] || 0;

  // PackagingType Scoring end //

  //CarbonFootprint Scoring start

  if (carbonFootprint <= 0.5) carbonFootprintScore = 25;
  else if (carbonFootprint <= 1) carbonFootprintScore = 23;
  else if (carbonFootprint <= 1.5) carbonFootprintScore = 21;
  else if (carbonFootprint <= 2) carbonFootprintScore = 18;
  else if (carbonFootprint <= 2.5) carbonFootprintScore = 15;
  else if (carbonFootprint <= 3) carbonFootprintScore = 12;
  else if (carbonFootprint <= 4) carbonFootprintScore = 8;
  else if (carbonFootprint <= 5) carbonFootprintScore = 5;

  //CarbonFootprint Scoring end

  //Specifications Scoring start

  specificationsScore = calculateSpecificationsScore(category, specifications);
  // console.log(specificationsScore);

  let allScores = {
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

  return allScores;
};

//Specifications Scoring end

export default calculateEcoScore;
