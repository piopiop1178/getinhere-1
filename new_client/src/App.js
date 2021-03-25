import React from 'react'
import './app.css'

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import LandingPage from './components/views/landingPage/landingPage';
// import PresetPage from './components/views/presetPage/presetPage';
import Main from './components/views/presetPage/mainPage';
// import RoomPage from './components/views/roomPage/roomPage';

function App() {
  return (
    <Router>
        {/*
          A <Switch> looks through all its children <Route>
          elements and renders the first one whose path
          matches the current URL. Use a <Switch> any time
          you have multiple routes, but you want only one
          of them to render at a time
        */}
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