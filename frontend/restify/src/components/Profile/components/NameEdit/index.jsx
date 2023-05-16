import { useNavigate } from "react-router-dom";
import APIContext from "../../../../contexts/APIContext";
import { useContext, useState } from "react";
import { sendRequest } from "../../../../NetworkUtils";

function NameEdit(props) {
  const { setIsLoggedIn, user, setUser, authToken, setAuthToken, refreshToken, setRefreshToken } = useContext(APIContext);
  const navigate = useNavigate();
  const [nameErrorMsg, setNameErrorMsg] = useState("");
  const [errorMsgs, setErrorMsgs] = useState({});

  async function editNameHandler(event) {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append("first_name", event.target.firstName.value);
    formdata.append("last_name", event.target.lastName.value);

    const url = "http://localhost:8000/users/edit-name/";

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
        setNameErrorMsg("Failed to change name. Please check errors and try again.");
        setErrorMsgs(errorJson.response);
      }
    }
  }

  return <form className="w-100" onSubmit={(e) => editNameHandler(e)}>
    <div className="mb-3">
      <label htmlFor="inputFirstName1" className="form-label">First Name</label>
      <input type="text" className="form-control" id="inputFirstName1" name="firstName" style={{ backgroundColor: (errorMsgs['first_name'] ? "red" : "white") }} />
      {errorMsgs['first_name'] ? <p className="text-danger">{errorMsgs['first_name']}</p> : <div></div>}
    </div>
    <div className="mb-3">
      <label htmlFor="inputLastName1" className="form-label">Last Name</label>
      <input type="text" className="form-control" id="inputLastName1" name="lastName" style={{ backgroundColor: (errorMsgs['last_name'] ? "red" : "white") }} />
      {errorMsgs['last_name'] ? <p className="text-danger">{errorMsgs['last_name']}</p> : <div></div>}
    </div>
    <div className="mb-3 d-flex justify-content-end">
      <button type="button" className="btn btn-danger me-2 btn-cancel" onClick={props.success}>Cancel</button>
      <button className="btn btn-primary btn-primary-dark">Change Name</button>
    </div>
    {nameErrorMsg ? <p className="text-danger">{nameErrorMsg}</p> : <div></div>}
  </form>
}

export default NameEdit;