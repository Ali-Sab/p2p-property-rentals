import moment from 'moment'

function Comment(props) {
  return <div className={"list-group-item list-group-item-" + (props.index % 2 ? "dark" : "secondary")}>
    <div className="mb-1 d-flex justify-content-between">
      <p className="m-1">{props.comment.comment_text}</p>
      <small className="m-1">{moment(props.comment.comment_date).format("MMMM YYYY")}</small>
    </div>
    <small className="m-1 text-dark">Response from <span
      className="heavy">{props.comment.commenter_name.split(" ")[0]}</span></small>
  </div>
}

export default Comment;