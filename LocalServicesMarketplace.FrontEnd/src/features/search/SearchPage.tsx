import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, X, Loader2 } from "lucide-react";
import {
  providerService,
  type ProviderListItem,
} from "../../services/providerService";
import { categoryService, type Category } from "../../services/categoryService";
import { SearchFilters } from "./components/SearchFilters";
import { ProviderCard } from "./components/ProviderCard";
import { Button } from "../../components/common";
import { countries } from "../../data/romania-locations";
import styles from "./SearchPage.module.css";

export interface FilterState {
  category: string;
  city: string;
  minRating: number | null;
  sortBy: "rating" | "reviews" | "name";
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [providers, setProviders] = useState<ProviderListItem[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<
    ProviderListItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get("category") || "",
    city: searchParams.get("city") || "",
    minRating: null,
    sortBy: "rating",
  });

  // Get all cities
  const allCities = countries.flatMap((county) =>
    county.cities.map((city) => city.name)
  );
  const uniqueCities = [...new Set(allCities)].sort();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const data = await providerService.getAll();
        setProviders(data);
      } catch (err) {
        console.error("Error fetching providers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...providers];

    // Filter by search query (business name or description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.businessName.toLowerCase().includes(query) ||
          p.businessDescription?.toLowerCase().includes(query)
      );
    }

    // Filter by category - check if provider has services in that category
    if (filters.category) {
      // Note: We'd need to fetch services or have category info on provider
      // For now, filter by checking if businessDescription mentions category
      const cat = filters.category.toLowerCase();
      result = result.filter(
        (p) =>
          p.businessDescription?.toLowerCase().includes(cat) ||
          p.businessName.toLowerCase().includes(cat)
      );
    }

    // Filter by city
    if (filters.city) {
      result = result.filter(
        (p) => p.city?.toLowerCase() === filters.city.toLowerCase()
      );
    }

    // Filter by minimum rating
    if (filters.minRating !== null) {
      result = result.filter(
        (p) => p.rating !== null && p.rating >= filters.minRating!
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "rating":
          if (a.rating === null && b.rating === null) return 0;
          if (a.rating === null) return 1;
          if (b.rating === null) return -1;
          return b.rating - a.rating;
        case "reviews":
          return b.totalReviews - a.totalReviews;
        case "name":
          return a.businessName.localeCompare(b.businessName);
        default:
          return 0;
      }
    });

    setFilteredProviders(result);
  }, [providers, searchQuery, filters]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (filters.category) params.set("category", filters.category);
    if (filters.city) params.set("city", filters.city);
    setSearchParams(params, { replace: true });
  }, [searchQuery, filters.category, filters.city, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: "",
      city: "",
      minRating: null,
      sortBy: "rating",
    });
    setSearchQuery("");
  };

  const hasActiveFilters = Boolean(
    filters.category ||
      filters.city ||
      filters.minRating !== null ||
      searchQuery
  );

  return (
    <div className={styles.page}>
      {/* Search Header */}
      <div className={styles.searchHeader}>
        <div className={styles.searchHeaderContent}>
          <h1 className={styles.pageTitle}>Find Service Providers</h1>

          <form className={styles.searchBar} onSubmit={handleSearch}>
            <div className={styles.searchInputWrapper}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={() => setSearchQuery("")}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </form>

          {/* Mobile filter toggle */}
          <button
            className={styles.mobileFilterToggle}
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal size={20} />
            Filters
            {hasActiveFilters && <span className={styles.filterBadge} />}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Filters Sidebar */}
        <aside
          className={`${styles.sidebar} ${
            showMobileFilters ? styles.sidebarOpen : ""
          }`}
        >
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Filters</h2>
            <button
              className={styles.closeSidebar}
              onClick={() => setShowMobileFilters(false)}
            >
              <X size={24} />
            </button>
          </div>

          <SearchFilters
            filters={filters}
            categories={categories}
            cities={uniqueCities}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>

        {/* Backdrop for mobile */}
        {showMobileFilters && (
          <div
            className={styles.backdrop}
            onClick={() => setShowMobileFilters(false)}
          />
        )}

        {/* Results */}
        <main className={styles.results}>
          {/* Results header */}
          <div className={styles.resultsHeader}>
            <p className={styles.resultsCount}>
              {loading ? (
                "Loading..."
              ) : (
                <>
                  <strong>{filteredProviders.length}</strong>{" "}
                  {filteredProviders.length === 1 ? "provider" : "providers"}{" "}
                  found
                  {hasActiveFilters && " (filtered)"}
                </>
              )}
            </p>

            {hasActiveFilters && (
              <button
                className={styles.clearAllButton}
                onClick={handleClearFilters}
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Active filters tags */}
          {hasActiveFilters && (
            <div className={styles.activeFilters}>
              {searchQuery && (
                <span className={styles.filterTag}>
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.category && (
                <span className={styles.filterTag}>
                  {filters.category}
                  <button onClick={() => handleFilterChange({ category: "" })}>
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.city && (
                <span className={styles.filterTag}>
                  <MapPin size={14} />
                  {filters.city}
                  <button onClick={() => handleFilterChange({ city: "" })}>
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.minRating !== null && (
                <span className={styles.filterTag}>
                  {filters.minRating}+ stars
                  <button
                    onClick={() => handleFilterChange({ minRating: null })}
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Results grid */}
          {loading ? (
            <div className={styles.loadingState}>
              <Loader2 className={styles.spinner} size={40} />
              <p>Loading providers...</p>
            </div>
          ) : filteredProviders.length > 0 ? (
            <div className={styles.providersGrid}>
              {filteredProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onClick={() => navigate(`/providers/${provider.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Search size={48} className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>No providers found</h3>
              <p className={styles.emptyText}>
                Try adjusting your search or filters to find what you're looking
                for.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
