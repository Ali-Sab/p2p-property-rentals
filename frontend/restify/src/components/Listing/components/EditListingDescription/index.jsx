import { useContext, useState } from "react";
import APIContext from "../../../../contexts/APIContext";
import { useNavigate } from "react-router-dom";
import { sendRequest } from "../../../../NetworkUtils";

function EditListingDescription(props) {
  const { setIsLoggedIn } = useContext(APIContext);
  const [errorMsgs, setErrorMsgs] = useState([]);
  const navigate = useNavigate();
  const { property, success, canceled } = props;

  async function updateDescriptionHandler(event) {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append("image", event.target.description.value,);

    let amenities = event.target.amenities.value.split(",");
    amenities.forEach((amenity, index, amenities) => {
      amenities[index] = amenity.trim();
    });

    formdata.append("amenities", JSON.stringify(amenities));

    const url = "http://localhost:8000/properties/" + property.id + "/update/description/";

    try {
      let responseJson = await sendRequest(url, "PUT", formdata);
      success();
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

  return <form className="w-100" onSubmit={(e) => updateDescriptionHandler(e)}>
    <div className="mb-3">
      <label htmlFor="inputDescription1" className="form-label">Description</label>
      <textarea className="form-control" name="description" id="inputDescription1" rows="3" defaultValue={property.description} style={{ backgroundColor: (errorMsgs['description'] ? "red" : "white") }}></textarea>
      {errorMsgs['description'] ? <p className="text-danger">{errorMsgs['description']}</p> : <div></div>}
    </div>
    <div className="mb-3">
      <label htmlFor="inputAmenities1" className="form-label">Amenities</label>
      <br />
      <small>{"E.g. \"bbq, patio, moonroof\""}</small>
      <input type="text" className="form-control" id="inputAmenities1" name="amenities" defaultValue={property.amenities} style={{ backgroundColor: (errorMsgs['amenities'] ? "red" : "white") }} />
      {errorMsgs['amenities'] ? <p className="text-danger">{errorMsgs['amenities']}</p> : <div></div>}
    </div>
    <div className="mb-3 d-flex justify-content-end">
      <button type="button" className="btn btn-danger me-2 btn-cancel" onClick={canceled}>Cancel</button>
      <button className="btn btn-primary btn-primary-dark">Update Description</button>
    </div>
  </form>
}

export default EditListingDescription;