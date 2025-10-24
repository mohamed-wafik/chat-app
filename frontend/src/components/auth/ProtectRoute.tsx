import type { ReactNode } from "react";
import type { IUser } from "../../interface";
import { Navigate } from "react-router-dom";

interface IProps {
  user: IUser | null;
  children: ReactNode;
}
const ProtectRoute = ({ user, children }: IProps) => {
  if (!user) return <Navigate to={"/login"} />;

  return children;
};

export default ProtectRoute;
