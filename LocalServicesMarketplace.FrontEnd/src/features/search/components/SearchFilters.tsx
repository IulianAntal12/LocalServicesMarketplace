import { Star } from "lucide-react";
import type { Category } from "../../../services/categoryService";
import type { FilterState } from "../SearchPage";
import { Button } from "../../../components/common";
import styles from "./SearchFilters.module.css";

interface SearchFiltersProps {
  filters: FilterState;
  categories: Category[];
  cities: string[];
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const ratingOptions = [
  { value: 4.5, label: "4.5 & up" },
  { value: 4, label: "4.0 & up" },
  { value: 3.5, label: "3.5 & up" },
  { value: 3, label: "3.0 & up" },
];

const sortOptions = [
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviews" },
  { value: "name", label: "Name (A-Z)" },
];

export function SearchFilters({
  filters,
  categories,
  cities,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
}: SearchFiltersProps) {
  return (
    <div className={styles.filters}>
      {/* Sort By */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onFilterChange({ sortBy: e.target.value as FilterState["sortBy"] })
          }
          className={styles.select}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Category</label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
          className={styles.select}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* City Filter */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>City</label>
        <select
          value={filters.city}
          onChange={(e) => onFilterChange({ city: e.target.value })}
          className={styles.select}
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Rating Filter */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Minimum Rating</label>
        <div className={styles.ratingOptions}>
          <button
            className={`${styles.ratingOption} ${
              filters.minRating === null ? styles.ratingOptionActive : ""
            }`}
            onClick={() => onFilterChange({ minRating: null })}
          >
            Any
          </button>
          {ratingOptions.map((option) => (
            <button
              key={option.value}
              className={`${styles.ratingOption} ${
                filters.minRating === option.value
                  ? styles.ratingOptionActive
                  : ""
              }`}
              onClick={() => onFilterChange({ minRating: option.value })}
            >
              <Star size={14} fill="currentColor" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className={styles.clearFilters}>
          <Button variant="outline" fullWidth onClick={onClearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
