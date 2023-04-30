import "./fullpageloader.css";
import Brush from "../../assets/brush.png";

const FullPageLoader = ({ loaded }) => {
  const containerClasses = `animation-container${loaded ? " loaded" : ""}`;
  return (
    <div className={`full-page-loader${loaded ? " loaded" : ""}`}>
      <div className={containerClasses}>
        <div className="animation-title">Finding Inspiration</div>
        <img src={Brush} alt="brush" className="brush" />
        <div className="line"></div>
      </div>
    </div>
  );
};

export default FullPageLoader;
