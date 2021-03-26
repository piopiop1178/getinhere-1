import React from 'react'
import './App.css'

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import LandingPage from './components/views/LandingPage/LandingPage';
// import PresetPage from './components/views/presetPage/presetPage';
import Main from './components/views/PresetPage/MainPage';
// import RoomPage from './components/views/roomPage/roomPage';

function App() {
  return (
    <Router>
        <Switch>
          <Route exact path="/" component={LandingPage} />
          {/* <Route exact path = "/"> <LandingPage /> </Route> */}
          <Route exact path="/room/:roomName" component={Main} />
          {/* <Route exact path="/room/:roomName"><Main /></Route> */}
        </Switch>
    </Router>
  );
}

export default App;