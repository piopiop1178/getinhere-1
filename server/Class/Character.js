'use strict';

class Character{
    constructor(characterInfo){
        this.NUMBER = characterInfo.NUMBER;
        this.SOURCE_PATH = characterInfo.SOURCE_PATH;
    }

    get NUMBER(){
        return this._NUMBER;
    }

    set NUMBER(value){
        this._NUMBER = value;
    }

    get SOURCE_PATH(){
        return this._SOURCE_PATH;
    }

    set SOURCE_PATH(value){
        this._SOURCE_PATH = value;
    }
}
module.exports = Character;
