import React, { Component } from 'react';

class DeviceSelector extends Component {
    componentDidMount(){
        // const media = navigator.mediaDevices.enumerateDevices();
        // // console.log(media);
        
        const videoElement = document.querySelector('video');
        const audioInputSelect = document.querySelector('select#audioSource');
        const audioOutputSelect = document.querySelector('select#audioOutput');
        const videoSelect = document.querySelector('select#videoSource');
        const selectors = [audioInputSelect, audioOutputSelect, videoSelect];

        function gotDevices(deviceInfos) {
            // Handles being called several times to update labels. Preserve values.
            const values = selectors.map(select => select.value);
            selectors.forEach(select => {
              while (select.firstChild) {
                select.removeChild(select.firstChild);
              }
            });
            for (let i = 0; i !== deviceInfos.length; ++i) {
              const deviceInfo = deviceInfos[i];
              const option = document.createElement('option');
              option.value = deviceInfo.deviceId;
              if (deviceInfo.kind === 'audioinput') {
                option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
                audioInputSelect.appendChild(option);
              } else if (deviceInfo.kind === 'audiooutput') {
                option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
                audioOutputSelect.appendChild(option);
              } else if (deviceInfo.kind === 'videoinput') {
                option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
                videoSelect.appendChild(option);
              } else {
                console.log('Some other kind of source/device: ', deviceInfo);
              }
            }
            selectors.forEach((select, selectorIndex) => {
              if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
                select.value = values[selectorIndex];
              }
            });
          }
          
          navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
          
          // Attach audio output device to video element using device/sink ID.
          function attachSinkId(element, sinkId) {
            if (typeof element.sinkId !== 'undefined') {
              element.setSinkId(sinkId)
                  .then(() => {
                    console.log(`Success, audio output device attached: ${sinkId}`);
                  })
                  .catch(error => {
                    let errorMessage = error;
                    if (error.name === 'SecurityError') {
                      errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
                    }
                    console.error(errorMessage);
                    // Jump back to first output device in the list as it's the default.
                    audioOutputSelect.selectedIndex = 0;
                  });
            } else {
              console.warn('Browser does not support output device selection.');
            }
          }
          
          function changeAudioDestination() {
            const audioDestination = audioOutputSelect.value;
            attachSinkId(videoElement, audioDestination);
          }
          
          function gotStream(stream) {
            window.stream = stream; // make stream available to console
            videoElement.srcObject = stream;
            // Refresh button list in case labels have become available
            return navigator.mediaDevices.enumerateDevices();
          }
          
          function handleError(error) {
            console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
          }
          
          function start() {
            if (window.stream) {
              window.stream.getTracks().forEach(track => {
                track.stop();
              });
            }
            const audioSource = audioInputSelect.value;
            const videoSource = videoSelect.value;
            const constraints = {
              audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
              video: {deviceId: videoSource ? {exact: videoSource} : undefined}
            };
            navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
          }
          
          audioInputSelect.onchange = start;
          audioOutputSelect.onchange = changeAudioDestination;
          
          videoSelect.onchange = start;
          
          start();
    }
    
    render() {
        return (
            <div className="device-selector">
                <div className="video-selector">
                    <span className="device-image"><i className="fas fa-video"></i></span>
                    <select id="videoSource"></select>
                </div>
                <div className="mic-selector">
                    <span className="device-image"><i className="fas fa-microphone"></i></span>
                    <select id="audioSource"></select>
                </div>
                <div className="speaker-selector">
                    <span className="device-image"><i className="fas fa-volume-down"></i></span>
                    <select id="audioOutput"></select>
                </div>
            </div>
        );
    }
}

export default DeviceSelector;