export const mockUsers = [
    {
      username: "admin",
      password: "admin123",
      id: 18715508
    },
    {
      username: "test",
      password: "test123",
      id: 10050
    }
  ];
  
  export const validateCredentials = (username, password) => {
    const user = mockUsers.find(
      user => user.username === username && user.password === password
    );
    
    if (user) {
      return {
        success: true,
        userId: user.id,
        message: "Login successful"
      };
    }
    
    return {
      success: false,
      message: "Invalid username or password"
    };
  };