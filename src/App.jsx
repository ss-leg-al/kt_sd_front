import './App.css';
import Tabs from './components/Tabs';
import logo from './assets/logo.png'; // 로고 이미지 경로에 맞게 조정

function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">
        <img
          src={logo}
          alt="성동구 환경도우미 로고"
          style={{
            height: "36px",
            verticalAlign: "middle",
            marginRight: "8px",
          }}
        />
        성동 에코+
      </h1>
      <Tabs />
    </div>
  );
}

export default App;