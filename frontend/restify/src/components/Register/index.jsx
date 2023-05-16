import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { register } from '../../NetworkUtils';

function Register(props) {
  const [registerErrorMsg, setRegisterErrorMsg] = useState("");
  const [errorMsgs, setErrorMsgs] = useState({});
  const navigate = useNavigate();

  async function registerHandler(event) {
    event.preventDefault();

    let formdata = new FormData();
    formdata.append("first_name", event.target.firstName.value);
    formdata.append("last_name", event.target.lastName.value);
    formdata.append("email", event.target.email.value);
    formdata.append("phone_number", event.target.phoneNumber.value);
    formdata.append("avatar", event.target.avatarImageFile.files[0]);
    formdata.append("password", event.target.password.value);
    formdata.append("confirm_password", event.target.confirmPassword.value);

    try {
      let responseJson = await register(formdata);
      setRegisterErrorMsg("");
      setErrorMsgs({});
      navigate('/login');
    } catch (error) {
      let errorJson = JSON.parse(error.message);
      setRegisterErrorMsg("Registration failed. Please check errors and try again.");
      setErrorMsgs(errorJson.response);
    }
  }

  return <form className="login-form" onSubmit={(e) => registerHandler(e)}>
    <div className="mb-3">
      <label htmlFor="inputFirstName1" className="form-label">First Name</label>
      <input type="text" className="form-control" id="inputFirstName1" name="firstName" style={{ backgroundColor: (errorMsgs['first_name'] ? "red" : "white")}}/>
      {errorMsgs['first_name'] ? <p className="text-danger">{errorMsgs['first_name']}</p> : <div></div>}
    </div>
    <div className="mb-3">
      <label htmlFor="inputLastName1" className="form-label">Last Name</label>
      <input type="text" className="form-control" id="inputLastName1" name="lastName" style={{ backgroundColor: (errorMsgs['last_name'] ? "red" : "white")}}/>
      {errorMsgs['last_name'] ? <p className="text-danger">{errorMsgs['last_name']}</p> : <div></div>}
    </div>
    <div className="mb-3">
      <label htmlFor="inputEmail1" className="form-label">Email address</label>
      <input type="email" className="form-control" id="inputEmail1" name="email" aria-describedby="emailHelp" style={{ backgroundColor: (errorMsgs['email'] ? "red" : "white")}}/>
      {errorMsgs['email'] ? <p className="text-danger">{errorMsgs['email']}</p> : <div></div>}
    </div>
    <div className="mb-3">
      <label htmlFor="inputPhoneNumber1" className="form-label">Phone Number</label> <br/>
      <small>{"Enter in the following format. +<country_code><phone_number>. E.g. “+16471234567”"}</small>
      <input type="text" className="form-control" id="inputPhoneNumber1" name="phoneNumber" style={{ backgroundColor: (errorMsgs['phone_number'] ? "red" : "white")}}/>
      {errorMsgs['phone_number'] ? <p className="text-danger">{errorMsgs['phone_number']}</p> : <div></div>}
    </div>
    <div className="mb-3">
      <label htmlFor="inputAvatar1" className="form-label">Avatar</label>
      <input type="file" className="form-control" id="inputAvatar1" name="avatarImageFile" style={{ backgroundColor: (errorMsgs['avatar'] ? "red" : "white")}}/>
      {errorMsgs['avatar'] ? <p className="text-danger">{errorMsgs['avatar']}</p> : <div></div>}
    </div>
    <div className="mb-3">
      <label htmlFor="inputPassword1" className="form-label">Password</label>
      <input type="password" className="form-control" id="inputPassword1" name="password" style={{ backgroundColor: (errorMsgs['password'] ? "red" : "white")}}/>
      {errorMsgs['password'] ? <p className="text-danger">{errorMsgs['password']}</p> : <div></div>}
    </div>
    <div className="mb-3">
      <label htmlFor="inputPassword2" className="form-label">Confirm Password</label>
      <input type="password" className="form-control" id="inputPassword2" name="confirmPassword" style={{ backgroundColor: (errorMsgs['confirm_password'] ? "red" : "white")}}/>
      {errorMsgs['confirm_password'] ? <p className="text-danger">{errorMsgs['confirm_password']}</p> : <div></div>}
    </div>
    <div className="mb-3 pull-left">
      <button type="submit" className="btn btn-primary me-2">Register</button>
      <Link className="mx-lg-4" to="/login">Already have an account? Login here</Link>
    </div>
    {registerErrorMsg ? <p className="text-danger">{registerErrorMsg}</p> : <div></div>}
  </form>
}

export default Register;