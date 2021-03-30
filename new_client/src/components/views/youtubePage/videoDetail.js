import React from 'react';
import styles from './videoDetail.module.css';

const VideoDetail = ({ socket, video, video: { snippet } }) => {
  
  const shareVideo = ()=>{
    socket.emit('video', video.id)
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
      <div className={styles.buttondiv}><button className={styles.button} onClick={shareVideo}> 친구들이랑 같이 보기 </button></div>
      <h2>{snippet.title}</h2>
      <h3>{snippet.channelTitle}</h3>
      <pre className={styles.description}>{snippet.description}</pre>
    </section>
  )
};

export default VideoDetail;
