import React, { Component } from 'react';
import PresetPage from './presetPage'
import RoomPage from '../roomPage/roomPage'

class Main extends Component {
    state = {
        pagePreset : 0
    }

    pagePresetChange = () => {
        this.setState({pagePreset : 1})
    }

    render() {
        
        if (this.state.pagePreset === 0) return <PresetPage pagePreset={this.pagePresetChange}></PresetPage>
        else { return <RoomPage></RoomPage>}

    }
}

export default Main;