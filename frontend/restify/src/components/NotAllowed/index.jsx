function NotAllowed(props) {
  return <div className="errorPage">
    <h1>Missing Permissions.</h1>
    <p>You don't have permission to see this page or complete this action. Please ensure you are logged in.</p>
  </div>
}

export default NotAllowed;