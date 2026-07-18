// ── Seller eco-verification scoring ──────────────────────────────────────────
// A rule-based, self-declared checklist a seller fills in at registration.
// It mirrors the product-level eco-score already used on the storefront
// (client/src/services/calculateEcoScore.js), but scores the *seller's
// business practices* instead of a single product, so customers/admins can
// tell a genuinely eco-focused seller apart from a standard one before any
// products have even been listed.
//
// This is not a legal/official certification check - it's a good-faith
// screening signal based on what the seller self-reports. Sellers who claim
// recognized third-party certifications are weighted higher than those who
// don't, since those can be independently audited after the fact.

const businessTypeScores = {
  "Certified Organic Manufacturer": 20,
  "Handmade / Artisan": 15,
  Manufacturer: 12,
  Reseller: 6,
  Distributor: 6,
};

const packagingCommitmentScores = {
  "Plastic-Free": 20,
  Biodegradable: 17,
  Recyclable: 12,
  Standard: 0,
};

const sourcingPracticeScores = {
  "Organic / Sustainably Farmed": 20,
  "Locally Sourced": 15,
  "Upcycled / Recycled Materials": 15,
  Standard: 0,
};

// Recognized third-party sustainability certifications. Each one adds points,
// capped so no single seller can max the score on certifications alone.
const certificationPoints = {
  "USDA Organic": 8,
  Ecocert: 8,
  "GOTS Certified": 8,
  "Fair Trade Certified": 7,
  "Leaping Bunny (Cruelty-Free)": 7,
  "FSC Certified": 6,
  "B Corp Certified": 8,
};
const MAX_CERTIFICATION_SCORE = 25;

const CARBON_NEUTRAL_SHIPPING_SCORE = 15;

const calculateSellerEcoScore = (sellerDetails) => {
  const {
    businessType,
    packagingCommitment,
    sourcingPractice,
    sustainabilityCertifications = [],
    carbonNeutralShipping,
  } = sellerDetails;

  const businessTypeScore = businessTypeScores[businessType] || 0;
  const packagingScore = packagingCommitmentScores[packagingCommitment] || 0;
  const sourcingScore = sourcingPracticeScores[sourcingPractice] || 0;

  const certificationScore = Math.min(
    sustainabilityCertifications.reduce(
      (total, cert) => total + (certificationPoints[cert] || 0),
      0,
    ),
    MAX_CERTIFICATION_SCORE,
  );

  const carbonScore = carbonNeutralShipping ? CARBON_NEUTRAL_SHIPPING_SCORE : 0;

  const ecoVerificationScore =
    businessTypeScore +
    packagingScore +
    sourcingScore +
    certificationScore +
    carbonScore;

  let ecoVerificationStatus;
  if (ecoVerificationScore >= 70) {
    ecoVerificationStatus = "Verified Eco Seller";
  } else if (ecoVerificationScore >= 35) {
    ecoVerificationStatus = "Eco-Conscious Seller";
  } else {
    ecoVerificationStatus = "Not Verified";
  }

  return {
    businessTypeScore,
    packagingScore,
    sourcingScore,
    certificationScore,
    carbonScore,
    ecoVerificationScore,
    ecoVerificationStatus,
  };
};

module.exports = calculateSellerEcoScore;
