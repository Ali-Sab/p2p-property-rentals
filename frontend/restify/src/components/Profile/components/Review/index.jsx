import Rating from "../../../shared/Rating";
import moment from 'moment'
import Comments from "../Comments";

function Review(props) {
  return <div className="list-group-item">
    <div className="d-flex w-100 justify-content-between">
      <h5 className="mb-1">
        <Rating rating={props.review.rating} numberRating={false} />
      </h5>
      <small>{moment(props.review.review_date).format("MMMM YYYY")}</small>
    </div>
    <p className="mb-1">{props.review.review_text}</p>
    <small>{props.review.reviewer_name}</small>
    {
      props.forProfile
        ? <div></div>
        : <Comments user={props.user} property={props.property} reviewer={props.review.reviewer} comments={props.review.comments} reviewId={props.review.id} />
    }
  </div>
}

export default Review;