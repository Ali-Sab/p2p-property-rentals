import NameEdit from "../NameEdit";
import EmailEdit from "../EmailEdit";
import PhoneNumberEdit from "../PhoneNumberEdit";
import AvatarEdit from "../AvatarEdit";
import PasswordEdit from "../PasswordEdit";


function ProfileEdit(props) {
  return <>
    <h2 className="mt-2 mb-3">Edit Profile</h2>
    <NameEdit success={props.viewProfile} />
    <hr className="solid" />
    <EmailEdit success={props.viewProfile} />
    <hr className="solid" />
    <PhoneNumberEdit success={props.viewProfile} />
    <hr className="solid" />
    <AvatarEdit success={props.viewProfile} />
    <hr className="solid" />
    <PasswordEdit success={props.viewProfile} />
  </>
}

export default ProfileEdit;