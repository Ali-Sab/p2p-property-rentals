import { createContext } from "react";

const APIContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  user: 0,
  setUser: () => {},
  refreshToken: "",
  setRefreshToken: () => {},
  authToken: "",
  setAuthToken: () => {},
  firstName: "",
  setFirstName: () => {},
  avatar: "",
  setAvatar: () => {}
});

export default APIContext;