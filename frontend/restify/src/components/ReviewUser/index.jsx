import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import APIContext from "../../contexts/APIContext";
import { sendRequest } from "../../NetworkUtils";

function ReviewUser(props) {
  const { setIsLoggedIn } = useContext(APIContext)
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsgs, setErrorMsgs] = useState([]);

  useEffect(() => {
    if (!location.state['user_name'] || !location.state['user_email']) {
      navigate('/');
    }
  }, [location]);

  async function createReviewHandler(event) {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append("rating", event.target.rating.value);
    formdata.append("review_text", event.target.reviewText.value);
    formdata.append("reviewee_username", location.state['user_email']);

    const url = 'http://localhost:8000/users/review/create/';

    try {
      let responseJson = await sendRequest(url, "POST", formdata);
      setErrorMsgs("");
      navigate('/my-reservations')
    } catch (error) {
      let errorJson = JSON.parse(error.message);
      if (errorJson.status === 400) {
        setErrorMsgs(errorJson.response);
      } else if (errorJson.status === 404) {
        navigate('/my-reservations')
      } else if (errorJson.status === 401) {
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
        navigate('/login');
      }
    }
  }

  return <div className="login-form d-flex flex-column">
    <h2 className="text-center pb-2">Leaving a review for: {location.state.user_name}</h2>
    <form onSubmit={(e) => createReviewHandler(e)}>
      <div className="mb-3">
        <label htmlFor="inputRating1" className="form-label">Rating</label>
        <input name="rating" type="number" className="form-control" id="inputRating1"
          min="1" max="5" step="0.5" aria-describedby="ratingHelp"  style={{ backgroundColor: (errorMsgs['rating'] ? "red" : "white") }}/>
          {errorMsgs['rating'] ? <p className="text-danger">{errorMsgs['rating']}</p> : <div></div>}
      </div>
      <div className="mb-3">
        <label htmlFor="inputReview1" className="form-label">Review</label>
        <textarea name="reviewText" id="inputReview1"
          placeholder="Share details of your experience with the user" className="form-control"
          rows="3" style={{ backgroundColor: (errorMsgs['review_text'] ? "red" : "white") }}></textarea>
          {errorMsgs['review_text'] ? <p className="text-danger">{errorMsgs['review_text']}</p> : <div></div>}
      </div>
      <div className="d-flex justify-content-between mb-3">
        {
          errorMsgs['error']
            ? <p className="text-danger">{errorMsgs['error']}</p>
            : <div></div>
        }
        <div className="d-flex justify-content-end">
          <Link to="/my-reservations" className="btn btn-danger me-2">Cancel</Link>
          <button type="submit" className="btn btn-primary">Submit</button>
        </div>
      </div>
    </form>
  </div>
}

export default ReviewUser;