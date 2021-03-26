'use strict';

/* Map 정보를 저장할 클래스 */

class Map{
    /* 맵 번호를 받아서 생성자 동작 */
    constructor(mapInfo){
        /* 가져온 정보를 속성으로 저장 */
        /* TODO: object 복사 문법으로 정리 */
        this.NUMBER = mapInfo.NUMBER;
        this.TILE_LENGTH = mapInfo.TILE_LENGTH;
        this.TILE_WIDTH = mapInfo.TILE_WIDTH;
        this.TILE_HEIGHT = mapInfo.TILE_HEIGHT;
        this.WIDTH = mapInfo.TILE_LENGTH * mapInfo.TILE_WIDTH;
        this.HEIGHT = mapInfo.TILE_LENGTH * mapInfo.TILE_HEIGHT;
        this.CHAR_SIZE = mapInfo.TILE_LENGTH;
        this.BACKGROUND_IMG_PATH = mapInfo.BACKGROUND_IMG_PATH;
        this.BLOCKED_AREA = [];
        this.MUSIC_LIST = [];
    }

    get TILE_LENGTH(){
        return this._TILE_LENGTH;
    }

    set TILE_LENGTH(value){
        this._TILE_LENGTH = value;
    }

    get TILE_WIDTH(){
        return this._TILE_WIDTH;
    }

    set TILE_WIDTH(value){
        this._TILE_WIDTH = value;
    }

    get TILE_HEIGHT(){
        return this._TILE_HEIGHT;
    }

    set TILE_HEIGHT(value){
        this._TILE_HEIGHT = value;
    }

    get WIDTH(){
        return this._WIDTH;
    }

    set WIDTH(value){
        this._WIDTH = value;
    }

    get HEIGHT(){
        return this._HEIGHT;
    }

    set HEIGHT(value){
        this._HEIGHT = value;
    }

    get CHAR_SIZE(){
        return this._CHAR_SIZE;
    }

    set CHAR_SIZE(value){
        this._CHAR_SIZE = value;
    }

    get BACKGROUND_IMG_PATH(){
        return this._BACKGROUND_IMG_PATH;
    }

    set BACKGROUND_IMG_PATH(value){
        this._BACKGROUND_IMG_PATH = value;
    }

    get BLOCKED_AREA(){
        return this._BLOCKED_AREA;
    }
    
    set BLOCKED_AREA(value){
        this._BLOCKED_AREA = value;
    }

    get MUSIC_LIST(){
        return this._MUSIC_LIST;
    }

    set MUSIC_LIST(value){
        this._MUSIC_LIST = value;
    }

}
module.exports = Map;
