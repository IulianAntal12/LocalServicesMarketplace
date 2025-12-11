import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      helperText,
      type,
      className = "",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className={`${styles.wrapper} ${className}`}>
        {label && <label className={styles.label}>{label}</label>}
        <div
          className={`${styles.inputWrapper} ${error ? styles.hasError : ""}`}
        >
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          <input
            ref={ref}
            type={inputType}
            className={`${styles.input} ${leftIcon ? styles.hasLeftIcon : ""} ${
              isPassword || rightIcon ? styles.hasRightIcon : ""
            }`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          {!isPassword && rightIcon && (
            <span className={styles.rightIcon}>{rightIcon}</span>
          )}
        </div>
        {error && <span className={styles.error}>{error}</span>}
        {helperText && !error && (
          <span className={styles.helper}>{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
