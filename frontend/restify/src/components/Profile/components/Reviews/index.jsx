import { useContext, useEffect, useRef, useState } from "react";
import APIContext from "../../../../contexts/APIContext";
import { useNavigate } from "react-router-dom";
import Review from "../Review";
import { sendRequest } from "../../../../NetworkUtils";

function Reviews(props) {
  const { setIsLoggedIn, user } = useContext(APIContext);
  const [reviews, setReviews] = useState([]);
  const [missingPermission, setMissingPermission] = useState(false);
  const navigate = useNavigate();
  const waitingForResponse = useRef(0);
  const { userId, property, forProfile } = props;
  const [page, setPage] = useState(1);
  const [isNext, setIsNext] = useState(false);

  useEffect(() => {
    const getReviews = async () => {
      waitingForResponse.current = 1;

      let url = "";
      if (userId !== undefined) {
        url = "http://localhost:8000/users/reviews/?" + new URLSearchParams({
          user: userId,
          page: page
        });
      } else if (property.id !== undefined) {
        url = "http://localhost:8000/properties/" + property.id + "/reviews/?" + new URLSearchParams({
          page: page
        });
      }

      if (url === "") {
        setReviews([]);
        return;
      }

      try {
        let responseJson = await sendRequest(url, "GET");
        setReviews(reviews.concat(responseJson.results));
        if (responseJson.next !== null) {
          setIsNext(true);
        } else {
          setIsNext(false);
        }
      } catch (error) {
        let errorJson = JSON.parse(error.message);
        if (errorJson.status === 401) {
          setIsLoggedIn(false);
          localStorage.setItem("isLoggedIn", "false");
          navigate('/login')
        } else if (errorJson.status === 403) {
          setMissingPermission(true);
          setReviews([]);
        } else {
          setReviews([]);
        }
      }
    };

    if (waitingForResponse.current === 0 && userId !== user) {
      getReviews().catch(error => console.log(error)).finally(() => waitingForResponse.current = 0);
    }
  }, [navigate, setReviews, property, setIsLoggedIn, user, userId, page]);

  function nextPage() {
    if (isNext) {
      setPage(page + 1);
    }
  }

  return <div className="container p-3 text-black">
    <div className="list-group">
      {
        reviews.length > 0
          ? reviews.map((item, index) => {
            return <Review key={index} user={userId} property={property} review={item} forProfile={forProfile} />
          })
          : missingPermission
            ? <h6>You can only view reviews for users that have current or prior reservations with you.</h6>
            : <div></div>
      }
    </div>
    {
      isNext
        ? <button className="mt-2 btn btn-primary" onClick={nextPage}>Load More</button>
        : <div></div>
    }
  </div>
}

export default Reviews;