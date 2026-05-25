import "./index.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import getProductData from "../../services/getProductData";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [productDetails, setProductDetails] = useState({});

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

  console.log(productImgs);

  const url = "http://localhost:8000/";
  return (
    <div className="product-details-page-bg-container">
      <div className="produt-details-left-container"></div>
      <div className="produt-details-right-container"></div>

      <ul className="product-imgs-container">
        <li key={_id}>
          {productImgs?.map((eachImg) => (
            <img src={url + eachImg} alt={productName} className="w-25 m-2" />
          ))}
        </li>
      </ul>
    </div>
  );
};

export default ProductDetailsPage;
