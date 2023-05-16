import { useNavigate } from "react-router-dom";
import APIContext from "../../../../contexts/APIContext";
import { useContext, useState } from "react";
import { sendRequest } from "../../../../NetworkUtils";

function PhoneNumberEdit(props) {
  const { setIsLoggedIn, user, setUser, authToken, setAuthToken, refreshToken, setRefreshToken } = useContext(APIContext);
  const navigate = useNavigate();
  const [phoneErrorMsg, setPhoneErrorMsg] = useState("");
  const [errorMsgs, setErrorMsgs] = useState({});

  async function editPhoneNumberHandler(event) {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append("phone_number", event.target.phoneNumber.value);

    const url = "http://localhost:8000/users/edit-phone-number/";

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
        setPhoneErrorMsg("Failed to change phone number. Please check errors and try again.");
        setErrorMsgs(errorJson.response);
      }
    }
  }
  return <form className="w-100" onSubmit={(e) => editPhoneNumberHandler(e)}>
    <div className="mb-3">
      <label htmlFor="inputPhoneNumber1" className="form-label">Phone Number</label> <br />
      <small>{"Enter in the following format. +<country_code><phone_number>. E.g. “+16471234567”"}</small>
      <input type="text" className="form-control" id="inputPhoneNumber1" name="phoneNumber" style={{ backgroundColor: (errorMsgs['phone_number'] ? "red" : "white") }} />
      {errorMsgs['phone_number'] ? <p className="text-danger">{errorMsgs['phone_number']}</p> : <div></div>}
    </div>
    <div className="mb-3 d-flex justify-content-end">
      <button type="button" className="btn btn-danger me-2 btn-cancel" onClick={props.success}>Cancel</button>
      <button className="btn btn-primary btn-primary-dark">Change Phone Number</button>
    </div>
    {phoneErrorMsg ? <p className="text-danger">{phoneErrorMsg}</p> : <div></div>}
  </form>
}

export default PhoneNumberEdit;