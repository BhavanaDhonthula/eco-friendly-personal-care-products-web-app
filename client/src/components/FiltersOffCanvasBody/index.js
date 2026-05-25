import "./index.css";
import { useState, useContext } from "react";
import FiltersContext from "../../services/contexts/FiltersContext";

const FiltersOffCanvasBody = () => {
  const FiltersContextValue = useContext(FiltersContext);

  const { productsList, changedProductsList, setChangedProductsList } =
    FiltersContextValue;

  const brandsList = [
    ...new Set(productsList.map((eachProduct) => eachProduct.brand)),
  ];

  const categoriesList = [
    ...new Set(productsList.map((eachProduct) => eachProduct.category)),
  ];

  const sortProductsLowToHigh = () => {
    let lowToHighList = [...productsList].sort((a, b) => a.price - b.price);
    setChangedProductsList(lowToHighList);
  };

  const sortProductsHighToLow = () => {
    let highToLowList = [...productsList].sort((a, b) => b.price - a.price);
    setChangedProductsList(highToLowList);
  };

  return (
    <>
      <div className="filters-bg-container">
        <div className="price-filter-container ">
          <h3 className="filter-name">Price Filter :</h3>
          <div className="">
            <button
              className="low-to-high-filter btn btn-outline-warning"
              onClick={() => {
                sortProductsLowToHigh();
              }}
            >
              Low - High
            </button>
          </div>
          <div className="">
            <button
              className="low-to-high-filter btn btn-outline-warning"
              onClick={() => {
                sortProductsHighToLow();
              }}
            >
              High - Low
            </button>
          </div>

          <div className="">
            <button
              className="relevance btn btn-outline-warning"
              onClick={() => {
                setChangedProductsList(productsList);
              }}
            >
              Relevance
            </button>
          </div>
        </div>

        <div className="brand-filter-container mt-3">
          <h3 className="filter-name">Brand Filter :</h3>
          <div className="brands-list">
            {brandsList.map((eachBrand) => (
              <div className="checkbox-brand-container d-flex gap-3 mt-1">
                <input
                  type="checkbox"
                  className="form-check-input checkbox"
                  id={eachBrand}
                />
                <label className="form-check-label label" htmlFor={eachBrand}>
                  {eachBrand}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="category-filter-container mt-3">
          <h3 className="filter-name">Category Filter :</h3>
          <div className="brands-list">
            {categoriesList.map((eachBrand) => (
              <div className="checkbox-brand-container d-flex gap-3 mt-1">
                <input
                  type="checkbox"
                  className="form-check-input checkbox"
                  id={eachBrand}
                />
                <label className="form-check-label label" htmlFor={eachBrand}>
                  {eachBrand}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FiltersOffCanvasBody;
