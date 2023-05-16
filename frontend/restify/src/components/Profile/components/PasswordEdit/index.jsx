import { useNavigate } from "react-router-dom";
import APIContext from "../../../../contexts/APIContext";
import { useContext, useState } from "react";
import { sendRequest } from "../../../../NetworkUtils";

function PasswordEdit(props) {
  const { setIsLoggedIn, user, setUser, authToken, setAuthToken, refreshToken, setRefreshToken } = useContext(APIContext);
  const navigate = useNavigate();
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [errorMsgs, setErrorMsgs] = useState({});

  async function editPasswordHandler(event) {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append("password", event.target.password.value);
    formdata.append("confirm_password", event.target.confirmPassword.value);

    const url = "http://localhost:8000/users/edit-password/";

    try {
      let responseJson = await sendRequest(url, "PUT", formdata);
      props.success();
    } catch (error) {
      let errorJson = JSON.parse(error.message);
      if (errorJson.status === 404) {
        navigate("/404");
      } else if (errorJson.status === 401) {
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
        navigate('/login')
      } else {
        setPasswordErrorMsg("Failed to change password. Please check errors and try again.");
        setErrorMsgs(errorJson.response);
      }
    }
  }
  
  return <form className="w-100" onSubmit={(e) => editPasswordHandler(e)}>
    <div className="mb-3">
      <label htmlFor="inputPassword1" className="form-label">Password</label>
      <input type="password" className="form-control" id="inputPassword1" name="password" style={{ backgroundColor: (errorMsgs['password'] ? "red" : "white")}}/>
      {errorMsgs['password'] ? <p className="text-danger">{errorMsgs['password']}</p> : <div></div>}
    </div>
    <div className="mb-3">
      <label htmlFor="inputPassword2" className="form-label">Confirm Password</label>
      <input type="password" className="form-control" id="inputPassword2" name="confirmPassword" style={{ backgroundColor: (errorMsgs['confirm_password'] ? "red" : "white")}}/>
      {errorMsgs['confirm_password'] ? <p className="text-danger">{errorMsgs['confirm_password']}</p> : <div></div>}
    </div>
    <div className="mb-3 d-flex justify-content-end">
      <button type="button" className="btn btn-danger me-2 btn-cancel" onClick={props.success}>Cancel</button>
      <button className="btn btn-primary btn-primary-dark">Change Password</button>
    </div>
    {passwordErrorMsg ? <p className="text-danger">{passwordErrorMsg}</p> : <div></div>}
  </form>
}

export default PasswordEdit;