module.exports = async function (context, req) {
  try {
    const { userId } = req.query;
    const body = req.body;

    if (!userId) {
      context.res = {
        status: 400,
        body: { error: 'userId is required' }
      };
      return;
    }

    const response = await fetch(
      `https://vcsl.azurewebsites.net/api/Users/UpdateUser/${userId}`,
      {
        method: 'PUT',
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
        body: { error: 'Failed to update user' }
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