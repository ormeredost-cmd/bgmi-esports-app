import { useLoading } from "../context/LoadingContext";
import bgmiLoading from "../assets/loading/bgmi-loading.png";
import "./GlobalLoader.css";

const GlobalLoader = () => {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className="global-loader">
      <div className="global-loader-box">
        <img
          src={bgmiLoading}
          alt="Loading"
          className="global-loader-img"
        />

        <div className="global-loader-text">
          LOADING...
        </div>
      </div>
    </div>
  );
};

export default GlobalLoader;