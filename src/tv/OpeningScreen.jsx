import "./styles/OpeningScreen.css";
import blueBlobOpener from "../assets/tv/blueBlobOpener.png";
import centerPinkPiece from "../assets/tv/centerPinkPiece.png";
import dice from "../assets/tv/dice.png";

const OpeningScreen = ({ onNavigate }) => {
  return (
    <div className="OpeningScreen">
      <img
        src={centerPinkPiece}
        className="center-pink-piece"
        alt="center-pink-piece"
      />

      <img
        src={blueBlobOpener}
        className="blue-blob-opener"
        alt="Game rules"
      />

      {/* wrap these two in a div together? */}
      <img
        src={dice}
        className="dice"
        alt="Dice"
      />
      
      <button onClick={onNavigate} className="start-button atomic-age-regular">
        Start ▶
      </button>
    </div>
  );
};

export default OpeningScreen;