import { useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";

const initialForm = {
  name: "",
  category: "",
  price: "",
  stock: "",
  image: null,
};

function FoodForm({ food, onSave, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState("");

  // ========================================
  // LOAD FOOD WHEN EDITING
  // ========================================

  useEffect(() => {
    if (food) {
      setForm({
        name: food.name || "",
        category: food.category || "",
        price: food.price || "",
        stock: food.stock ?? "",
        image: food.image || null,
      });

      // Existing image from backend
      if (food.image) {
        const imageUrl = food.image.startsWith("http")
          ? food.image
          : `http://localhost:5000${food.image}`;

        setPreview(imageUrl);
      } else {
        setPreview("");
      }
    } else {
      setForm(initialForm);
      setPreview("");
    }
  }, [food]);

  // ========================================
  // HANDLE INPUT CHANGE
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // HANDLE IMAGE CHANGE
  // ========================================

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    // Show new image preview
    setPreview(URL.createObjectURL(file));
  };

  // ========================================
  // REMOVE IMAGE PREVIEW
  // ========================================

  const handleRemoveImage = () => {
    setPreview("");

    // If editing, don't remove the existing
    // image path unless a new image is selected.
    if (!food) {
      setForm((prev) => ({
        ...prev,
        image: null,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        image: food.image || null,
      }));
    }
  };

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.category ||
      !form.price ||
      form.stock === ""
    ) {
      alert("Please fill all required fields.");
      return;
    }

    // Image required only when adding
    if (!food && !form.image) {
      alert("Please select a food image.");
      return;
    }

    onSave({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    });
  };

  return (
    <div className="modal-overlay">

      <div className="food-form-modal">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="modal-header">

          <div>

            <h2>
              {food ? "Edit Food" : "Add Food"}
            </h2>

            <p>
              {food
                ? "Update food information"
                : "Add a new item to the canteen menu"}
            </p>

          </div>

          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close food form"
          >
            <X size={18} aria-hidden="true" />
          </button>

        </div>

        <form onSubmit={handleSubmit}>

          {/* ================================= */}
          {/* FOOD IMAGE */}
          {/* ================================= */}

          <div className="form-group">

            <label>
              Food Image *
            </label>

            <div className="image-upload-area">

              {preview ? (

                <div className="image-preview">

                  <img
                    src={preview}
                    alt="Food preview"
                  />

                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={handleRemoveImage}
                    aria-label="Remove food image"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>

                </div>

              ) : (

                <label className="image-upload-box">

                  <span className="upload-icon">
                    <ImagePlus size={28} aria-hidden="true" />
                  </span>

                  <span className="upload-title">
                    Upload Food Image
                  </span>

                  <span className="upload-text">
                    PNG, JPG or JPEG · Max 5MB
                  </span>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageChange}
                    hidden
                  />

                </label>

              )}

            </div>

          </div>


          {/* ================================= */}
          {/* FOOD NAME */}
          {/* ================================= */}

          <div className="form-group">

            <label>
              Food Name *
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter food name"
              value={form.name}
              onChange={handleChange}
            />

          </div>


          {/* ================================= */}
          {/* CATEGORY + PRICE */}
          {/* ================================= */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Category *
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >

                <option value="">
                  Select category
                </option>

                <option value="Breakfast">
                  Breakfast
                </option>

                <option value="Lunch">
                  Lunch
                </option>

                <option value="Snacks">
                  Snacks
                </option>

                <option value="Drinks">
                  Drinks
                </option>

                <option value="Dessert">
                  Dessert
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                Price (₹) *
              </label>

              <input
                type="number"
                name="price"
                min="0"
                placeholder="Enter price"
                value={form.price}
                onChange={handleChange}
              />

            </div>

          </div>


          {/* ================================= */}
          {/* STOCK */}
          {/* ================================= */}

          <div className="form-group">

            <label>
              Stock Quantity *
            </label>

            <input
              type="number"
              name="stock"
              min="0"
              placeholder="Enter available quantity"
              value={form.stock}
              onChange={handleChange}
            />

          </div>


          {/* ================================= */}
          {/* BUTTONS */}
          {/* ================================= */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
            >
              {food
                ? "Update Food"
                : "Add Food"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default FoodForm;