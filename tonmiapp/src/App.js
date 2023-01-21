import emote2 from "./kuvat/emote2.png"
import './App.css';

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={emote2} className="App-logo" alt="logo" />
        <b style={{ marginTop: 100 }}>{"Mee töihi"}</b>
      </header>
    </div>
  );
}

export default App;
