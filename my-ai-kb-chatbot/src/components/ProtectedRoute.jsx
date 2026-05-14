import { Navigate } from "react-router-dom";

function ProtectedRoute({
  children,
  allowedRole,
}) {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // not logged in
  if (!user) {
    return <Navigate to="/" />;
  }

  // wrong role
  if (user.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;