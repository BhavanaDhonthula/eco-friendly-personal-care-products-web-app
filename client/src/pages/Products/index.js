import "./index.css";
import getProducts from "../../services/getProducts";
import ProductCard from "../../components/ProductCard";
import { useState, useEffect } from "react";
import { Vortex } from "react-loader-spinner";
import { BsFillSearchHeartFill } from "react-icons/bs";
import FiltersOffCanvasBody from "../../components/FiltersOffCanvasBody";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { useContext } from "react";
import FiltersContext from "../../services/contexts/FiltersContext";

const LoadingView = () => (
  <div className="loading-view-container">
    <Vortex
      visible={true}
      height="200"
      width="250"
      ariaLabel="vortex-loading"
      wrapperStyle={{}}
      wrapperClass="vortex-wrapper"
      colors={["red", "green", "blue", "yellow", "orange", "purple"]}
    />
  </div>
);

const Products = () => {
  const [isLoading, setIsloading] = useState(false);
  const [userSearchValue, setUserSearchValue] = useState("");
  const FilterContextValue = useContext(FiltersContext);

  const {
    productsList,
    changedProductsList,
    setProductsList,
    setChangedProductsList,
  } = FilterContextValue;

  console.log(changedProductsList);

  useEffect(() => {
    const onLoadGetProducts = async () => {
      setIsloading(true);
      const allProducts = await getProducts();
      setProductsList(allProducts);
      setChangedProductsList(allProducts);
      setIsloading(false);
    };

    onLoadGetProducts();
  }, []);

  const getSearchedProducts = () => {
    if (userSearchValue.trim() !== "") {
      const searchedProductsList = productsList.filter((eachProduct) =>
        eachProduct.productName
          .toLocaleLowerCase()
          .includes(userSearchValue.toLocaleLowerCase()),
      );
      setChangedProductsList(searchedProductsList);
    } else {
      setChangedProductsList(productsList);
    }
  };

  const renderProducts = () => (
    <ul className="products-list d-flex flex-wrap justify-content-center align-items-center gap-3 ">
      {changedProductsList.map((eachProduct) => (
        <li className="" key={eachProduct._id}>
          <ProductCard productDetails={eachProduct} />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="products-page-bg-container ">
      {isLoading ? (
        <LoadingView />
      ) : (
        <>
          <div className="search-filters-btn-container container mt-2">
            <div className="search-container">
              <input
                type="search"
                className="search-bar fw-bold "
                aria-label="Search Icon"
                name="user search input"
                placeholder="Search Products..."
                autoComplete="true"
                onChange={(e) => {
                  setUserSearchValue(e.target.value);
                }}
              />
              <BsFillSearchHeartFill
                size={30}
                className="p-1  search-icon"
                onClick={() => {
                  getSearchedProducts();
                }}
              />
            </div>

            <button
              className="btn btn-outline-success"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasRight"
              aria-controls="offcanvasRight"
            >
              Filters
              <span>
                <FaArrowAltCircleRight className="arrow-icon" />
              </span>
            </button>
          </div>

          <div
            className="offcanvas offcanvas-end set-offcanvas-width"
            tabIndex="-1"
            id="offcanvasRight"
            aria-labelledby="offcanvasRightLabel"
          >
            <div className="offcanvas-header">
              <h5 className="offcanvas-title" id="offcanvasRightLabel">
                All Filters
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              <FiltersOffCanvasBody />
            </div>
          </div>

          <div className="products">
            {changedProductsList.length === 0 ? (
              <div className="no-product-view">
                <h4 className="text-success fw-bold p-3">
                  No Products Found. Try adding different filters.
                </h4>
              </div>
            ) : (
              renderProducts()
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Products;
