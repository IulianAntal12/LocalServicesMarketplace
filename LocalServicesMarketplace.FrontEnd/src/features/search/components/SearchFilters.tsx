import { Star } from "lucide-react";
import type { Category } from "../../../services/categoryService";
import type { FilterState } from "../SearchPage";
import { Button, SearchableSelect, Input } from "../../../components/common";
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
  { value: "distance", label: "Nearest First" },
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
  // Build category options
  const categoryOptions = categories.map((cat) => ({
    value: cat.name,
    label: cat.name,
  }));

  // Build city options
  const cityOptions = cities.map((city) => ({
    value: city,
    label: city,
  }));

  // Build sort options
  const sortSelectOptions = sortOptions.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  // Handle radius change - only allow positive integers
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string (to clear) or positive integers
    if (value === "") {
      onFilterChange({ radius: null });
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0 && numValue <= 500) {
        onFilterChange({ radius: numValue });
      }
    }
  };

  return (
    <div className={styles.filters}>
      {/* Sort By */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Sort By</label>
        <SearchableSelect
          options={sortSelectOptions}
          value={filters.sortBy}
          onChange={(value) =>
            onFilterChange({ sortBy: value as FilterState["sortBy"] })
          }
          placeholder="Select sort order..."
        />
      </div>

      {/* Category Filter */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>Category</label>
        <SearchableSelect
          options={categoryOptions}
          value={filters.category}
          onChange={(value) => onFilterChange({ category: value })}
          placeholder="All Categories"
        />
      </div>

      {/* City Filter */}
      <div className={styles.filterGroup}>
        <label className={styles.filterLabel}>City</label>
        <SearchableSelect
          options={cityOptions}
          value={filters.city}
          onChange={(value) => onFilterChange({ city: value })}
          placeholder="All Cities"
        />
      </div>

      {/* Radius Filter - only show when city is selected */}
      {filters.city && (
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            Search Radius (km)
          </label>
          <div className={styles.radiusInput}>
            <Input
              type="number"
              min="1"
              max="500"
              placeholder="e.g. 50"
              value={filters.radius ?? ""}
              onChange={handleRadiusChange}
            />
            <span className={styles.radiusHint}>
              {filters.radius 
                ? `Searching within ${filters.radius} km of ${filters.city}`
                : "Leave empty for exact city match"}
            </span>
          </div>
        </div>
      )}

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
        <Button variant="outline" onClick={onClearFilters} fullWidth>
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
