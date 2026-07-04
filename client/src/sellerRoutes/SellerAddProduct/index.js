import { useState, useRef } from "react";
import { ImLeaf } from "react-icons/im";
import "./index.css";
import Cookies from "js-cookie";

const categories = [
  "Select",
  "Body Care",
  "Skin Care",
  "Hair Care",
  "Oral Care",
  "Hygiene & Welness",
];

const packagingTypes = [
  "Recyclable",
  "Biodegradable",
  "Reusable",
  "Refillable",
  "Glass",
  "Bamboo",
  "Paper&Cardboard",
  "Zero-Waste",
];

const ingredientTypes = [
  "Select",
  "Organic",
  "Most Natural",
  "Essential Oils",
  "Harbal Extracts",
];

const SellerAddProduct = () => {
  const thumbnailRef = useRef(null);
  const selectedImgsRef = useRef(null);

  const [thumbnail, setThumbnail] = useState("");
  const [selectedImgs, setSelectedImgs] = useState([]);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [productFiles, setProductFiles] = useState([]);

  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [ingredientType, setIngredientType] = useState("");
  const [carbonFootprint, setCarbonfootprint] = useState("");
  const [packagingType, setPackagingType] = useState("");
  const [specifications, setSpecifications] = useState([]);

  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors] = useState({});

  const settingToInitialState = () => {
    setProductName("");
    setBrand("");
    setCategory("");
    setPrice("");
    setQuantity("");
    setStock("");
    setDescription("");
    setIngredients([]);
    setIngredientType("");
    setCarbonfootprint("");
    setPackagingType(null);
    setSpecifications([]);
    setThumbnail("");
    setSelectedImgs([]);
    setThumbnailFile(null);
    setProductFiles([]);

    if (thumbnailRef.current) {
      thumbnailRef.current.value = "";
    }
    if (selectedImgsRef.current) {
      selectedImgsRef.current.value = "";
    }
  };

  const validateForm = (data, files) => {
    const errors = {};

    if (!data.productName.trim()) {
      errors.productName = "Product name is required";
    }

    if (!data.brand.trim()) {
      errors.brand = "Brand is required";
    }

    if (!data.category || data.category === "Select") {
      errors.category = "Please select a category";
    }

    if (!data.price || data.price <= 0) {
      errors.price = "Enter a valid price";
    }

    if (data.quantity === "" || !data.quantity) {
      errors.quantity = "Enter valid stock quantity";
    }

    // ── Stock validation ──────────────────────────────────────────
    if (data.stock === "" || data.stock === null || data.stock === undefined) {
      errors.stock = "Enter available stock count";
    } else if (parseInt(data.stock, 10) < 0) {
      errors.stock = "Stock cannot be negative";
    }
    // ─────────────────────────────────────────────────────────────

    if (!data.description.trim()) {
      errors.description = "Description is required";
    }

    if (!data.ingredients.length) {
      errors.ingredients = "Enter at least one ingredient";
    }

    if (!data.ingredientType) {
      errors.ingredientType = "Select ingredient type";
    }

    if (!data.carbonFootprint || data.carbonFootprint <= 0) {
      errors.carbonFootprint = "Enter valid carbon footprint";
    }

    if (!data.specifications.length) {
      errors.specifications = "Enter at least one specification";
    }

    if (!files.thumbnailFile) {
      errors.thumbnailFile = "Thumbnail is required";
    }

    if (!files.productFiles.length) {
      errors.productFiles = "Upload at least one product image";
    }

    if (!data.packagingType) {
      errors.packagingType = "Select packaging type";
    }

    return errors;
  };

  const onChangeSetIngredients = (e) => {
    setIngredients(e.target.value.split(","));
    clearError("ingredients");
  };

  const onChangeSetSpecifications = (e) => {
    setSpecifications(e.target.value.split(","));
    clearError("specifications");
  };

  const onChangeSetSelectedImage = (e) => {
    const file = e.target.files?.[0];
    setThumbnailFile(file);
    setThumbnail(file ? URL.createObjectURL(file) : "");
    clearError("thumbnailFile");
  };

  const onChangeSetProductImages = (e) => {
    const files = Object.values(e.target.files);
    const imgUrls = files.map((file) => URL.createObjectURL(file));
    setProductFiles(files);
    setSelectedImgs(imgUrls);
    clearError("productFiles");
  };

  const clearError = (field) => {
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const submitForm = async (e) => {
    e.preventDefault();

    const productDetails = {
      productName,
      brand,
      price,
      category,
      quantity,
      stock,
      description,
      ingredients,
      ingredientType,
      carbonFootprint,
      packagingType,
      specifications,
    };

    const files = {
      thumbnailFile,
      productFiles,
    };

    const validationErrors = validateForm(productDetails, files);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const formData = new FormData();

    Object.entries(productDetails).forEach(([key, value]) => {
      if (key !== "ingredients" && key !== "specifications") {
        formData.append(key, value);
      }
    });

    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append("specifications", JSON.stringify(specifications));

    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    productFiles.forEach((file) => {
      formData.append("productImgs", file);
    });

    // console.log(formData);

    const sellerToken = Cookies.get("seller_access_token");

    const url = "http://localhost:8000/products";
    const optionsConfiguration = {
      method: "POST",

      headers: {
        Authorization: `Bearer ${sellerToken}`,
      },
      body: formData,
    };

    const response = await fetch(url, optionsConfiguration);
    // const data = await response.json();

    if (response.ok) {
      setSuccessMsg("✅ Product added successfully!");
      settingToInitialState();
    } else {
      const data = await response.json();
      setErrors({
        submit: data.err_msg || "Failed to add product. Try again.",
      });
    }
  };

  return (
    <div className="seller-add-product-bg-container d-flex justify-content-center align-items-center flex-column">
      <div className="container">
        <div className="row">
          <div className="col-12 mt-4">
            <h1 className="main-heading">Add New Product</h1>
            <p className="sub-heading">
              List your eco-friendly product for customers.
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="container">
          <div className="alert alert-success fw-bold">{successMsg}</div>
        </div>
      )}

      <form
        className="form-container m-3"
        encType="multipart/form-data"
        onSubmit={submitForm}
      >
        {/* ── Product Details ───────────────────────────────────── */}
        <div className="container">
          <div className="row mt-3">
            <div className="col-12">
              <div className="d-flex justify-content-start align-items-center">
                <ImLeaf className="seller-add-product-leaf-icon " size={20} />
                <b className="eco-details-heading">Product Details</b>
              </div>
              <hr />
            </div>
          </div>
          {/* Product Name */}
          <div className="row mt-3  d-flex align-items-center">
            <div className="col-12 col-md-3 d-flex text-start">
              <label htmlFor="productName" className="label">
                Product Name
              </label>
            </div>

            <div className="col-12 col-md-9">
              <input
                type="text"
                id="productName"
                value={productName}
                className="form-control input-field"
                onChange={(e) => {
                  setProductName(e.target.value);
                  clearError("productName");
                }}
              />
            </div>
            {errors.productName && (
              <p className="text-danger text-start fw-bold">
                {errors.productName}
              </p>
            )}
          </div>

          {/* Brand */}
          <div className="row mt-3  d-flex align-items-center">
            <div className="col-12 col-md-3 d-flex flex-start">
              <label htmlFor="brand" className="label">
                Brand
              </label>
            </div>

            <div className="col-12 col-md-9">
              <input
                type="text"
                className="form-control input-field"
                id="brand"
                value={brand}
                placeholder="Company/Shop/Store name"
                onChange={(e) => {
                  setBrand(e.target.value);
                  clearError("brand");
                }}
              />
            </div>
            {errors.brand && (
              <p className="text-danger text-start fw-bold">{errors.brand}</p>
            )}
          </div>

          {/* Category */}
          <div className="row mt-3  d-flex align-items-center">
            <div className="col-12 col-md-3 d-flex flex-start">
              <label htmlFor="category" className="label">
                Category
              </label>
            </div>

            <div className="col-12 col-md-9">
              <select
                id="category"
                className="form-select input-field"
                onChange={(e) => {
                  setCategory(e.target.value);
                  clearError("category");
                }}
                value={category}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            {errors.category && (
              <p className="text-danger text-start fw-bold">
                {errors.category}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="row mt-3  d-flex align-items-center">
            <div className="col-12 col-md-3 d-flex flex-start">
              <label htmlFor="price" className="label">
                Price
              </label>
            </div>

            <div className="col-12 col-md-9">
              <input
                id="price"
                value={price}
                type="number"
                className="form-control"
                onChange={(e) => {
                  setPrice(parseFloat(e.target.value));
                  clearError("price");
                }}
              />
            </div>
            {errors.price && (
              <p className="text-danger text-start fw-bold">{errors.price}</p>
            )}
          </div>

          {/* Quantity — the unit/size label e.g. "200ml" */}
          <div className="row mt-3  d-flex align-items-center">
            <div className="col-12 col-md-3 d-flex flex-start">
              <label htmlFor="stockQuantity" className="label">
                Quantity
              </label>
            </div>

            <div className="col-12 col-md-9">
              <input
                id="stockQuantity"
                type="text"
                className="form-control"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  clearError("quantity");
                }}
              />
            </div>
            {errors.quantity && (
              <p className="text-danger text-start fw-bold">
                {errors.quantity}
              </p>
            )}
          </div>

          {/* ── Stock (NEW) ──────────────────────────────────────── */}
          <div className="row mt-3 d-flex align-items-center">
            <div className="col-12 col-md-3 d-flex flex-start">
              <label htmlFor="stockCount" className="label">
                Stock
                <span
                  className="text-muted fw-normal ms-1"
                  style={{ fontSize: "0.8rem" }}
                >
                  (units available)
                </span>
              </label>
            </div>
            <div className="col-12 col-md-5">
              <input
                id="stockCount"
                type="number"
                min="0"
                className="form-control"
                placeholder="e.g. 50"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  clearError("stock");
                }}
              />
            </div>
            {errors.stock && (
              <p className="text-danger text-start fw-bold">{errors.stock}</p>
            )}
          </div>
          {/* ─────────────────────────────────────────────────────── */}

          {/* Description */}
          <div className="row mt-3  d-flex align-items-center">
            <div className="col-12 col-md-3 d-flex flex-start">
              <label htmlFor="description" className="form-label label">
                Description
              </label>
            </div>
            <div className="col-12 col-md-9">
              <textarea
                id="description"
                className="form-control"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearError("description");
                }}
              ></textarea>
            </div>
            {errors.description && (
              <p className="text-danger text-start fw-bold">
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* // eco details start  */}

        <div className="eco-details-container container">
          <div className="row mt-3">
            <div className="col-12">
              <div className="d-flex justify-content-start align-items-center">
                <ImLeaf className="seller-add-product-leaf-icon " size={20} />
                <b className="eco-details-heading">Eco Details</b>
              </div>
              <hr />
            </div>
          </div>

          {/* Ingredients */}
          <div className="container">
            <div className="row mt-3  d-flex align-items-center">
              <div className="col-12 col-md-3 d-flex flex-start">
                <label htmlFor="ingredients" className="label">
                  Ingredients
                </label>
              </div>
              <div className="col-12 col-md-9">
                <textarea
                  id="ingredients"
                  value={ingredients.join(",")}
                  className="form-control input-field"
                  placeholder="Provide Comma (,) separated values. Ex:Aloe Vera,Neem,Beeswax,"
                  onChange={onChangeSetIngredients}
                ></textarea>
              </div>
              {errors.ingredients && (
                <p className="text-danger text-start fw-bold">
                  {errors.ingredients}
                </p>
              )}
            </div>

            {/* Ingredient Type */}
            <div className="row mt-3  d-flex align-items-center">
              <div className="col-12 col-md-3 d-flex text-start">
                <label htmlFor="ingredientType" className="label">
                  Ingredient Type
                </label>
              </div>

              <div className="col-12 col-md-9">
                <select
                  id="ingredientType"
                  className="form-select input-field"
                  value={ingredientType}
                  onChange={(e) => {
                    setIngredientType(e.target.value);
                    clearError("ingredientType");
                  }}
                >
                  {ingredientTypes.map((eachIngredientType) => (
                    <option key={eachIngredientType}>
                      {eachIngredientType}
                    </option>
                  ))}
                </select>
              </div>
              {errors.ingredientType && (
                <p className="text-danger text-start fw-bold">
                  {errors.ingredientType}
                </p>
              )}
            </div>

            {/* Carbon Footprint */}
            <div className="row mt-3  d-flex align-items-center">
              <div className="col-12 col-md-3 d-flex text-start">
                <label htmlFor="carbonFootprint" className="label">
                  Carbon Footprint
                </label>
              </div>

              <div className="col-12 col-md-6">
                <input
                  type="number"
                  className="form-control input-field"
                  id="carbonFootprint"
                  placeholder="e.g: 2.5 (in kgs)"
                  value={carbonFootprint}
                  onChange={(e) => {
                    setCarbonfootprint(parseFloat(e.target.value));
                    clearError("carbonFootprint");
                  }}
                />
              </div>
              {errors.carbonFootprint && (
                <p className="text-danger text-start fw-bold">
                  {errors.carbonFootprint}
                </p>
              )}
            </div>

            {/* Specifications */}
            <div className="row mt-3  d-flex align-items-center">
              <div className="col-12 col-md-3 d-flex flex-start">
                <label htmlFor="specifications" className="label">
                  Specifications
                </label>
              </div>
              <div className="col-12 col-md-9">
                <textarea
                  id="specifications"
                  value={specifications.join(",")}
                  className="form-control input-field"
                  placeholder="Provide Comma (,) separated values. Ex:Natural,Safe,Eco-friendly,Skin-friendly,Chemical-free"
                  onChange={onChangeSetSpecifications}
                ></textarea>
              </div>
              {errors.specifications && (
                <p className="text-danger text-start fw-bold">
                  {errors.specifications}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* images uploading area */}

        <div className="upload-images-container container">
          <div className="row mt-3">
            <div className="col-12">
              <div className="d-flex justify-content-start align-items-center">
                <ImLeaf className="seller-add-product-leaf-icon " size={20} />
                <b className="eco-details-heading">Upload Images</b>
              </div>
              <hr />
            </div>
          </div>

          {/* Thumbnail */}
          <div className="row mt-3 d-flex align-items-center">
            <div className="col-12 col-md-3 d-flex text-start">
              <label htmlFor="thumbnail" className="form-label label">
                Thumbnail
              </label>
            </div>
            <div className="col-12 col-md-6">
              <input
                type="file"
                accept="image/*"
                id="thumbnail"
                ref={thumbnailRef}
                name="thumbnail"
                className="form-control input-field"
                onChange={onChangeSetSelectedImage}
              />
            </div>
            {errors.thumbnailFile && (
              <p className="text-danger text-start fw-bold">
                {errors.thumbnailFile}
              </p>
            )}
          </div>

          <div className="row mt-3">
            <div className="col-12 col-md-4 text-start">
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt="thumbnail"
                  width="150"
                  height="150"
                  className="p-2"
                />
              )}
            </div>
          </div>

          {/* Product Images */}
          <div className="row mt-3  d-flex align-items-center">
            <div className="col-12 col-md-3 d-flex text-start">
              <label htmlFor="productImages" className="label form-label">
                Product Images
              </label>
            </div>
            <div className="col-12 col-md-6">
              <input
                id="productImages"
                type="file"
                ref={selectedImgsRef}
                name="productImgs"
                className="form-control input-field"
                accept="image/*"
                multiple
                onChange={onChangeSetProductImages}
              />
            </div>
            {errors.productFiles && (
              <p className="text-danger text-start fw-bold">
                {errors.productFiles}
              </p>
            )}

            {selectedImgs.length !== 0 ? (
              <div className="col-12 p-3 mt-3 mb-3  d-flex justify-content-start flex-wrap gap-3">
                {selectedImgs.map((img) => (
                  <img
                    src={img}
                    key={img}
                    alt={img}
                    width="150px"
                    height="150px"
                  />
                ))}
              </div>
            ) : null}
          </div>

          {/* Packaging Type */}
          <div className="row mt-3">
            <div className="col-12 mb-3 d-flex flex-start">
              <ImLeaf className="seller-add-product-leaf-icon " size={20} />
              <b className="eco-details-heading">Packaging Type</b>
            </div>
            <hr />
            <div className="col-12 d-flex flex-wrap gap-3">
              {packagingTypes.map((eachType) => (
                <div key={eachType} className="d-flex align-items-center gap-2">
                  <input
                    type="radio"
                    className="form-check-input"
                    value={eachType}
                    name="packaging-type"
                    id={eachType}
                    onChange={() => {
                      setPackagingType(eachType);
                      clearError("packagingType");
                    }}
                  />
                  <label htmlFor={eachType} className="label form-check-label">
                    {eachType}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <hr />
          <hr />

          <div className="row mt-3 ">
            <div className="col-12 d-flex justify-content-center gap-3">
              <button className="submit-btn btn btn-success" type="submit">
                Add Product
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SellerAddProduct;
