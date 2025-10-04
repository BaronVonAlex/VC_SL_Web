const AdditionalInfo = ({ playerData, usernameHistory }) => {
  console.log('Props in AdditionalInfo:', { usernameHistory });

  let history = [];
  try {
    history = Array.isArray(usernameHistory) 
      ? usernameHistory 
      : JSON.parse(usernameHistory || '[]');
  } catch (error) {
    console.error('Error parsing usernameHistory:', error);
  }

  return (
    <div className="additional-info">
      <h3>Additional Info</h3>
      <p><strong>Joined:</strong> {new Date(playerData.since).toLocaleDateString()}</p>
      <p><strong>Last Seen:</strong> {new Date(playerData.seen).toLocaleDateString()}</p>
      <p><strong>Previous Name History:</strong> {history.length > 0 ? history.join(', ') : "No History"}</p>
    </div>
  );
};

export default AdditionalInfo;
