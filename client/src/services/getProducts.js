const getProducts = async (category = "", brand = "", sort = "relevance") => {
  const params = new URLSearchParams();

  if (category) params.append("category", category);
  if (brand) params.append("brand", brand);
  if (sort !== "relevance") params.append("sort", sort);

  const url = `http://localhost:8000/products?${params.toString()}`;
  console.log(url);

  if (params.toString()) {
    window.history.pushState({}, "", `?${params.toString()}`);
  } else {
    window.history.pushState({}, "", window.location.pathname);
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      return data;
    }

    console.error(data.err_msg);
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default getProducts;
