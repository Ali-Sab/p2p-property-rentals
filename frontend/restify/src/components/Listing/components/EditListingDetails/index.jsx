import { useNavigate } from "react-router-dom";
import { sendRequest } from "../../../../NetworkUtils";
import { useContext, useState } from "react";
import APIContext from "../../../../contexts/APIContext";

function EditListingDetails(props) {
  const { setIsLoggedIn } = useContext(APIContext);
  const [errorMsgs, setErrorMsgs] = useState([]);
  const navigate = useNavigate();
  const { property, success, canceled } = props;

  async function updateDetailsHandler(event) {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append("name", event.target.location.value);
    formdata.append("guests", event.target.numGuests.value);
    formdata.append("beds", event.target.numBeds.value);
    formdata.append("bathrooms", event.target.numBaths.value);

    const url = "http://localhost:8000/properties/" + property.id + "/update/details/";

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

  return <form className="w-100" onSubmit={(e) => updateDetailsHandler(e)}>
    <div className="mb-3">
      <label htmlFor="inputLocation1" className="form-label">Location</label>
      <input type="text" className="form-control" id="inputLocation1" name="location" defaultValue={property.name} style={{ backgroundColor: (errorMsgs['name'] ? "red" : "white") }}/>
      {errorMsgs['name'] ? <p className="text-danger">{errorMsgs['name']}</p> : <div></div>}
    </div>
    <div className="mb-3">
      <label htmlFor="inputGuests1" className="form-label">Guests</label>
      <input type="number" className="form-control" id="inputGuests1" name="numGuests" min="1" defaultValue={property.guests} style={{ backgroundColor: (errorMsgs['guests'] ? "red" : "white") }} />
      {errorMsgs['guests'] ? <p className="text-danger">{errorMsgs['guests']}</p> : <div></div>}
    </div>
    <div className="mb-3">
      <label htmlFor="inputBeds1" className="form-label">Beds</label>
      <input type="number" className="form-control" id="inputBeds1" name="numBeds" min="1"
        aria-describedby="bedHelp" defaultValue={property.beds} style={{ backgroundColor: (errorMsgs['beds'] ? "red" : "white") }} />
        {errorMsgs['beds'] ? <p className="text-danger">{errorMsgs['beds']}</p> : <div></div>}
    </div>
    <div className="mb-3">
      <label htmlFor="inputBathrooms1" className="form-label">Bathrooms</label>
      <input type="number" className="form-control" id="inputBathrooms1" name="numBaths" min="1" defaultValue={property.bathrooms} style={{ backgroundColor: (errorMsgs['bathrooms'] ? "red" : "white") }} />
      {errorMsgs['bathrooms'] ? <p className="text-danger">{errorMsgs['bathrooms']}</p> : <div></div>}
    </div>
    <div className="mb-3 d-flex justify-content-end">
      <button type="button" className="btn btn-danger me-2 btn-cancel" onClick={canceled}>Cancel</button>
      <button className="btn btn-primary btn-primary-dark">Apply Changes</button>
      {errorMsgs['name'] ? <p className="text-danger">{errorMsgs['name']}</p> : <div></div>}
    </div>
  </form>
}

export default EditListingDetails;