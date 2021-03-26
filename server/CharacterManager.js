'use strict';

/* Map 을 관리할 클래스 */
const Character = require('./Class/Character');

class CharacterManager {
    static characterList = [];
    constructor(){
    }
    static init(mongoose){

        const CharacterInfo = require('./schemas/CharacterInfo');

        /* TODO: populate 사용해서 변경 고려 */
        CharacterInfo.find({}, {"_id": false, "__v": false}).sort({"NUMBER": 1}).exec()
            .then((characterInfos) => {
                for(let characterInfo of characterInfos){
                    this.characterList.push(new Character(characterInfo));
                }
            })
            .then(() => {
                // console.log(this.characterList);
            });
    }
    static getCharacterByIndex(characterIndex){
        return this.characterList[characterIndex];
    }

    static getCharacterList(){
        return this.characterList.map((character) => character.SOURCE_PATH);
    }
}
module.exports = CharacterManager;