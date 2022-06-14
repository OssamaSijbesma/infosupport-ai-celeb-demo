import { Link } from "react-router-dom";
import './App.css';

function App() {
  return (
    <div className="App">
      <nav
        style={{
          borderBottom: "solid 1px",
          paddingBottom: "1rem",
        }}
      >
        <Link to="/aigency">Aigency</Link> |{" "}
        <Link to="/infosupport">InfoSupport</Link>
      </nav>
    </div>
  );
}

export default App;
