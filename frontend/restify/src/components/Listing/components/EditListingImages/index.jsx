import { useContext, useState } from "react";
import { sendRequest } from "../../../../NetworkUtils";
import APIContext from "../../../../contexts/APIContext";
import { useNavigate } from "react-router-dom";

function EditListingImages(props) {
  const { setIsLoggedIn } = useContext(APIContext);
  const [errorMsgs, setErrorMsgs] = useState([]);
  const navigate = useNavigate();

  async function addImageHandler(event) {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append("image", event.target.propertyImageFile.files[0]);
    formdata.append("property", props.property.id);

    const url = "http://localhost:8000/properties/add/images/";

    try {
      let responseJson = await sendRequest(url, "POST", formdata);
      props.success();
    } catch (error) {
      let errorJson = JSON.parse(error.message);
      if (errorJson.status === 401) {
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
        navigate('/login')
      } else if (errorJson.status === 404) {
        navigate('/')
      } else if (errorJson.status === 403) {
        navigate('/')
        alert("You do not have permission to modify this resource.")
      } else {
        setErrorMsgs(errorJson.response);
      }
    }
  }

  return <form className="w-100" encType="multipart/form-data" onSubmit={(e) => addImageHandler(e)}>
    <div className="mb-3">
      <label htmlFor="inputImage1" className="form-label">Upload Image</label>
      <input type="file" className="form-control" id="inputImage1" name="propertyImageFile" style={{ backgroundColor: (errorMsgs['image'] ? "red" : "white") }} />
      {errorMsgs['image'] ? <p className="text-danger">{errorMsgs['image']}</p> : <div></div>}
    </div>
    <div className="mb-3 d-flex justify-content-end">
      <button type="button" className="btn btn-danger me-2 btn-cancel" onClick={props.canceled}>Cancel</button>
      <button className="btn btn-primary btn-primary-dark">Upload Image</button>
    </div>
    {errorMsgs['property'] ? <p className="text-danger">Property does not exist.</p> : <div></div>}
  </form>
}

export default EditListingImages;