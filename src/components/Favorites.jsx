import { useNavigate } from 'react-router-dom';
import { FaStar, FaTrash, FaSearch } from 'react-icons/fa';
import { useFavorites } from '../../src/components/FavoriteContext.jsx';
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

  return (
    <div className="favorites-container">
      <div className="favorites-card">
        <div className="favorites-header">
          <div className="header-title">
            <FaStar className="header-icon" />
            <h1>Favorite Players</h1>
          </div>
          <p className="subtitle">Your saved players for quick access</p>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state">
            <FaStar className="empty-icon" />
            <h3>No Favorites Yet</h3>
            <p>Click the star icon on any player card to add them to your favorites</p>
          </div>
        ) : (
          <div className="favorites-grid">
            {sortedFavorites.map((fav) => (
              <div
                key={fav.id}
                className="favorite-card"
                onClick={() => handlePlayerClick(fav.id)}
              >
                <div className="favorite-info">
                  <FaStar className="star-icon" />
                  <div className="favorite-details">
                    <div className="favorite-name">{fav.name}</div>
                    <div className="favorite-id">ID: {fav.id}</div>
                  </div>
                </div>
                <div className="favorite-actions">
                  <button
                    onClick={(e) => handleRemove(e, fav.id)}
                    className="remove-btn"
                    aria-label="Remove favorite"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => handlePlayerClick(fav.id)}
                    className="view-btn"
                    aria-label="View player"
                  >
                    <FaSearch />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;