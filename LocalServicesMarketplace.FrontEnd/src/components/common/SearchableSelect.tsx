import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, X } from "lucide-react";
import styles from "./SearchableSelect.module.css";

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  disabled?: boolean;
  error?: string;
  groupBy?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  id,
  disabled = false,
  error,
  groupBy = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search
  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.group?.toLowerCase().includes(search.toLowerCase())
  );

  // Group options if needed
  const groupedOptions = groupBy
    ? filteredOptions.reduce((acc, opt) => {
        const group = opt.group || "Other";
        if (!acc[group]) acc[group] = [];
        acc[group].push(opt);
        return acc;
      }, {} as Record<string, SelectOption[]>)
    : null;

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 300; // approximate max height

      const openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setDropdownStyle({
        position: "fixed",
        top: openAbove ? "auto" : `${rect.bottom + 4}px`,
        bottom: openAbove ? `${window.innerHeight - rect.top + 4}px` : "auto",
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        maxHeight: `${Math.min(
          dropdownHeight,
          openAbove ? spaceAbove - 20 : spaceBelow - 20
        )}px`,
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        // Also check if click is inside the portal dropdown
        const dropdown = document.getElementById("searchable-select-dropdown");
        if (dropdown && dropdown.contains(e.target as Node)) {
          return;
        }
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update position on scroll/resize
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
    }

    return () => {
      window.removeEventListener("scroll", updateDropdownPosition, true);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [isOpen]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  const handleToggle = () => {
    if (!disabled) {
      if (!isOpen) {
        updateDropdownPosition();
      }
      setIsOpen(!isOpen);
    }
  };

  const dropdownContent = isOpen && (
    <div
      id="searchable-select-dropdown"
      className={styles.dropdown}
      style={dropdownStyle}
    >
      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className={styles.searchInput}
        />
      </div>

      <div className={styles.optionsList}>
        {filteredOptions.length === 0 ? (
          <div className={styles.noResults}>No results found</div>
        ) : groupBy && groupedOptions ? (
          Object.entries(groupedOptions).map(([group, opts]) => (
            <div key={group} className={styles.group}>
              <div className={styles.groupLabel}>{group}</div>
              {opts.map((opt) => (
                <div
                  key={opt.value}
                  className={`${styles.option} ${
                    opt.value === value ? styles.selected : ""
                  }`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          ))
        ) : (
          filteredOptions.map((opt) => (
            <div
              key={opt.value}
              className={`${styles.option} ${
                opt.value === value ? styles.selected : ""
              }`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.container} ref={containerRef}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      <div
        className={`${styles.selectButton} ${isOpen ? styles.open : ""} ${
          disabled ? styles.disabled : ""
        } ${error ? styles.error : ""}`}
        onClick={handleToggle}
      >
        <span className={selectedOption ? styles.value : styles.placeholder}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className={styles.icons}>
          {value && !disabled && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="Clear selection"
            >
              <X size={16} />
            </button>
          )}
          <ChevronDown
            size={18}
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          />
        </div>
      </div>

      {/* Render dropdown in a portal to avoid overflow issues */}
      {createPortal(dropdownContent, document.body)}

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
