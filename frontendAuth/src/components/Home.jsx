import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const history = useNavigate();
  useEffect(() => {
    history("/login");
  }, []);
  return <div></div>;
}

export default Home;
