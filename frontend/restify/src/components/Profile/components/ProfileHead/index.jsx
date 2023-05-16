import moment from 'moment'

function ProfileHead(props) {
  const { first_name, last_name, date_joined, avatar } = props.userInfo;
  return <div className="rounded-top text-white d-flex flex-row bg-black"
    style={{ height: "180px" }}>
    <div className="ms-4 mt-4 d-flex flex-column" style={{ width: "150px" }}>
      <img src={avatar} alt="User avatar" className="img-fluid img-thumbnail profile-image mt-4 mb-2"
        style={{ minHeight: "150px", maxHeight: "150px", width: "150px", zIndex: "1" }} />
      {props.children}
    </div>
    <div id="userInfo" className="ms-3 mt-5">
      <h5>{first_name + " " + last_name}<i className="fa fa-check-circle" title="Verified Account"></i></h5>
      <p>Member since {moment(date_joined).format("MMMM YYYY")}</p>
    </div>
  </div>
}

export default ProfileHead;