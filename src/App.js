import './App.css';
import { COLORS } from './designtokens';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NewPlayerForm from './NewPlayerForm';
import WaitingRoom from './WaitingRoom';
import Game from './Game';

function App() {

  return (
    <div className="App">
      <h1>Ultimate <span style={{color: COLORS.primary}}>Fizz</span><span style={{color: COLORS.secondary}}>Buzz</span></h1>

      <Router>
        <Routes>
          <Route path="/" element={<NewPlayerForm isJoining={false}/>} />
          <Route path="/join-room/:roomId" element={<NewPlayerForm isJoining={true} />} />
          <Route path='/waiting-room/:roomId' element={<WaitingRoom />} />
          <Route path='/game/:roomId' element={<Game />} />
        </Routes>
      </Router>

      <footer>
        Made by <a href='https://github.com/aleburbridge' target='_blank'>Alexander Bridgeman</a> | <a href="https://www.google.com/search?sca_esv=aca16de1709f852f&sxsrf=AHTn8zoVbbEvQ5FY4xgiWYanazcrtEEA1Q:1744752860353&q=ferrari&udm=2&fbs=ABzOT_CWdhQLP1FcmU5B0fn3xuWpA-dk4wpBWOGsoR7DG5zJBsxayPSIAqObp_AgjkUGqemmTG2DFZE7tmKcXVp5H8R-R5rx2cv4LdpyiJ4nHnaj279lr22alALGBKHVKB9ifaChM6gvuH98mHdsXfFdxUQxqc95vVF-kHrOU-HtUWmZXs2P2y8m8ZI9I5zoMa9-_H_GDTP18X-s_IEXGvHW-nw9bXfR4w&sa=X&ved=2ahUKEwjhidnz_tqMAxW4j68BHaE7GBoQtKgLegQIHxAB&biw=1232&bih=793&dpr=2" target='_blank'>Buy me a Ferrari</a> 
      </footer>
    </div>
  );
}

export default App;
