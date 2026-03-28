import { useNavigate } from 'react-router-dom';
import { FaStar, FaTrash, FaSearch } from 'react-icons/fa';
import { useFavorites } from './FavoriteContext';
import '../styles/Favorites.css';

const Favorites = () => {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();

  const handlePlayerClick = (playerId) => {
    navigate('/', { state: { searchPlayerId: playerId } });
  };

  const handleRemove = (e, playerId) => {
    e.stopPropagation();
    removeFavorite(playerId);
  };

  const sortedFavorites = [...favorites].sort((a, b) => b.addedAt - a.addedAt);
  const isEmpty = favorites.length === 0;

  return (
    <div className="favorites-container">
      <div className="favorites-card">
        <header className="favorites-header">
          <div className="header-title">
            <FaStar className="header-icon" />
            <h1>Favorite Players</h1>
          </div>
          <p className="subtitle">Your saved players for quick access</p>
        </header>

        {isEmpty ? (
          <div className="empty-state">
            <FaStar className="empty-icon" />
            <h3>No Favorites Yet</h3>
            <p>Click the star icon on any player card to add them to your favorites</p>
          </div>
        ) : (
          <div className="favorites-grid">
            {sortedFavorites.map(({ id, name }) => (
              <article
                key={id}
                className="favorite-card"
                onClick={() => handlePlayerClick(id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handlePlayerClick(id);
                }}
              >
                <div className="favorite-info">
                  <FaStar className="star-icon" aria-hidden="true" />
                  <div className="favorite-details">
                    <div className="favorite-name">{name}</div>
                    <div className="favorite-id">ID: {id}</div>
                  </div>
                </div>

                <div className="favorite-actions">
                  <button
                    onClick={(e) => handleRemove(e, id)}
                    className="remove-btn"
                    aria-label={`Remove ${name} from favorites`}
                  >
                    <FaTrash aria-hidden="true" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayerClick(id);
                    }}
                    className="view-btn"
                    aria-label={`View ${name} player details`}
                  >
                    <FaSearch aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;