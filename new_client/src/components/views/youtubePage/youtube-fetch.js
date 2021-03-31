class Youtube {
    constructor() {
      this.getRequestOptions = {
        method: 'GET',
        redirect: 'follow',
      };
    }
  
    async mostPopular() {
      const response = await fetch(
        `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=45&regionCode=kr&key=${process.env.REACT_APP_GOOGLE_API_KEY}`,
        this.getRequestOptions
      );
      const result = await response.json();
      return result.items;
    }
  
    async search(query) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=45&q=${query}&type=video&key=${process.env.REACT_APP_GOOGLE_API_KEY}`,
        this.getRequestOptions
      );
      const result = await response.json();
      return result.items.map(item => ({ ...item, id: item.id.videoId }));
    }
  }
  
  export default Youtube;
  