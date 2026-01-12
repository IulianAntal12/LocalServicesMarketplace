import { User, MapPin } from "lucide-react";
import { useAuth } from "../../../../context";
import { Button } from "../../../../components/common/Button";
import toast from "react-hot-toast";
import styles from "./CustomerProfileTab.module.css";

export function CustomerProfileTab() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{user?.fullName}</h2>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>
        </div>
      </div>

      <div className={styles.sections}>
        {/* Account Info */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <User size={18} />
            Informații cont
          </h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Nume complet</span>
              <span className={styles.infoValue}>{user?.fullName || "-"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{user?.email || "-"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tip cont</span>
              <span className={styles.infoValue}>Client</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <MapPin size={18} />
            Activitate
          </h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>-</span>
              <span className={styles.statLabel}>Programări totale</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>-</span>
              <span className={styles.statLabel}>Recenzii scrise</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>-</span>
              <span className={styles.statLabel}>Prestatori contactați</span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Acțiuni cont</h3>
          <div className={styles.actionsGrid}>
            <Button variant="outline" onClick={() => toast("În curând!")}>
              Schimbă parola
            </Button>
            <Button variant="outline" onClick={() => toast("În curând!")}>
              Setări notificări
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Membru din {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
