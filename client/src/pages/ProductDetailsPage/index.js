import "./index.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getProductData from "../../services/getProductData";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [productDetails, setProductDetails] = useState({});

  const imageConst = "http://localhost:8000/";

  useEffect(() => {
    const getProduct = async () => {
      const productData = await getProductData(id);
      setProductDetails(productData[0]);
    };

    getProduct();
  }, []);

  console.log(productDetails);

  const {
    _id,
    productName,
    brand,
    price,
    carbonFootprint,
    description,
    ingredientType,
    ingredients,
    packagingType,
    productImgs,
    quantity,
    specifications,
  } = productDetails;

  // console.log(productImgs);

  return (
    <div className="product-details-page-bg-container container-fluid">
      <div className="row mt-3">
        <div className="produt-details-left-container col-12 col-md-6">
          <div id="productImgsCarousel" className="carousel slide">
            <div className="carousel-indicators" id="custome-indicators">
              {productImgs?.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  data-bs-target="#productImgsCarousel"
                  data-bs-slide-to={index}
                  className={index === 0 ? "active" : ""}
                  aria-current={index === 0 ? "true" : undefined}
                  aria-label={`Slide ${index + 1}`}
                ></button>
              ))}
            </div>
            <div className="carousel-inner">
              {productImgs?.map((eachImg, index) => (
                <div
                  key={index}
                  className={`carousel-item ${index === 0 ? "active" : ""}`}
                >
                  <img
                    src={`${imageConst}${eachImg}`}
                    className="d-block w-100 carousel-product-img"
                    alt={`Product ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#productImgsCarousel"
              data-bs-slide="prev"
            >
              <span
                className="carousel-control-prev-icon bg-success"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#productImgsCarousel"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon bg-success"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>

          
        </div>
        <div className="product-details-right-container  col-12 col-md-6">
          Prduct Features Section
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
