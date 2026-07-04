import "./index.css";
import { useContext, useState } from "react";
import FiltersContext from "../../services/contexts/FiltersContext";
import getProducts from "../../services/getProducts";

const priceSortOptions = [
  {
    id: "relevance",
    displayText: "Relevance",
  },
  {
    id: "highToLow",
    displayText: "High - Low",
  },
  {
    id: "lowToHigh",
    displayText: "Low - High",
  },
];

const FiltersOffCanvasBody = () => {
  const FiltersContextValue = useContext(FiltersContext);

  const { productsList, setChangedProductsList } = FiltersContextValue;

  const [sort, setSort] = useState("relevance");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAllBrands, setShowAllBrands] = useState(false);

  console.log(selectedBrands);

  const brandsList = [...new Set(productsList.map((product) => product.brand))];

  const categoriesList = [
    ...new Set(productsList.map((product) => product.category)),
  ];

  const visibleBrands = showAllBrands ? brandsList : brandsList.slice(0, 6);

  const applyFilters = async (
    category = selectedCategory,
    brands = selectedBrands,
    sorting = sort,
  ) => {
    const filteredProducts = await getProducts(
      category,
      brands.join(","),
      sorting,
    );

    setChangedProductsList(filteredProducts);
  };

  const onChangeSort = async (e) => {
    const selectedSort = e.target.value;

    setSort(selectedSort);

    await applyFilters(selectedCategory, selectedBrands, selectedSort);
  };

  const onChangeBrand = async (e) => {
    const brand = e.target.value;

    let updatedBrands = [];

    if (selectedBrands.includes(brand)) {
      updatedBrands = selectedBrands.filter((eachBrand) => eachBrand !== brand);
    } else {
      updatedBrands = [...selectedBrands, brand];
    }

    setSelectedBrands(updatedBrands);

    await applyFilters(selectedCategory, updatedBrands, sort);
  };

  const onChangeCategory = async (e) => {
    const category = e.target.value;

    setSelectedCategory(category);

    await applyFilters(category, selectedBrands, sort);
  };

  const clearFilters = async () => {
    setSort("relevance");
    setSelectedBrands([]);
    setSelectedCategory("");

    const allProducts = await getProducts();

    setChangedProductsList(allProducts);
  };

  return (
    <div className="filters-bg-container">
      {/* Price Filter */}
      <div className="price-filter-container">
        <h3 className="filter-name">Price Sort :</h3>

        {priceSortOptions.map((option) => (
          <div key={option.id} className="form-check mt-2">
            <input
              type="radio"
              name="priceSort"
              id={option.id}
              value={option.id}
              checked={sort === option.id}
              onChange={onChangeSort}
              className="form-check-input"
            />

            <label htmlFor={option.id} className="form-check-label">
              {option.displayText}
            </label>
          </div>
        ))}
      </div>

      {/* Brand Filter */}
      <div className="brand-filter-container mt-4">
        <h3 className="filter-name">Brands :</h3>

        {visibleBrands.map((brand) => (
          <div key={brand} className="d-flex gap-2 align-items-center mt-2">
            <input
              type="checkbox"
              id={brand}
              value={brand}
              checked={selectedBrands.includes(brand)}
              onChange={onChangeBrand}
              className="form-check-input"
            />

            <label htmlFor={brand}>{brand}</label>
          </div>
        ))}

        {brandsList.length > 6 && (
          <button
            type="button"
            className="btn btn-link p-0 mt-2"
            onClick={() => setShowAllBrands(!showAllBrands)}
          >
            {showAllBrands ? "Show Less" : "Show More"}
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="category-filter-container mt-4">
        <h3 className="filter-name">Categories :</h3>

        {categoriesList.map((category) => (
          <div key={category} className="d-flex gap-2 align-items-center mt-2">
            <input
              type="radio"
              id={category}
              name="category"
              value={category}
              checked={selectedCategory === category}
              onChange={onChangeCategory}
              className="form-check-input"
            />

            <label htmlFor={category}>{category}</label>
          </div>
        ))}
      </div>

      {/* Clear Filters */}
      <div className="mt-4">
        <button className="btn btn-danger w-100" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FiltersOffCanvasBody;
