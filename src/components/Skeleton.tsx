import '../styles/Skeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton = ({ width = '100%', height = '1rem', borderRadius = '4px', className = '' }: SkeletonProps) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius }}
    aria-hidden="true"
  />
);

export const PlayerCardSkeleton = () => (
  <div className="player-card skeleton-card">
    <div className="player-card-content">
      <div className="sidebar">
        <div className="sidebar-section">
          <div className="player-header-with-star">
            <Skeleton width="60%" height="1.5rem" />
          </div>
          <Skeleton width="40%" height="1rem" className="skeleton-mt" />
          <Skeleton width="80px" height="80px" borderRadius="50%" className="skeleton-avatar" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="info-row skeleton-row">
              <Skeleton width="30%" height="0.875rem" />
              <Skeleton width="50%" height="0.875rem" />
            </div>
          ))}
        </div>
        <div className="sidebar-section">
          <Skeleton width="40%" height="1rem" className="skeleton-mt" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="info-row skeleton-row">
              <Skeleton width="30%" height="0.875rem" />
              <Skeleton width="50%" height="0.875rem" />
            </div>
          ))}
        </div>
      </div>
      <div className="main-content">
        <div className="skeleton-stats-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-stat-card">
              <Skeleton width="60%" height="1.25rem" className="skeleton-mb" />
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} width="80%" height="0.875rem" className="skeleton-mt-sm" />
              ))}
            </div>
          ))}
        </div>
        <div className="skeleton-chart">
          <Skeleton width="100%" height="300px" borderRadius="8px" />
        </div>
      </div>
    </div>
  </div>
);

export const LeaderboardRowSkeleton = () => (
  <div className="table-row skeleton-row-lb" aria-hidden="true">
    <div className="rank-cell"><Skeleton width="24px" height="24px" borderRadius="50%" /></div>
    <div className="player-name"><Skeleton width="120px" height="1rem" /></div>
    <div className="winrate-cell"><Skeleton width="60px" height="1.5rem" borderRadius="20px" /></div>
    <div className="months-cell"><Skeleton width="24px" height="1rem" /></div>
  </div>
);
