import React from 'react';
import styles from './videoDetail.module.css';

const VideoDetail = ({ socket, video, video: { snippet } }) => {
  
  const shareVideo = ()=>{
    console.log(video.id)
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
      <button className={styles.button} onClick={shareVideo}> 같이 보기 </button>
      <h2>{snippet.title}</h2>
      <h3>{snippet.channelTitle}</h3>
      <pre className={styles.description}>{snippet.description}</pre>
    </section>
  )
};

export default VideoDetail;
