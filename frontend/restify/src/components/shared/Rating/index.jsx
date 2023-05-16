import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { faStarHalfAlt, faStar as faStarO } from "@fortawesome/free-regular-svg-icons"
import { useEffect, useState } from "react";

function Rating(props) {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    let rating = props.rating;
    let maxStars = 5;
    let tempStars = [];

    while (rating >= 0.75) {
      tempStars.push(<FontAwesomeIcon key={5 - maxStars} icon={faStar} />);
      rating--;
      maxStars--;
    }

    if (rating >= 0.25) {
      tempStars.push(<FontAwesomeIcon key={5 - maxStars} icon={faStarHalfAlt} />);
      rating--;
      maxStars--;
    }

    while (maxStars > 0) {
      tempStars.push(<FontAwesomeIcon key={5 - maxStars} icon={faStarO} />);
      maxStars--;
    }

    setStars(tempStars)

  }, [setStars, props.rating]);

  return <p className="mb-1 h5" title="Rating">{props.numberRating ? props.rating : ""}
    {stars}
    {props.children}
  </p>
}

export default Rating;