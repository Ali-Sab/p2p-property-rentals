
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Search from './components/Search';
import MyListings from './components/MyListings';
import Listing from './components/Listing';
import Reservations from './components/Reservations';
import NotFound from './components/NotFound';
import ReviewUser from './components/ReviewUser';
import ReviewListing from './components/ReviewListing';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={ <Layout /> }>
        <Route index element={ <Search /> } />
        <Route path="/search" element={ <Search /> } />
        <Route path="/login" element={ <Login /> } />
        <Route path="/register" element={ <Register /> } />
        <Route path="/my-listings" element={ <MyListings /> } />
        <Route path="/my-profile" element={ <Profile /> } />
        <Route path="/user/:userId" element={ <Profile /> } />
        <Route path="/property/:listingId" element={ <Listing /> } />
        <Route path="/my-reservations" element={ <Reservations /> } />
        <Route path="/user/review" element={ <ReviewUser /> } />
        <Route path="/property/review" element={ <ReviewListing /> } />
      </Route>
      <Route path='*' element={<NotFound />}/>
    </Routes>
    </BrowserRouter>
  );
}

// flows:
// reviews are made from reservation page, click "leave review"
// create listing from my-listings, it's a flow, no need for path
// edit listing from property/:id page
// reply to review from property/:id page
// host can see user/:id info when the user has a reservation

// link below is for my-properties/:id
//https://stackoverflow.com/questions/46685670/how-can-i-pass-in-a-number-when-i-link-to-a-different-page-in-react-js

export default App;
