import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./index.css";
import {
  fetchAddresses,
  createAddress,
  editAddress,
  removeAddress,
} from "../../services/addressApi";

const initialFormState = {
  fullName: "",
  mobileNumber: "",
  pincode: "",
  locality: "",
  addressLine: "",
  city: "",
  state: "",
  landmark: "",
  addressType: "Home",
  isDefault: false,
};

const Addresses = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const fromCheckout = location.state?.fromCheckout || false;

  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errMsg, setErrMsg] = useState("");

  const loadAddresses = async () => {
    setIsLoading(true);
    const data = await fetchAddresses();
    setAddresses(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const onChangeField = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingAddressId(null);
    setIsFormOpen(false);
    setErrMsg("");
  };

  const onClickEdit = (address) => {
    setFormData({
      fullName: address.fullName || "",
      mobileNumber: address.mobileNumber || "",
      pincode: address.pincode || "",
      locality: address.locality || "",
      addressLine: address.addressLine || "",
      city: address.city || "",
      state: address.state || "",
      landmark: address.landmark || "",
      addressType: address.addressType || "Home",
      isDefault: address.isDefault || false,
    });
    setEditingAddressId(address._id);
    setIsFormOpen(true);
  };

  const onClickDelete = async (addressId) => {
    try {
      const updatedAddresses = await removeAddress(addressId);
      setAddresses(updatedAddresses);
    } catch (error) {
      setErrMsg(error.message);
    }
  };

  const onSubmitAddress = async (e) => {
    e.preventDefault();

    const { fullName, mobileNumber, pincode, addressLine, city, state } =
      formData;

    if (
      !fullName ||
      !mobileNumber ||
      !pincode ||
      !addressLine ||
      !city ||
      !state
    ) {
      setErrMsg("Please fill all required fields");
      return;
    }

    try {
      let updatedAddresses;
      if (editingAddressId) {
        updatedAddresses = await editAddress(editingAddressId, formData);
      } else {
        updatedAddresses = await createAddress(formData);
      }
      setAddresses(updatedAddresses);
      resetForm();
    } catch (error) {
      setErrMsg(error.message);
    }
  };

  const onClickSelectAddress = (addressId) => {
    if (fromCheckout) {
      navigate("/checkout", { state: { selectedAddressId: addressId } });
    }
  };

  if (isLoading) {
    return (
      <div className="addresses-bg-container container mt-4 text-center">
        <p className="fw-bold">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="addresses-bg-container container mt-4 mb-5">
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h1 className="fw-bold text-success">
            {fromCheckout ? "Select Delivery Address" : "My Addresses"}
          </h1>
          {!isFormOpen && (
            <button
              type="button"
              className="btn btn-success fw-bold"
              onClick={() => {
                setFormData(initialFormState);
                setEditingAddressId(null);
                setIsFormOpen(true);
              }}
            >
              + Add New Address
            </button>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="row mt-3">
          <div className="col-12 col-md-8">
            <form
              className="address-form border rounded p-3 shadow-sm"
              onSubmit={onSubmitAddress}
            >
              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={onChangeField("fullName")}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <input
                    type="text"
                    maxLength="10"
                    className="form-control"
                    placeholder="Mobile Number"
                    value={formData.mobileNumber}
                    onChange={onChangeField("mobileNumber")}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <input
                    type="text"
                    maxLength="6"
                    className="form-control"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={onChangeField("pincode")}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Locality / Area"
                    value={formData.locality}
                    onChange={onChangeField("locality")}
                  />
                </div>
                <div className="col-12">
                  <textarea
                    className="form-control"
                    placeholder="Address (House No, Building, Street)"
                    value={formData.addressLine}
                    onChange={onChangeField("addressLine")}
                  ></textarea>
                </div>
                <div className="col-12 col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="City/Town"
                    value={formData.city}
                    onChange={onChangeField("city")}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="State"
                    value={formData.state}
                    onChange={onChangeField("state")}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Landmark (Optional)"
                    value={formData.landmark}
                    onChange={onChangeField("landmark")}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <div className="d-flex gap-3 align-items-center mt-2">
                    {["Home", "Work", "Other"].map((type) => (
                      <label
                        key={type}
                        className="d-flex align-items-center gap-1 fw-bold"
                      >
                        <input
                          type="radio"
                          name="addressType"
                          value={type}
                          checked={formData.addressType === type}
                          onChange={onChangeField("addressType")}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="col-12">
                  <label className="d-flex align-items-center gap-2 fw-bold mt-2">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isDefault: e.target.checked,
                        }))
                      }
                    />
                    Set as default address
                  </label>
                </div>
              </div>

              {errMsg && <p className="text-danger fw-bold mt-2">{errMsg}</p>}

              <div className="d-flex gap-2 mt-3">
                <button type="submit" className="btn btn-success fw-bold">
                  {editingAddressId ? "Save Address" : "Add Address"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary fw-bold"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row mt-4">
        {addresses.length === 0 ? (
          <div className="col-12 text-center mt-4">
            <p className="fw-bold">
              You don't have any saved addresses yet. Add one to continue.
            </p>
          </div>
        ) : (
          addresses.map((address) => (
            <div className="col-12 col-md-6 mb-3" key={address._id}>
              <div
                className={`address-card border rounded p-3 h-100 shadow-sm ${
                  fromCheckout ? "selectable-address" : ""
                }`}
                onClick={() => onClickSelectAddress(address._id)}
                style={fromCheckout ? { cursor: "pointer" } : {}}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <h6 className="fw-bold mb-1">
                    {address.fullName}{" "}
                    <span className="badge bg-success ms-1">
                      {address.addressType}
                    </span>
                    {address.isDefault && (
                      <span className="badge bg-secondary ms-1">Default</span>
                    )}
                  </h6>
                </div>
                <p className="mb-1">
                  {address.addressLine}
                  {address.locality ? `, ${address.locality}` : ""}
                </p>
                <p className="mb-1">
                  {address.city}, {address.state} - {address.pincode}
                </p>
                {address.landmark && (
                  <p className="mb-1">Landmark: {address.landmark}</p>
                )}
                <p className="mb-2 fw-bold">Mobile: {address.mobileNumber}</p>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success fw-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClickEdit(address);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger fw-bold"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClickDelete(address._id);
                    }}
                  >
                    Remove
                  </button>
                  {fromCheckout && (
                    <button
                      type="button"
                      className="btn btn-sm btn-success fw-bold ms-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClickSelectAddress(address._id);
                      }}
                    >
                      Deliver Here
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Addresses;
