import { useContext, useEffect, useState } from 'react';
import APIContext from '../../contexts/APIContext';
import { Link, json, useNavigate } from 'react-router-dom';
import { login, sendRequest } from '../../NetworkUtils';

function Login(props) {
  const { setIsLoggedIn, setUser, setFirstName, setAvatar } = useContext(APIContext);
  const [loginFailed, setLoginFailed] = useState(false);
  const [profileNotExist, setProfileNotExist] = useState(false);
  const navigate = useNavigate();

  async function loginHandler(event) {
    event.preventDefault();

    let jsonData = JSON.stringify({
      username: event.target.username.value,
      password: event.target.password.value,
      remember_me: event.target.remember_me.checked
    });

    try {
      let responseJson = await login(jsonData);
      setUser(responseJson.id);
      localStorage.setItem("user", responseJson.id);
    } catch (error) {
      setLoginFailed(true);
      setIsLoggedIn(false);
      localStorage.setItem("isLoggedIn", "false");
      return;
    }

    const url = "http://localhost:8000/users/view/self/";

    try {
      let responseJson = await sendRequest(url, "GET");
      setFirstName(responseJson.first_name);
      setAvatar(responseJson.avatar);
      setIsLoggedIn(true);
      localStorage.setItem("firstName", responseJson.first_name);
      localStorage.setItem("avatar", responseJson.avatar);
      localStorage.setItem("isLoggedIn", "true");
      setLoginFailed(false);
      navigate("/")
    } catch (error) {
      setIsLoggedIn(false);
      localStorage.setItem("isLoggedIn", "false");
      setProfileNotExist(true);
    }
  }

  return <>
    <form className="login-form" onSubmit={(e) => loginHandler(e)}>
      <div className="mb-3">
        <label htmlFor="inputEmail1" className="form-label">Email address</label>
        <input type="email" className="form-control" id="inputEmail1" name="username" aria-describedby="emailHelp" />
      </div>
      <div className="mb-3">
        <label htmlFor="inputPassword1" className="form-label">Password</label>
        <input type="password" className="form-control" id="inputPassword1" name="password" />
      </div>
      <div className="mb-3 form-check">
        <input type="checkbox" className="form-check-input" id="check1" name="remember_me" />
        <label className="form-check-label" htmlFor="check1">Keep me logged in</label>
      </div>
      <div className="mb-3 pull-left">
        <button type="submit" className="btn btn-primary me-2">Login</button>
        <Link className="mx-lg-4" to="/register">Don't have an account? Register now</Link>
      </div>
      {loginFailed ? <p className="text-danger">Unknown username or password</p> : <div></div>}
      {profileNotExist ? <p className="text-danger">Your account does not exist. Contact support.</p> : <div></div>}
    </form>
  </>
}

export default Login;