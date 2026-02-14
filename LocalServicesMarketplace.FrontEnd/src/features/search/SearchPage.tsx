import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Loader2,
  Navigation,
} from "lucide-react";
import {
  providerService,
  type ProviderListItem,
} from "../../services/providerService";
import { searchService } from "../../services/searchService";
import { categoryService, type Category } from "../../services/categoryService";
import { SearchFilters } from "./components/SearchFilters";
import { ProviderCard } from "./components/ProviderCard";
import { Button } from "../../components/common";
import { countries, findCity } from "../../data/romania-locations";
import styles from "./SearchPage.module.css";

export interface FilterState {
  category: string;
  city: string;
  radius: number | null;
  minRating: number | null;
  sortBy: "rating" | "distance" | "reviews" | "name";
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [providers, setProviders] = useState<ProviderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get("category") || "",
    city: searchParams.get("city") || "",
    radius: searchParams.get("radius")
      ? parseInt(searchParams.get("radius")!, 10)
      : null,
    minRating: null,
    sortBy: "rating",
  });

  // Get all unique cities for the filter dropdown
  const allCities = countries.flatMap((county) =>
    county.cities.map((city) => city.name),
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

  // Fetch providers with filters
  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);

      // Get city coordinates if city is selected
      let lat: number | undefined;
      let lng: number | undefined;

      if (filters.city) {
        const cityData = findCity(filters.city);
        if (cityData) {
          lat = cityData.city.lat;
          lng = cityData.city.lng;
        }
      }

      // Use search service if we have location-based search, otherwise get all
      if (lat && lng && filters.radius) {
        // Use backend search with Haversine distance calculation
        const response = await searchService.searchProviders({
          q: searchQuery || undefined,
          category: filters.category || undefined,
          lat,
          lng,
          radius: filters.radius,
          minRating: filters.minRating ?? undefined,
          sortBy: filters.sortBy === "name" ? "rating" : filters.sortBy,
          page: 1,
          pageSize: 100,
        });

        // Map response to ProviderListItem format
        const mappedProviders: ProviderListItem[] = response.providers.map(
          (p) => ({
            id: p.id,
            fullName: p.fullName,
            businessName: p.businessName,
            businessDescription: p.businessDescription ?? null,
            rating: p.rating ?? null,
            totalReviews: p.totalReviews,
            city: p.city ?? null,
            profilePictureUrl: p.profilePictureUrl ?? null,
            distanceKm: p.distanceKm ?? null,
          }),
        );

        setProviders(mappedProviders);
      } else {
        // Get all providers and filter locally
        const data = await providerService.getAll();
        let result = [...data];

        // Filter by search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          result = result.filter(
            (p) =>
              p.businessName.toLowerCase().includes(query) ||
              p.businessDescription?.toLowerCase().includes(query),
          );
        }

        // Filter by category
        if (filters.category) {
          const cat = filters.category.toLowerCase();
          result = result.filter(
            (p) =>
              p.businessDescription?.toLowerCase().includes(cat) ||
              p.businessName.toLowerCase().includes(cat),
          );
        }

        // Filter by exact city (when no radius)
        if (filters.city && !filters.radius) {
          result = result.filter(
            (p) => p.city?.toLowerCase() === filters.city.toLowerCase(),
          );
        }

        // Filter by minimum rating
        if (filters.minRating !== null) {
          result = result.filter(
            (p) => p.rating != null && p.rating >= filters.minRating!,
          );
        }

        // Sort locally
        result.sort((a, b) => {
          switch (filters.sortBy) {
            case "rating":
              if (a.rating === null && b.rating === null) return 0;
              if (a.rating === null) return 1;
              if (b.rating === null) return -1;
              return (b.rating ?? 0) - (a.rating ?? 0);
            case "reviews":
              return b.totalReviews - a.totalReviews;
            case "name":
              return a.businessName.localeCompare(b.businessName);
            default:
              return 0;
          }
        });

        setProviders(result);
      }
    } catch (err) {
      console.error("Error fetching providers:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  // Fetch providers when filters change
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (filters.category) params.set("category", filters.category);
    if (filters.city) params.set("city", filters.city);
    if (filters.radius) params.set("radius", filters.radius.toString());
    setSearchParams(params, { replace: true });
  }, [
    searchQuery,
    filters.category,
    filters.city,
    filters.radius,
    setSearchParams,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };

      // If city is cleared, also clear radius
      if (newFilters.city === "") {
        updated.radius = null;
      }

      return updated;
    });
  };

  const handleClearFilters = () => {
    setFilters({
      category: "",
      city: "",
      radius: null,
      minRating: null,
      sortBy: "rating",
    });
    setSearchQuery("");
  };

  const hasActiveFilters = Boolean(
    filters.category ||
    filters.city ||
    filters.radius ||
    filters.minRating !== null ||
    searchQuery,
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
                  <strong>{providers.length}</strong>{" "}
                  {providers.length === 1 ? "provider" : "providers"} found
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
                  {filters.radius && ` (${filters.radius} km)`}
                  <button
                    onClick={() =>
                      handleFilterChange({ city: "", radius: null })
                    }
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {filters.radius && !filters.city && (
                <span className={styles.filterTag}>
                  <Navigation size={14} />
                  {filters.radius} km radius
                  <button onClick={() => handleFilterChange({ radius: null })}>
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
          ) : providers.length > 0 ? (
            <div className={styles.grid}>
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onClick={() => navigate(`/providers/${provider.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Search size={48} />
              </div>
              <h3 className={styles.emptyTitle}>No providers found</h3>
              <p className={styles.emptyText}>
                {hasActiveFilters
                  ? "Try adjusting your filters or search terms"
                  : "There are no service providers available at the moment"}
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
