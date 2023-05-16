import { useNavigate } from "react-router-dom";
import APIContext from "../../../../contexts/APIContext";
import { useContext, useState } from "react";
import { sendRequest } from "../../../../NetworkUtils";

function EmailEdit(props) {
  const { setIsLoggedIn, user, setUser, authToken, setAuthToken, refreshToken, setRefreshToken } = useContext(APIContext);
  const navigate = useNavigate();
  const [emailErrorMsg, setEmailErrorMsg] = useState("");
  const [errorMsgs, setErrorMsgs] = useState({});

  async function editEmailHandler(event) {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append("email", event.target.email.value);

    const url = "http://localhost:8000/users/edit-email/";

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
        setEmailErrorMsg("Failed to change email. Please check errors and try again.");
        setErrorMsgs(errorJson.response);
      }
    }
  }

  return <form className="w-100" onSubmit={(e) => editEmailHandler(e)} >
    <div className="mb-3">
      <label htmlFor="inputEmail1" className="form-label">Email address</label>
      <input type="email" className="form-control" id="inputEmail1" name="email" aria-describedby="emailHelp" style={{ backgroundColor: (errorMsgs['email'] ? "red" : "white") }} />
      {errorMsgs['email'] ? <p className="text-danger">{errorMsgs['email']}</p> : <div></div>}
    </div>
    <div className="mb-3 d-flex justify-content-end">
      <button type="button" className="btn btn-danger me-2 btn-cancel" onClick={props.success}>Cancel</button>
      <button className="btn btn-primary btn-primary-dark">Change Email</button>
    </div>
    {emailErrorMsg ? <p className="text-danger">{emailErrorMsg}</p> : <div></div>}
  </form>
}

export default EmailEdit;