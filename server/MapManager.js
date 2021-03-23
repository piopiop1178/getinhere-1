'use strict';

/* Map 을 관리할 클래스 */
const Map = require('./Class/Map');

class MapManager {
    static mapList = [];
    constructor(){
    }
    static init(){

        const MapInfo = require('./schemas/MapInfo');
        const BlockInfo = require('./schemas/BlockInfo');
        const MusicInfo = require('./schemas/MusicInfo');

        /* TODO: populate 사용해서 변경 고려 */
        MapInfo.find({}, {"_id": false, "__v": false}).exec()
            .then((mapInfos) => {
                for(let mapInfo of mapInfos){
                    this.mapList.push(new Map(mapInfo));
                }
            });
        BlockInfo.find({}, {"_id": false, "__v": false}).exec()
            .then((blockInfos) => {
                for(let blockInfo of blockInfos){
                    this.mapList[blockInfo.NUMBER].BLOCKED_AREA = blockInfo.POSITION_LIST;
                }
            });

        MusicInfo.find({}, {"_id": false, "__v": false}).exec()
            .then((musicInfos) => {
                for(let musicInfo of musicInfos){
                    this.mapList[musicInfo.NUMBER].MUSIC_LIST = musicInfo;
                }
            })
            .then(() => {
                // console.log(this.mapList);
            });
    }
    static getMapByIndex(mapIndex){
        return this.mapList[mapIndex];
    }
    static getMapList(){
        return this.mapList.map((map) => map.BACKGROUND_IMG_PATH);
    }
}
module.exports = MapManager;