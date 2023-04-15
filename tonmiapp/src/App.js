import emote2 from "./kuvat/emote2.png";
import "./App.css";

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={emote2} className="App-logo" alt="logo" />
        <b className="otsikko" style={{ marginTop: 100 }}>
          {"Mee töihi"}
        </b>
        <div style={{ paddingTop: "2rem" }}>
          <a
            href="https://www.instagram.com/taikuritommi/"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a
            href="https://www.linkedin.com/in/tommihaapa/"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a
            href="https://github.com/tommieemeli"
            target="_blank"
            rel="noreferrer"
          >
            <i className="fab fa-github"></i>
          </a>
        </div>
      </header>
    </div>
  );
};

export default App;
