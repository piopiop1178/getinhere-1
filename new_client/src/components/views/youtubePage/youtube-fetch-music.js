class YoutubeMusic {
    constructor() {
      this.getRequestOptions = {
        method: 'GET',
        redirect: 'follow',
      };
    }
  
    async mostPopular() {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=45&order=viewCount&q=%EB%85%B8%EB%9E%98%20%ED%94%8C%EB%A0%88%EC%9D%B4%EB%A6%AC%EC%8A%A4%ED%8A%B8&regionCode=kr&type=playlist&key=AIzaSyC1yQj217JD16u2lhsDBxvwTWA9UlglySs`,
        this.getRequestOptions
      );
      const result = await response.json();
      return result.items;
    }
  
    async search(query) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=45&q=${query}&type=video&type=playlist&key=AIzaSyC1yQj217JD16u2lhsDBxvwTWA9UlglySs`,
        this.getRequestOptions
      );
      const result = await response.json();
      console.log(result);
      return result.items.map(item => ({ ...item, id: item.id.videoId }));
    }
  }
  
  export default YoutubeMusic;
  