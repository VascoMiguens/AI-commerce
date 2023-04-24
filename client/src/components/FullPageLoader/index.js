import "./fullpageloader.css";
import Brush from "../../assets/brush.png";

const FullPageLoader = () => {
  return (
    <div className="full-page-loader">
      <div className="animation-container">
        <div className="animation-title">Finding Inspiration</div>
        <img src={Brush} alt="brush" className="brush" />
        <div className="line"></div>
      </div>
    </div>
  );
};

export default FullPageLoader;
