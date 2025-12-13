module.exports = async function (context, req) {
  try {
    const body = req.body;

    const response = await fetch(
      `https://vcsl.azurewebsites.net/api/Winrate/UpdateWinrate`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.REACT_APP_API_SECRET,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      context.res = {
        status: response.status,
        body: { error: 'Failed to update winrate' }
      };
      return;
    }

    const data = await response.json();
    context.res = {
      status: 200,
      body: data
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
};