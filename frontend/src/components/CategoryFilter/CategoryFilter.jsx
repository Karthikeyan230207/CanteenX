import "./CategoryFilter.css";

const categories = [
  { name: "All", image: "photo-1512621776951-a57141f2eefd" },
  { name: "Breakfast", image: "photo-1525351484163-7529414344d8" },
  { name: "Lunch", image: "photo-1546069901-ba9599a7e63c" },
  { name: "Snacks", image: "photo-1601050690597-df0568f70950" },
  { name: "Drinks", image: "photo-1544145945-f90425340c7e" },
  { name: "Dessert", image: "photo-1488477181946-6428a0291777" },
];

const getImageUrl = (image) => {
  if (image?.startsWith("http")) return image;
  return `https://smart-canteen-system-pyyl.onrender.com/${image}`;
};

function CategoryFilter({ selectedCategory, setSelectedCategory, menu = [] }) {
  return (
    <div className="category-scroll-wrapper">
      <div className="category-container" aria-label="Food categories" role="group">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.name;
          const matchingFood = menu.find(
            (food) =>
              food.image &&
              (cat.name === "All" || food.category === cat.name)
          );
          const fallbackImage = `https://images.unsplash.com/${cat.image}?auto=format&fit=crop&w=96&h=96&q=80`;
          return (
            <button
              key={cat.name}
              type="button"
              className={`category-btn ${isActive ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.name)}
              aria-pressed={isActive}
            >
              <img
                className="cat-icon"
                src={matchingFood ? getImageUrl(matchingFood.image) : fallbackImage}
                alt=""
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = fallbackImage;
                }}
              />
              <span className="cat-name">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryFilter;