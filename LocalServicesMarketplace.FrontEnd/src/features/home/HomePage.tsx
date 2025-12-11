import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "../../components/common";
import styles from "./HomePage.module.css";

// Category data
const categories = [
  { id: 1, name: "Plumbing", icon: Wrench, count: 45, color: "#3B82F6" },
  { id: 2, name: "Electrical", icon: Zap, count: 38, color: "#F59E0B" },
  { id: 3, name: "Handyman", icon: Hammer, count: 62, color: "#8B5CF6" },
  { id: 4, name: "Cleaning", icon: Sparkles, count: 51, color: "#EC4899" },
  { id: 5, name: "Painting", icon: Paintbrush, count: 29, color: "#10B981" },
  { id: 6, name: "Landscaping", icon: TreePine, count: 23, color: "#22C55E" },
  { id: 7, name: "HVAC", icon: Wind, count: 17, color: "#06B6D4" },
  { id: 8, name: "Carpentry", icon: Building, count: 34, color: "#D97706" },
];

// Mock featured providers - replace with API call
const featuredProviders = [
  {
    id: "1",
    name: "John's Plumbing",
    category: "Plumbing",
    rating: 4.8,
    reviews: 127,
    price: "$75/hr",
    location: "Downtown",
  },
  {
    id: "2",
    name: "Lightning Electric",
    category: "Electrical",
    rating: 4.9,
    reviews: 89,
    price: "$85/hr",
    location: "Northside",
  },
  {
    id: "3",
    name: "HandyPro Services",
    category: "Handyman",
    rating: 4.7,
    reviews: 203,
    price: "$60/hr",
    location: "Westend",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/search?q=${encodeURIComponent(
        searchQuery
      )}&location=${encodeURIComponent(location)}`
    );
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/search?category=${encodeURIComponent(categoryName)}`);
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
              <input
                type="text"
                placeholder="Your location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={styles.searchInput}
              />
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

          <div className={styles.categoriesGrid}>
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <div
                  key={cat.id}
                  className={styles.categoryCard}
                  onClick={() => handleCategoryClick(cat.name)}
                >
                  <div
                    className={styles.categoryIcon}
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <IconComponent size={28} color={cat.color} />
                  </div>
                  <h3 className={styles.categoryName}>{cat.name}</h3>
                  <span className={styles.categoryCount}>
                    {cat.count} providers
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Providers Section */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <h2 className={styles.sectionTitle}>Top Rated Providers</h2>
              <p className={styles.sectionSubtitle}>
                Trusted professionals with excellent reviews
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/search?sortBy=rating")}
              rightIcon={<ChevronRight size={16} />}
            >
              View All
            </Button>
          </div>

          <div className={styles.providersGrid}>
            {featuredProviders.map((provider) => (
              <div
                key={provider.id}
                className={styles.providerCard}
                onClick={() => navigate(`/providers/${provider.id}`)}
              >
                <div className={styles.providerHeader}>
                  <div className={styles.providerAvatar}>
                    {provider.name.charAt(0)}
                  </div>
                  <div className={styles.providerInfo}>
                    <h3 className={styles.providerName}>{provider.name}</h3>
                    <span className={styles.providerCategory}>
                      {provider.category}
                    </span>
                  </div>
                </div>

                <div className={styles.providerMeta}>
                  <div className={styles.providerRating}>
                    <Star size={16} fill="#F59E0B" color="#F59E0B" />
                    <span className={styles.ratingValue}>
                      {provider.rating}
                    </span>
                    <span className={styles.ratingCount}>
                      ({provider.reviews})
                    </span>
                  </div>
                  <span className={styles.metaDivider}>•</span>
                  <div className={styles.providerLocation}>
                    <MapPin size={14} />
                    <span>{provider.location}</span>
                  </div>
                </div>

                <div className={styles.providerFooter}>
                  <span className={styles.providerPrice}>{provider.price}</span>
                  <Button variant="primary" size="sm">
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
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
            onClick={() => navigate("/register")}
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
