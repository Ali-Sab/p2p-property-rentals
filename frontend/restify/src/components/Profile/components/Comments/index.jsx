import { useContext, useEffect, useState } from "react";
import Comment from "../Comment";
import APIContext from "../../../../contexts/APIContext";
import { sendRequest } from "../../../../NetworkUtils";
import { useNavigate } from "react-router-dom";

function Comments(props) {
  const { user, firstName, setIsLoggedIn } = useContext(APIContext);
  const [errorMsgs, setErrorMsgs] = useState([]);
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    setComments(props.comments);
  }, []);

  async function replyHandler(event) {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append("object_id", props.reviewId);
    formdata.append("comment_text", event.target.comment_text.value);

    const url = 'http://localhost:8000/properties/reviews/comment/';

    try {
      let responseJson = await sendRequest(url, "POST", formdata);
      setComments(comments.concat([{ comment_date: new Date(), comment_text: formdata.get('comment_text'), commenter_name: firstName, commenter: user }]))
      setErrorMsgs("");
    } catch (error) {
      let errorJson = JSON.parse(error.message);
      if (errorJson.status === 400) {
        setErrorMsgs(errorJson.response);
      } else if (errorJson.status === 404) {
        alert("Error encountered. Please try again later.")
        window.location.reload(false);
      } else if (errorJson.status === 403) {
        setErrorMsgs(errorJson.response);
      } else if (errorJson.status === 401) {
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
        navigate('/login');
      }
    }
  }

  return <>
    {
      comments.length > 0
        ? <div className="card border-dark mt-2">
          <div className="list-group">
            {
              comments.map((item, index) => {
                return <Comment key={index} index={index} comment={item} />
              })
            }
            {
              comments[comments.length - 1].commenter === user
                ? <div></div>
                : <>
                  {
                    (user === props.property.owner || user === props.reviewer)
                      ? <div className={"list-group-item list-group-item-" + (comments.length % 2 ? "dark" : "secondary")}>
                        <div className="mt-1">
                          <form onSubmit={(e) => replyHandler(e)}>
                            <div className="d-flex flex-row justify-content-start align-items-center">
                              <textarea type="text" placeholder="Type your reply" className="form-control w-75" id="inputReply" name="comment_text" rows="1" style={{ backgroundColor: (errorMsgs['comment_text'] ? "red" : "white") }}></textarea>
                              <button type="submit" className="ms-2 h-50 btn btn-success">Reply</button>
                            </div>
                            {errorMsgs['comment_text'] ? <p className="text-danger">{errorMsgs['comment_text']}</p> : <div></div>}
                            {errorMsgs['error'] ? <p className="text-danger">{errorMsgs['error']}</p> : <div></div>}
                          </form>
                        </div>
                      </div>
                      : <div></div>
                  }
                </>
            }
          </div>
        </div>
        : <>
          {
            user === props.property.owner
              ? <div className="mt-1">
                <form onSubmit={(e) => replyHandler(e)}>
                  <div className="d-flex flex-row justify-content-start align-items-center">
                    <textarea type="text" placeholder="Type your reply" className="form-control w-75" id="inputReply" name="comment_text" rows="1" style={{ backgroundColor: (errorMsgs['comment_text'] ? "red" : "white") }}></textarea>
                    <button type="submit" className="ms-2 h-50 btn btn-success">Reply</button>
                  </div>
                  {errorMsgs['comment_text'] ? <p className="text-danger">{errorMsgs['comment_text']}</p> : <div></div>}
                  {errorMsgs['error'] ? <p className="text-danger">{errorMsgs['error']}</p> : <div></div>}
                </form>
              </div>
              : <div></div>
          }
        </>
    }
  </>
}

export default Comments;