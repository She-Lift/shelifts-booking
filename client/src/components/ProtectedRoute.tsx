import { Navigate, Outlet } from "react-router";
import { useGlobalContext, type User } from "../context/GlobalContext";

type Props = {
  allowedRole: User["role"];
};

export default function ProtectedRoute({ allowedRole }: Props) {
  const { user } = useGlobalContext();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate
      to={user.role === "admin" ? "/admin" : "/customer"}
      replace
    />;
  }

  return <Outlet />;
}