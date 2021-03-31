class Youtube {
    constructor() {
      this.getRequestOptions = {
        method: 'GET',
        redirect: 'follow',
      };
    }
  
    async mostPopular() {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=kr&&maxResults=45&key=AIzaSyC1yQj217JD16u2lhsDBxvwTWA9UlglySs`,
        this.getRequestOptions
      );
      const result = await response.json();
      return result.items;
    }
  
    async search(query) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${query}&type=video&key=AIzaSyC1yQj217JD16u2lhsDBxvwTWA9UlglySs`,
        this.getRequestOptions
      );
      const result = await response.json();
      return result.items.map(item => ({ ...item, id: item.id.videoId }));
    }
  }
  
  export default Youtube;
  