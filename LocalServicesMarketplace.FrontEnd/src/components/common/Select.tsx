import { type SelectHTMLAttributes, type ReactNode, forwardRef } from "react";
import styles from "./Select.module.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      leftIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className={styles.selectWrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <div
          className={`${styles.selectContainer} ${error ? styles.error : ""} ${
            disabled ? styles.disabled : ""
          }`}
        >
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          <select
            ref={ref}
            className={`${styles.select} ${
              leftIcon ? styles.hasLeftIcon : ""
            } ${className || ""}`}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className={styles.arrow}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
        {helperText && !error && (
          <span className={styles.helperText}>{helperText}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
