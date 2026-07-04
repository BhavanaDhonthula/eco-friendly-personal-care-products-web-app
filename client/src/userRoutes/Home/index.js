import "./index.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import homeSideImg from "../../assets/homeSideImg.jpeg";
import getProducts from "../../services/getProducts";

const Home = () => {
  const [bodyCareProducts, setBodyCareProducts] = useState([]);
  const [skinCareProducts, setSkinCareProducts] = useState([]);
  const [oralCareProducts, setOralCareProducts] = useState([]);
  const [hairCareProducts, setHairCareProducts] = useState([]);
  const [wellnessCareProducts, setWellnessCareProducts] = useState([]);
  const imgConst = "http://localhost:8000/major-project-imgs/";

  const getProductsOnLoad = async () => {
    const products = await getProducts();

    const bodyCare = products.filter((each) => each.category === "Body Care");
    const skinCare = products.filter((each) => each.category === "Skin Care");
    const oralCare = products.filter((each) => each.category === "Oral Care");
    const hairCare = products.filter((each) => each.category === "Hair Care");
    const wellness = products.filter(
      (each) => each.category === "Hygiene & Welness",
    );

    setBodyCareProducts(bodyCare.slice(0, 4));
    setHairCareProducts(hairCare.slice(0, 4));
    setOralCareProducts(oralCare.slice(0, 4));
    setWellnessCareProducts(wellness.slice(0, 4));
    setSkinCareProducts(skinCare.slice(0, 4));

    // console.log(products);
  };

  // console.log(bodyCareProducts);
  // console.log(skinCareProducts);
  // console.log(oralCareProducts);
  // console.log(hairCareProducts);
  // console.log(wellnessCareProducts);

  useEffect(() => {
    getProductsOnLoad();
  }, []);
  return (
    <>
      <div className="container-fluid">
        <div className="row mt-3 first-row p-3">
          <div className="col-12 col-md-6 order-2">
            <img
              src={homeSideImg}
              alt="home side img"
              width="60%"
              className="rounded"
            />
          </div>
          <div className="col-12 col-md-6 text-start mt-3 mb-3 d-flex justify-content-center align-items-center flex-column">
            <h1 className="w-100 text-start">
              Sustainable Packaging for a Greener Tomorrow
            </h1>
            <p>
              Choose eco-friendly packaging solutions made from recycled and
              biodegradable materials. Reduce environmental impact while
              supporting a cleaner, more sustainable future for businesses and
              communities.
            </p>

            <div className="w-100">
              <Link to="/products">
                <button
                  type="button"
                  className="btn bg-success fw-bold text-white"
                >
                  Shop Now
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-12">
            <h2 className="text-start">Latest Products</h2>
          </div>
          <div className="col-12 mt-1 body text-start p-2">
            <h3 className="text-success fw-bold p-2">Body Care: </h3>
            <ul className="featured-products-container d-flex  flex-wrap gap-4 p-1">
              {bodyCareProducts.map((each) => (
                <li key={each._id}>
                  <Link to={`/productDetailsPage/${each._id}`}>
                    <img
                      src={`${imgConst}${each.thumbnail}`}
                      alt="featured product"
                      width="50%"
                      title={each.productName}
                      className="featured-product-img rounded"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 mt-1 skin text-start p-2">
            <h3 className="text-success fw-bold p-2">Skin Care: </h3>
            <ul className="featured-products-container d-flex  flex-wrap gap-4 p-1">
              {skinCareProducts.map((each) => (
                <li key={each._id}>
                  <Link to={`/productDetailsPage/${each._id}`}>
                    <img
                      src={`${imgConst}${each.thumbnail}`}
                      alt="featured product"
                      width="50%"
                      title={each.productName}
                      className="featured-product-img rounded"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 mt-1 hair text-start p-2">
            <h3 className="text-success fw-bold p-2">Hair Care: </h3>
            <ul className="featured-products-container d-flex  flex-wrap gap-4 p-1">
              {hairCareProducts.map((each) => (
                <li key={each._id}>
                  <Link to={`/productDetailsPage/${each._id}`}>
                    <img
                      src={`${imgConst}${each.thumbnail}`}
                      alt="featured product"
                      width="50%"
                      title={each.productName}
                      className="featured-product-img rounded"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 mt-1 oral text-start p-2">
            <h3 className="text-success fw-bold p-2">Oral Care: </h3>
            <ul className="featured-products-container d-flex  flex-wrap gap-4 p-1">
              {oralCareProducts.map((each) => (
                <li key={each._id}>
                  <Link to={`/productDetailsPage/${each._id}`}>
                    <img
                      src={`${imgConst}${each.thumbnail}`}
                      alt="featured product"
                      width="50%"
                      title={each.productName}
                      className="featured-product-img rounded"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 mt-1 wellness text-start p-2">
            <h3 className="text-success fw-bold p-2">Hygiene & Wellness:</h3>
            <ul className="featured-products-container d-flex  flex-wrap gap-4 p-1">
              {wellnessCareProducts.map((each) => (
                <li key={each._id}>
                  <Link to={`/productDetailsPage/${each._id}`}>
                    <img
                      src={`${imgConst}${each.thumbnail}`}
                      alt="featured product"
                      width="50%"
                      title={each.productName}
                      className="featured-product-img rounded"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};
export default Home;
