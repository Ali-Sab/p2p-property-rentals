import { useState, useEffect } from 'react';
import APIContext from '../../contexts/APIContext'
import Navigation from '../Navigation'
import { useLocation, useNavigate, Outlet } from 'react-router-dom';

function Layout(props) {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");
  const [user, setUser] = useState(Number(localStorage.getItem("user")));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken"));
  const [authToken, setAuthToken] = useState("");
  const [firstName, setFirstName] = useState(localStorage.getItem("firstName"));
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar"));
  const navigate = useNavigate();
  const location = useLocation();
  const [url, setUrl] = useState(null);
  useEffect(() => {
    setUrl(location.pathname);
    if (!isLoggedIn && location.pathname !== "/login" && location.pathname !== "/register" && !/\/property\/[0-9]+/.test(location.pathname)) {
      navigate("/login")
    }
    else if (isLoggedIn && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/')
    }
  }, [isLoggedIn, navigate, location]);

  return <APIContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser, refreshToken, setRefreshToken, authToken, setAuthToken, firstName, setFirstName, avatar, setAvatar }}>
    <Navigation />
    <div className="main">
      <Outlet />
    </div>
  </APIContext.Provider>
}

export default Layout