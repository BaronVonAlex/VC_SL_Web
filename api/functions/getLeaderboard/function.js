module.exports = async function (context, req) {
  try {
    const { period, category, month, year, limit, minimumMonths } = req.query;

    const params = new URLSearchParams({
      period: period || 2,
      category: category || 0,
      limit: limit || 100,
      minimumMonths: minimumMonths || 1
    });

    if (month) params.append('month', month);
    if (year) params.append('year', year);

    const response = await fetch(
      `https://vcsl.azurewebsites.net/api/Leaderboard?${params}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': process.env.REACT_APP_API_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      context.res = {
        status: response.status,
        body: { error: 'Failed to fetch leaderboard' }
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