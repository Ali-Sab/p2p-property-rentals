import { useNavigate } from "react-router-dom";
import APIContext from "../../../../contexts/APIContext";
import { useContext, useState } from "react";
import { sendRequest } from "../../../../NetworkUtils";

function AvatarEdit(props) {
  const { setIsLoggedIn, user, setUser, authToken, setAuthToken, refreshToken, setRefreshToken } = useContext(APIContext);
  const navigate = useNavigate();
  const [avatarErrorMsg, setAvatarErrorMsg] = useState("");
  const [errorMsgs, setErrorMsgs] = useState({});

  async function editAvatarHandler(event) {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append("avatar", event.target.avatarImageFile.files[0]);

    const url = "http://localhost:8000/users/edit-avatar/";

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
        setAvatarErrorMsg("Failed to change avatar. Please check errors and try again.");
        setErrorMsgs(errorJson.response);
      }
    }
  }

  return <form className="w-100" onSubmit={(e) => editAvatarHandler(e)}>
    <div className="mb-3">
      <label htmlFor="inputAvatar1" className="form-label">Avatar</label>
      <input type="file" className="form-control" id="inputAvatar1" name="avatarImageFile" style={{ backgroundColor: (errorMsgs['avatar'] ? "red" : "white") }} />
      {errorMsgs['avatar'] ? <p className="text-danger">{errorMsgs['avatar']}</p> : <div></div>}
    </div>
    <div className="mb-3 d-flex justify-content-end">
      <button type="button" className="btn btn-danger me-2 btn-cancel" onClick={props.success}>Cancel</button>
      <button className="btn btn-primary btn-primary-dark">Change Avatar</button>
    </div>
    {avatarErrorMsg ? <p className="text-danger">{avatarErrorMsg}</p> : <div></div>}
  </form>
}

export default AvatarEdit;