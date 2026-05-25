const getProductData = async (id) => {
  const url = `http://localhost:8000/productDetailsPage/${id}`;

  const response = await fetch(url);
  if (response.ok) {
    const productData = await response.json();
    return productData;
    console.log(productData);
  }

  return response.err_msg;
};

export default getProductData;
