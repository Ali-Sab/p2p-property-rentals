import { useState } from 'react';
import ProfileEdit from './components/ProfileEdit';
import ProfileView from './components/ProfileView';
import './style.css';

function Profile(props) {
  const [editingProfile, setEditingProfile] = useState(false);

  function editProfileHandler() {
    setEditingProfile(true);
  }

  function editProfileCancel() {
    setEditingProfile(false);
  }

  return <div>
    {
    editingProfile
      ? <ProfileEdit viewProfile={editProfileCancel}/>
      : <ProfileView editProfile={editProfileHandler}/>
    }
  </div>
  
  
}

export default Profile