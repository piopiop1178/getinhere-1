import React, {useCallback, useEffect, useState} from 'react';
import styles from './youtubeMain.module.css'
import VideoList from './videoList';
import SearchHeader from './searchHeader';
import VideoDetail from './videoDetail';

const YoutubeMain = ({ socket, youtube }) => {
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const selectVideo = video => {
      setSelectedVideo(video);
    };
  
    const search = useCallback(
      query => {
        setSelectedVideo(null);
        youtube
          .search(query) 
          .then(videos => setVideos(videos));
      },
      [youtube]
    );
  
    useEffect(() => {
      youtube
        .mostPopular() 
        .then(videos => setVideos(videos));
    }, [youtube]);
    return (
      <div className={styles.app}>
        <SearchHeader onSearch={search} />
        <section className={styles.content}>
          {selectedVideo && (
            <div className={styles.detail}>
              <VideoDetail socket={socket} video={selectedVideo} />
            </div>
          )}
          <div className={styles.list}>
            <VideoList
              videos={videos}
              onVideoClick={selectVideo}
              display={selectedVideo ? 'list' : 'grid'}
            />
          </div>
        </section>
      </div>
    );
  }
        

export default YoutubeMain;