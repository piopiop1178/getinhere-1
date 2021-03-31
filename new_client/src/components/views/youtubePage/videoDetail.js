import React from 'react';
import styles from './videoDetail.module.css';

const VideoDetail = ({ curr_space, socket, video, video: { snippet } }) => {
  
  const shareVideo = ()=>{
    socket.emit('video', video.id)
  }
  const shareAudio = () =>{
      socket.emit('music', video.id)
  }

  let shareWindow;
  if (curr_space === 1) {
      shareWindow = <div className={styles.buttondiv}><button className={styles.button} onClick={shareAudio}> 친구들이랑 같이 듣기 </button></div>
  }
  else if (curr_space === 3){
    shareWindow = <div className={styles.buttondiv}><button className={styles.button} onClick={shareVideo}> 친구들이랑 같이 보기 </button></div>
  }


  return(
    <section className={styles.detail}>
      <iframe
        className={styles.video}
        type="text/html"
        title="youtuve video player"
        width="100%"
        height="500px"
        src={`https://www.youtube.com/embed/${video.id}`}
        frameBorder="0"
        allowFullScreen
      ></iframe>
      {shareWindow}
      <h2>{snippet.title}</h2>
      <h3>{snippet.channelTitle}</h3>
      <pre className={styles.description}>{snippet.description}</pre>
    </section>
  )
};

export default VideoDetail;
