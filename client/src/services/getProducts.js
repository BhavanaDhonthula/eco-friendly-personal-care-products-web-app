const getProducts = async () => {
  let url = "http://localhost:8000/products";
  let bodyCareProducts = [];
  let hairCareProducts = [];
  let oralCareProducts = [];
  let skinCareProducts = [];
  let wellnessProducts = [];
  let allProducts = [];

  const response = await fetch(url);
  const data = await response.json();

  if (response.ok) {
    // data.forEach((product) => {
    //   if (product.category === "Body Care") {
    //     bodyCareProducts.push(product);
    //   } else if (product.category === "Skin Care") {
    //     skinCareProducts.push(product);
    //   } else if (product.category === "Oral Care") {
    //     oralCareProducts.push(product);
    //   } else if (product.category === "Hair Care") {
    //     hairCareProducts.push(product);
    //   } else if (product.category === "Hygiene & Wellness") {
    //     wellnessProducts.push(product);
    //   } else {
    //     allProducts = data;
    //   }
    // });
    return data;
  } else {
    return data.err_msg;
  }
};

export default getProducts;
