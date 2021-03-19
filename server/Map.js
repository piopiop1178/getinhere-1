/* Map 정보를 저장할 클래스 */

class Map{
    /* 맵 번호를 받아서 생성자 동작 */
    constructor(mapInfo_num){
        /* TODO 맵 번호를 통해서 DB에서 정보가져올 예정
         * 현재는 mapInfo 에 값 박아놓고 시작 */
        const mapInfo = {TILE_LENGTH : 60, TILE_WIDTH : 40, TILE_HEIGHT : 20,
            WIDTH : 2400, HEIGHT : 1200,
            CHAR_SIZE : 60, BACKGROUND_COLOR : "#FFFFFF", BACKGROUND_IMG_PATH : "img",
            BLOCKED_AREA : [9, 11, 20, 25, 31, 50, 100, 150, 170, 350, 380, 388, 500, 512, 513, 514, 550, 600, 650, 670, 677, 680] }            
        
        /* 가져온 정보를 속성으로 저장 */
        this.TILE_LENGTH = mapInfo.TILE_LENGTH;
        this.TILE_WIDTH = mapInfo.TILE_WIDTH;
        this.TILE_HEIGHT = mapInfo.TILE_HEIGHT;
        this.WIDTH = mapInfo.TILE_LENGTH * mapInfo.TILE_WIDTH;
        this.HEIGHT = mapInfo.TILE_LENGTH * mapInfo.TILE_HEIGHT;
        this.CHAR_SIZE = mapInfo.CHAR_SIZE;
        this.BACKGROUND_COLOR = mapInfo.BACKGROUND_COLOR;
        this.BACKGROUND_IMG_PATH = mapInfo.BACKGROUND_IMG_PATH;
        this.BLOCKED_AREA = mapInfo.BLOCKED_AREA.slice();
    }
}
module.exports = Map;
