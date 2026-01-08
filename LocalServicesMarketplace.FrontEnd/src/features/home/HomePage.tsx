import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  ChevronRight,
  Star,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Sparkles,
  TreePine,
  Wind,
  Building,
  Loader2,
  Grid3X3,
} from "lucide-react";
import { Button } from "../../components/common";
import { categoryService, type Category } from "../../services/categoryService";
import {
  providerService,
  type ProviderListItem,
} from "../../services/providerService";
import { counties } from "../../data/romania-locations";
import styles from "./HomePage.module.css";

// Icon mapping for categories
const categoryIcons: Record<
  string,
  React.ComponentType<{ size?: number; color?: string }>
> = {
  Plumbing: Wrench,
  Electrical: Zap,
  Handyman: Hammer,
  Cleaning: Sparkles,
  Painting: Paintbrush,
  Landscaping: TreePine,
  HVAC: Wind,
  Carpentry: Building,
};

// Color mapping for categories
const categoryColors: Record<string, string> = {
  Plumbing: "#3B82F6",
  Electrical: "#F59E0B",
  Handyman: "#8B5CF6",
  Cleaning: "#EC4899",
  Painting: "#10B981",
  Landscaping: "#22C55E",
  HVAC: "#06B6D4",
  Carpentry: "#D97706",
};

