import "./SearchBar.css";
import { Search, X } from "lucide-react";

function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="search-bar-wrap">
      <div className="search-container" role="search">
        <span className="search-icon" aria-hidden="true"><Search size={19} /></span>

        <input
          type="text"
          placeholder="Search delicious meals, biryani, snacks, drinks..."
          aria-label="Search the menu"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        {searchTerm && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => setSearchTerm("")}
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;