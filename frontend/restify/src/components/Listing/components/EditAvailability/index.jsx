import { useNavigate } from "react-router-dom";
import { sendRequest } from "../../../../NetworkUtils";
import { useContext, useState } from "react";
import APIContext from "../../../../contexts/APIContext";

function EditAvailability(props) {
  const { setIsLoggedIn } = useContext(APIContext);
  const [errorMsgs, setErrorMsgs] = useState([]);
  const navigate = useNavigate();
  const { propertyId, success, canceled } = props;

  async function updateAvailabilityHandler(event) {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append("date_start", event.target.date_start.value);
    formdata.append("date_end", event.target.date_end.value);
    formdata.append("available", event.target.available.value);
    formdata.append("price", event.target.price.value);

    const url = "http://localhost:8000/properties/" + propertyId + "/update/price/";

    try {
      let responseJson = await sendRequest(url, "POST", formdata);
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
        console.log(errorJson);
        setErrorMsgs(errorJson.response);
      }
    }
  }
  return <form onSubmit={(e) => updateAvailabilityHandler(e)}>
    <div className="mb-3">
      <label htmlFor="inputStartDate1" className="form-label">Start Date</label>
      <input type="date" className="form-control" id="inputStartDate1" name="date_start"
        aria-describedby="startDateHelp" style={{ backgroundColor: (errorMsgs['date_start'] ? "red" : "white") }} />
      {errorMsgs['date_start'] ? <p className="text-danger">{errorMsgs['date_start']}</p> : <div></div>}
    </div>
    <div className="mb-3">
      <label htmlFor="inputEndDate1" className="form-label">End Date</label>
      <input type="date" className="form-control" id="inputEndDate1" name="date_end"
        aria-describedby="endDateHelp" style={{ backgroundColor: (errorMsgs['date_end'] ? "red" : "white") }} />
      {errorMsgs['date_end'] ? <p className="text-danger">{errorMsgs['date_end']}</p> : <div></div>}
    </div>
    <div className="mb-3 form-check" id="availability-div">
      <input type="checkbox" className="form-check-input" id="checkAvailability1" name="available" />
      <label className="form-check-label" htmlFor="check1">Property is unavailable</label>
      {errorMsgs['available'] ? <p className="text-danger">{errorMsgs['available']}</p> : <div></div>}
    </div>
    <div className="mb-3" id="price-div">
      <label htmlFor="inputPrice1" className="form-label">Price</label>
      <input type="number" className="form-control" id="inputPrice1" name="price" aria-describedby="priceHelp"
        min="0" step="any" style={{ backgroundColor: (errorMsgs['price'] ? "red" : "white") }} />
      {errorMsgs['price'] ? <p className="text-danger">{errorMsgs['price']}</p> : <div></div>}
    </div>
    <div className="mb-3 d-flex justify-content-end">
      <button type="button" className="btn btn-danger me-2 btn-cancel" onClick={canceled}>Cancel</button>
      <button className="btn btn-primary btn-primary-dark">Update Price/Availability</button>
    </div>
  </form>
}

export default EditAvailability;