// Default icon and color for unknown categories
const defaultIcon = Grid3X3;
const defaultColor = "#6B7280";

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [featuredProviders, setFeaturedProviders] = useState<
    ProviderListItem[]
  >([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Get all cities from Romania data
  const allCities = counties.flatMap((county) =>
    county.cities.map((city) => ({
      name: city.name,
      county: county.name,
      fullName: `${city.name}, ${county.name}`,
    }))
  );

  // Filter cities based on search
  const filteredCities = allCities
    .filter((city) =>
      city.fullName.toLowerCase().includes(citySearch.toLowerCase())
    )
    .slice(0, 10);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch featured providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoadingProviders(true);
        const providers = await providerService.getAll();
        // Get top 6 providers sorted by rating
        const sorted = providers
          .filter((p) => p.businessName)
          .sort((a, b) => {
            if (a.rating === null && b.rating === null)
              return b.totalReviews - a.totalReviews;
            if (a.rating === null) return 1;
            if (b.rating === null) return -1;
            if (b.rating !== a.rating) return b.rating - a.rating;
            return b.totalReviews - a.totalReviews;
          })
          .slice(0, 6);
        setFeaturedProviders(sorted);
      } catch (err) {
        console.error("Error fetching providers:", err);
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchProviders();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCity) params.set("city", selectedCity);
    navigate(`/search?${params.toString()}`);
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/search?category=${encodeURIComponent(categoryName)}`);
  };

  const handleCitySelect = (city: {
    name: string;
    county: string;
    fullName: string;
  }) => {
    setSelectedCity(city.name);
    setCitySearch(city.fullName);
    setShowCityDropdown(false);
  };

  const getCategoryIcon = (categoryName: string) => {
    return categoryIcons[categoryName] || defaultIcon;
  };

  const getCategoryColor = (categoryName: string) => {
    return categoryColors[categoryName] || defaultColor;
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroCircle1} />
          <div className={styles.heroCircle2} />
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Find Trusted Local
            <br />
            <span className={styles.heroHighlight}>Professionals</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Connect with skilled service providers in your neighborhood.
            <br />
            Quality work, fair prices, verified reviews.
          </p>

          {/* Search Box */}
          <form className={styles.searchBox} onSubmit={handleSearch}>
            <div className={styles.searchField}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="What service do you need?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.searchDivider} />
            <div className={styles.searchField}>
              <MapPin size={20} className={styles.searchIcon} />
              <div className={styles.locationInputWrapper}>
                <input
                  type="text"
                  placeholder="Select your city"
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setSelectedCity("");
                    setShowCityDropdown(true);
                  }}
                  onFocus={() => setShowCityDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowCityDropdown(false), 200)
                  }
                  className={styles.searchInput}
                />
                {showCityDropdown &&
                  citySearch &&
                  filteredCities.length > 0 && (
                    <div className={styles.cityDropdown}>
                      {filteredCities.map((city) => (
                        <div
                          key={city.fullName}
                          className={styles.cityOption}
                          onMouseDown={() => handleCitySelect(city)}
                        >
                          <MapPin size={14} />
                          <span>{city.fullName}</span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              rightIcon={<ChevronRight size={18} />}
            >
              Search
            </Button>
          </form>

          {/* Trust badges */}
          <div className={styles.trustBadges}>
            <span>✓ Verified Providers</span>
            <span>✓ Honest Reviews</span>
            <span>✓ Free to Browse</span>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Popular Services</h2>
            <p className={styles.sectionSubtitle}>
              Browse by category to find the right professional
            </p>
          </div>

          {loadingCategories ? (
            <div className={styles.loadingState}>
              <Loader2 className={styles.spinner} size={32} />
              <p>Loading categories...</p>
            </div>
          ) : categories.length > 0 ? (
            <div className={styles.categoriesGrid}>
              {categories.map((cat) => {
                const IconComponent = getCategoryIcon(cat.name);
                const color = getCategoryColor(cat.name);
                return (
                  <div
                    key={cat.id}
                    className={styles.categoryCard}
                    onClick={() => handleCategoryClick(cat.name)}
                  >
                    <div
                      className={styles.categoryIcon}
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <IconComponent size={28} color={color} />
                    </div>
                    <h3 className={styles.categoryName}>{cat.name}</h3>
                    {cat.description && (
                      <span className={styles.categoryDescription}>
                        {cat.description}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No categories available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Providers Section */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Top Rated Providers</h2>
            <p className={styles.sectionSubtitle}>
              Trusted professionals in your area
            </p>
          </div>

          {loadingProviders ? (
            <div className={styles.loadingState}>
              <Loader2 className={styles.spinner} size={32} />
              <p>Loading providers...</p>
            </div>
          ) : featuredProviders.length > 0 ? (
            <div className={styles.providersGrid}>
              {featuredProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={styles.providerCard}
                  onClick={() => navigate(`/providers/${provider.id}`)}
                >
                  <div className={styles.providerAvatar}>
                    <span className={styles.providerInitial}>
                      {provider.businessName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.providerInfo}>
                    <h3 className={styles.providerName}>
                      {provider.businessName}
                    </h3>
                    {provider.city && (
                      <p className={styles.providerLocation}>
                        <MapPin size={14} />
                        {provider.city}
                      </p>
                    )}
                    <div className={styles.providerMeta}>
                      {provider.rating !== null ? (
                        <span className={styles.providerRating}>
                          <Star size={14} fill="currentColor" />
                          {provider.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className={styles.providerRatingNew}>New</span>
                      )}
                      <span className={styles.providerReviews}>
                        {provider.totalReviews}{" "}
                        {provider.totalReviews === 1 ? "review" : "reviews"}
                      </span>
                    </div>
                    <p className={styles.providerServices}>
                      {provider.serviceCount}{" "}
                      {provider.serviceCount === 1 ? "service" : "services"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No providers available yet. Be the first to join!</p>
              <Button onClick={() => navigate("/register")}>
                Become a Provider
              </Button>
            </div>
          )}

          <div className={styles.sectionCta}>
            <Button variant="outline" onClick={() => navigate("/search")}>
              View All Providers
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={`${styles.sectionTitle} ${styles.centeredTitle}`}>
            How It Works
          </h2>

          <div className={styles.stepsGrid}>
            {[
              {
                step: "01",
                title: "Search",
                desc: "Find the service you need by category or keyword",
              },
              {
                step: "02",
                title: "Compare",
                desc: "Browse profiles, reviews, and prices",
              },
              {
                step: "03",
                title: "Connect",
                desc: "Contact the provider and get the job done",
              },
            ].map((item, index) => (
              <div key={index} className={styles.stepCard}>
                <div className={styles.stepNumber}>{item.step}</div>
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Ready to get started?</h2>
        <p className={styles.ctaSubtitle}>
          Join thousands of satisfied customers and trusted providers
        </p>
        <div className={styles.ctaButtons}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate("/search")}
          >
            Find a Provider
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/register?role=provider")}
            style={{ borderColor: "white", color: "white" }}
          >
            Become a Provider
          </Button>
        </div>
      </section>
    </div>
  );
}
