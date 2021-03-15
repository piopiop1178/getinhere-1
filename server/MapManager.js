// TODO 나중에 DB에서 데이터를 가지고 올 수 있도록 설정해주기
function MapManager(Map_Number) {

    this.TILE_LENGTH = 60   // length of tile itself
    this.TILE_WIDTH = 40    // Number of horizontal tiles
    this.TILE_HEIGHT = 20;  // Number of vertical tiles
    this.CHAR_SIZE = 60     // size of character, same with TILE_LENGTH
    this.WIDTH = this.TILE_LENGTH * this.TILE_WIDTH
    this.HEIGHT = this.TILE_LENGTH * this.TILE_HEIGHT
    this.BACKGROUND_COLOR = "#FFFFFF"
    this.BLOCKED_AREA = [9, 11, 20, 25, 31, 50, 100, 150, 170, 350, 380, 388, 500, 512, 513, 514, 550, 600, 650, 670, 677, 680] //! dummy data
  
    
    this.pixelToTile = function(pixel) {
        let tile = pixel/TILE_LENGTH + 1;
        return tile;
    }
    
    this.tileToPixel = function(tile) { 
        let pixel = (tile-1)*TILE_LENGTH;
        return pixel;
    }
    
    this.convertLocToNum = function(row, col) {
        let target = ((row - 1) * (TILE_WIDTH) + (col))
        return target;
    }
    
    this.convertNumToTileRowCol = function(num) {
        let arr = []
        // let row = parseInt(num / TILE_WIDTH) + 1
        let row = num % TILE_WIDTH ? parseInt(num / TILE_WIDTH) + 1 : parseInt(num / TILE_WIDTH);
        let col = num % TILE_WIDTH ? num % TILE_WIDTH : TILE_WIDTH;
        arr[0] = row
        arr[1] = col
        return arr;
    }
    
    this.convertNumToPixelXY = function(num) {
        let arr = this.convertNumToTileRowCol(num);
        let x = this.tileToPixel(arr[1]); // x = col
        let y = this.tileToPixel(arr[0]); // y = row
        return [x, y];
    }
  
    this.checkBlockMap = function(block, row, col) { // ????? ?????? true?? return???
      let target = this.convertLocToNum(row, col)
      if (block.includes(target)) {
          return true;
      } else {
          return false;
      }
  }
    
  }
  module.exports = MapManager;