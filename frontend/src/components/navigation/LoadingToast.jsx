import styles from "./NavigationLoadingIndicator.module.css";

export default function LoadingToast({ className = "" }) {
  return (
    <div className={`${styles.toast} ${className}`} role="status" aria-live="polite" aria-label="Loading">
      <span className={styles.spinner} aria-hidden="true" />
      <span>Loading...</span>
    </div>
  );
}
