import { useEffect, useMemo, useState } from "react";
import { CircleAlert, CircleCheck, CircleX, Search, UtensilsCrossed } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FoodTable from "../components/FoodTable";
import FoodForm from "../components/FoodForm";
import api from "../services/api";
import SuccessPopup from "../components/SuccessPopup";

function FoodManagement() {

  const [successMessage, setSuccessMessage] = useState("");
  const [foods, setFoods] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // GET FOODS
  // ========================================

  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/foods");

      setFoods(response.data.foods || []);
    } catch (err) {
      console.error("Fetch foods error:", err);

      setError("Unable to load food items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
  if (!successMessage) return;

  const timer = setTimeout(() => {
    setSuccessMessage("");
  }, 3000);

  return () => clearTimeout(timer);
}, [successMessage]);

  // ========================================
  // FILTER
  // ========================================

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesSearch = food.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        food.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [foods, search, category]);

  // ========================================
  // SUMMARY
  // ========================================

  const totalFoods = foods.length;

  const availableFoods = foods.filter(
    (food) => food.stock > 5
  ).length;

  const lowStockFoods = foods.filter(
    (food) => food.stock > 0 && food.stock <= 5
  ).length;

  const outOfStockFoods = foods.filter(
    (food) => food.stock === 0
  ).length;

  // ========================================
  // ADD FOOD
  // ========================================

  const handleAddFood = () => {
    setEditingFood(null);
    setShowForm(true);
  };

  // ========================================
  // EDIT FOOD
  // ========================================

  const handleEdit = (food) => {
    setEditingFood(food);
    setShowForm(true);
  };

  // ========================================
  // SAVE FOOD
  // ========================================

  const handleSaveFood = async (foodData) => {
    try {
      const formData = new FormData();

      formData.append("name", foodData.name);
      formData.append("category", foodData.category);
      formData.append("price", foodData.price);
      formData.append("stock", foodData.stock);

      // Only append image if it is a new File
      if (foodData.image instanceof File) {
        formData.append("image", foodData.image);
      }

      if (editingFood) {
        // UPDATE
        const response = await api.put(
          `/foods/${editingFood._id}`,
          formData
        );

        setFoods((prev) =>
          prev.map((food) =>
            food._id === editingFood._id
              ? response.data.food
              : food
          )
        );

        setSuccessMessage("Food updated successfully");
      } else {
        // CREATE
        const response = await api.post(
          "/foods",
          formData
        );

        setFoods((prev) => [
          response.data.food,
          ...prev,
        ]);

        setSuccessMessage("Food added successfully");
      }

      setShowForm(false);
      setEditingFood(null);

    } catch (err) {
      console.error("Save food error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to save food"
      );
    }
  };

  // ========================================
  // DELETE FOOD
  // ========================================

  const handleDelete = async (id) => {
    const food = foods.find(
      (item) => item._id === id
    );

    if (!food) return;

    try {
      await api.delete(`/foods/${id}`);

      setFoods((prev) =>
        prev.filter((item) => item._id !== id)
      );

      setSuccessMessage("Food deleted successfully");

    } catch (err) {
      console.error("Delete food error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to delete food"
      );
    }
  };

return (
  <div className="admin-layout">

    <Sidebar />

    <main className="admin-main">

      <Header />

      {/* PAGE HEADER */}

      <div className="page-heading">

        <div>
          <h2>Food Management</h2>

          <p>
            Manage your canteen menu and food stock
          </p>
        </div>

        <button
          className="add-food-btn"
          onClick={handleAddFood}
        >
          + Add Food
        </button>

      </div>


      {/* FOOD SUMMARY */}

      <section className="food-summary">

        <div className="food-summary-card">

          <div className="dashboard-card-icon">
            <UtensilsCrossed size={20} aria-hidden="true" />
          </div>

          <div>
            <p>Total Food</p>
            <h3>{totalFoods}</h3>
          </div>

        </div>


        <div className="food-summary-card">

          <div className="dashboard-card-icon">
            <CircleCheck size={20} aria-hidden="true" />
          </div>

          <div>
            <p>Available</p>
            <h3>{availableFoods}</h3>
          </div>

        </div>


        <div className="food-summary-card">

          <div className="dashboard-card-icon">
            <CircleAlert size={20} aria-hidden="true" />
          </div>

          <div>
            <p>Low Stock</p>
            <h3>{lowStockFoods}</h3>
          </div>

        </div>


        <div className="food-summary-card">

          <div className="dashboard-card-icon">
            <CircleX size={20} aria-hidden="true" />
          </div>

          <div>
            <p>Out of Stock</p>
            <h3>{outOfStockFoods}</h3>
          </div>

        </div>

      </section>


      {/* FOOD MANAGEMENT */}

      <section className="food-management-panel">

        {/* SEARCH + FILTER */}

        <div className="food-toolbar">

          <div className="search-box">

            <Search size={16} aria-hidden="true" />

            <input
              type="text"
              placeholder="Search food..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <select
            className="category-filter"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >

            <option value="All">
              All Categories
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

          </select>

        </div>


        {/* LOADING */}

        {loading && (
          <div className="empty-table">
            Loading food items...
          </div>
        )}


        {/* ERROR */}

        {!loading && error && (
          <div className="empty-table">
            {error}
          </div>
        )}


        {/* FOOD TABLE */}

        {!loading && !error && (
          <FoodTable
            foods={filteredFoods}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

      </section>

    </main>


    {/* ADD / EDIT FOOD FORM */}

    {showForm && (
      <FoodForm
        food={editingFood}
        onSave={handleSaveFood}
        onClose={() => {
          setShowForm(false);
          setEditingFood(null);
        }}
      />
    )}


    {/* SUCCESS POPUP */}

    {successMessage && (
      <SuccessPopup
        message={successMessage}
        onClose={() =>
          setSuccessMessage("")
        }
      />
    )}

  </div>
);
}

export default FoodManagement;