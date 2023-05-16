
import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import APIContext from '../../../../contexts/APIContext';
import { sendRequest } from '../../../../NetworkUtils';

function AddListing(props) {
  const { authToken, setIsLoggedIn, } = useContext(APIContext);
  const [addPropertyErrorMsg, setAddPropertyErrorMsg] = useState("");
  const [errorMsgs, setErrorMsgs] = useState({});
  const navigate = useNavigate();

  async function addPropertyHandler(event) {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append("name", event.target.name.value);
    formdata.append("guests", event.target.guests.value);
    formdata.append("beds", event.target.beds.value);
    formdata.append("bathrooms", event.target.bathrooms.value);
    formdata.append("description", event.target.description.value);

    let amenities = event.target.amenities.value.split(",");
    amenities.forEach((amenity, index, amenities) => {
      amenities[index] = amenity.trim();
    });

    formdata.append("amenities", JSON.stringify(amenities));

    const url = 'http://localhost:8000/properties/create/';

    try {
      let responseJson = await sendRequest(url, "POST", formdata);
      props.viewListings();
    } catch (error) {
      let errorJson = JSON.parse(error.message);
      if (errorJson.status === 400) {
        setAddPropertyErrorMsg("Failed to add listing. Please check errors and try again.");
        setErrorMsgs(errorJson.response);
      } else {
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
        navigate('/login');
      }
    }
  }

  return <>
    <h2 className="mt-2 mb-3">Add Property</h2>
    <form className="w-100" onSubmit={(e) => addPropertyHandler(e)}>
      <div className="mb-3">
        <label htmlFor="inputName1" className="form-label">Name</label>
        <input type="text" className="form-control" id="inputName1" name="name" style={{ backgroundColor: (errorMsgs['name'] ? "red" : "white") }} />
        {errorMsgs['name'] ? <p className="text-danger">{errorMsgs['name']}</p> : <div></div>}
      </div>
      <div className="mb-3">
        <label htmlFor="inputGuests1" className="form-label">Guests</label>
        <input type="number" className="form-control" id="inputGuests1" name="guests" min="1" style={{ backgroundColor: (errorMsgs['guests'] ? "red" : "white") }} />
        {errorMsgs['guests'] ? <p className="text-danger">{errorMsgs['guests']}</p> : <div></div>}
      </div>
      <div className="mb-3">
        <label htmlFor="inputBeds1" className="form-label">Beds</label>
        <input type="number" className="form-control" id="inputBeds1" name="beds" min="1"
          aria-describedby="bedHelp" style={{ backgroundColor: (errorMsgs['beds'] ? "red" : "white") }} />
        {errorMsgs['beds'] ? <p className="text-danger">{errorMsgs['beds']}</p> : <div></div>}
      </div>
      <div className="mb-3">
        <label htmlFor="inputBathrooms1" className="form-label">Bathrooms</label>
        <input type="number" className="form-control" id="inputBathrooms1" name="bathrooms" min="1" style={{ backgroundColor: (errorMsgs['bathrooms'] ? "red" : "white") }} />
        {errorMsgs['bathrooms'] ? <p className="text-danger">{errorMsgs['bathrooms']}</p> : <div></div>}
      </div>
      <div className="mb-3">
        <label htmlFor="inputDescription1" className="form-label">Description</label>
        <textarea className="form-control" name="description" id="inputDescription1" rows="3" style={{ backgroundColor: (errorMsgs['description'] ? "red" : "white") }}></textarea>
        {errorMsgs['description'] ? <p className="text-danger">{errorMsgs['description']}</p> : <div></div>}
      </div>
      <div className="mb-3">
        <label htmlFor="inputAmenities1" className="form-label">Amenities</label>
        <br />
        <small>{"E.g. \"bbq, patio, moonroof\""}</small>
        <input type="text" className="form-control" id="inputAmenities1" name="amenities" placeholder='bbq, patio, moonroof' style={{ backgroundColor: (errorMsgs['amenities'] ? "red" : "white") }} />
        {errorMsgs['amenities'] ? <p className="text-danger">{errorMsgs['amenities']}</p> : <div></div>}
      </div>
      <div className="mb-3 d-flex justify-content-between">
        {addPropertyErrorMsg ? <p className="text-danger">{addPropertyErrorMsg}</p> : <div></div>}
        <div className="d-flex justify-content-end">
          <button type="button" className="btn btn-danger me-2" onClick={props.viewListings}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-primary-dark">Add Property</button>
        </div>
      </div>
    </form>
  </>
}

export default AddListing;