/* Map 을 관리할 클래스 */
const Map = require('./Map');

class MapManager {
    static mapList = [];
    /* 매개변수 없이 DB에서 정보를 받아서 시작하자마자 맵 로드 */
    constructor(){
        /* TODO DB에서 전체 맵 정보를 미리 업로드
         * 현재는 고정 값을 가진 Map 하나 추가 */
    }
    /* Room 생성 시 필요한 Map 정보를 mapIndex를 통해 반환 */
    static init(){
        this.mapList.push(new Map());
    }
    static getMapByIndex(mapIndex){
        return this.mapList[mapIndex];
    }
}
module.exports = MapManager;