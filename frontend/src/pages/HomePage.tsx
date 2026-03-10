import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { UserContextType } from "../types";

export const HomePage = () => {
  const { authenticatedUser } = useContext<UserContextType>(UserContext);
  return <>Home
    {
      authenticatedUser && <Link to={`/users/${authenticatedUser.id}`}>Profile</Link>
    }
  </>;
};
