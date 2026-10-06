import { Pencil, Trash2 } from "lucide-react";

function FoodTable({ foods, onEdit, onDelete }) {
  const getStockStatus = (stock) => {
    if (stock === 0) {
      return {
        text: "Out of Stock",
        className: "out-stock",
      };
    }

    if (stock <= 5) {
      return {
        text: "Low Stock",
        className: "low-stock",
      };
    }

    return {
      text: "Available",
      className: "available",
    };
  };

  const getImageUrl = (image) => {
    if (!image) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=160&h=160&q=80";
    return image.startsWith("http") ? image : `http://localhost:5000${image}`;
  };

  return (
    <div className="food-table-container">

      <table className="food-table">

        <thead>
          <tr>
            <th>Food</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {foods.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty-table">
                No food items found
              </td>
            </tr>
          ) : (
            foods.map((food) => {

              const status = getStockStatus(food.stock);

              return (
                <tr key={food.id}>

                  <td>
                    <div className="food-name-cell">

                     <div className="food-image">
                        <img
                        src={getImageUrl(food.image)}
                        alt={food.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=160&h=160&q=80";
                        }}
                        />
                    </div>

                      <strong>{food.name}</strong>

                    </div>
                  </td>

                  <td>{food.category}</td>

                  <td>₹{food.price}</td>

                  <td>
                    <strong>{food.stock}</strong>
                  </td>

                  <td>
                    <span className={`food-status ${status.className}`}>
                      {status.text}
                    </span>
                  </td>

                  <td>

                    <div className="food-actions">

                      <button
                        className="edit-btn"
                        onClick={() => onEdit(food)}
                        title="Edit"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </button>

                      <button
                        className="delete-btn"
                        onClick={(e) => {
                        e.stopPropagation();
                        onDelete(food._id);
                      }}
                      >
                      <Trash2 size={16} aria-hidden="true" />
                      </button>

                    </div>

                  </td>

                </tr>
              );
            })
          )}

        </tbody>

      </table>

    </div>
  );
}

export default FoodTable;