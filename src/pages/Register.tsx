import { useSearchParams, Navigate } from "react-router-dom";

const Register = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");

  // Redirect to login page, preserving ref code
  return <Navigate to={ref ? `/login?ref=${ref}` : "/login"} replace />;
};

export default Register;
