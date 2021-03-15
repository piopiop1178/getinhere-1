let TILE_LENGTH
let TILE_WIDTH
let TILE_HEIGHT
let CHAR_SIZE
let WIDTH = TILE_LENGTH * TILE_WIDTH
let HEIGHT = TILE_LENGTH * TILE_HEIGHT
const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;

console.log('game.js!!!!!!!!!!!!!!!!!@@@@')

$(function () {
    var GAME_SETTINGS = null;

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var ctx_obj = canvas.getContext("2d");
    $(canvas).css("display", "block");
    $(canvas).css("border", "black 1px solid");
    $(canvas).css("margin", "0 auto");

    var query_param = get_query();

    var socket = io("/", { query: query_param });
    const body = document.querySelector('body')

    body.addEventListener('keydown' ,(e)=> {/*¨ö?©ö? 3.12*/
        let st = localStorage.getItem('myStatus');
        let parsed_status = JSON.parse(st);
        let curr_x = parsed_status.x;
        let curr_y = parsed_status.y;
        let col = curr_x/TILE_LENGTH + 1;
        let row = curr_y/TILE_LENGTH + 1;
        socket.emit('keydown', e.keyCode);
        if(e.keyCode == RIGHT) e.preventDefault(); parsed_status.x = parsed_status.x + TILE_LENGTH
        if(e.keyCode == LEFT)  e.preventDefault(); parsed_status.x = parsed_status.x - TILE_LENGTH
        if(e.keyCode == DOWN)  e.preventDefault(); parsed_status.y = parsed_status.y + TILE_LENGTH
        if(e.keyCode == UP)    e.preventDefault(); parsed_status.y = parsed_status.y - TILE_LENGTH
    })
    body.addEventListener("keyup", function (e) {
        socket.emit("keyup", e.keyCode);
    });
    socket.on("connected", function (SERVER_GAME_SETTINGS) {
        GAME_SETTINGS = SERVER_GAME_SETTINGS;
        $(canvas).attr("width", GAME_SETTINGS.WIDTH);
        $(canvas).attr("height", GAME_SETTINGS.HEIGHT);
        document.body.appendChild(canvas);

        localStorage.setItem('bitmap', GAME_SETTINGS.BITMAP);
        TILE_LENGTH = GAME_SETTINGS.TILE_LENGTH
        TILE_WIDTH = GAME_SETTINGS.TILE_WIDTH
        TILE_HEIGHT = GAME_SETTINGS.TILE_HEIGHT
        CHAR_SIZE = GAME_SETTINGS.CHAR_SIZE
        WIDTH = GAME_SETTINGS.WIDTH
        HEIGHT = GAME_SETTINGS.HEIGHT
    });
    socket.on("update", function (statuses) {
        if (GAME_SETTINGS == null) return;
        drawBackground(ctx, GAME_SETTINGS);

        statuses.forEach(function (status_pair) {
            if (status_pair.id == socket.id) {
                storelocalStorage(status_pair.status);
                updateWindowCenter(status_pair.status);
            }
            ctx.fillStyle = status_pair.status.color;
            ctx.fillRect(
                status_pair.status.x,
                status_pair.status.y,
                status_pair.status.width,
                status_pair.status.height
            );
        });

        drawBlockZone(localStorage.getItem('bitmap'), ctx_obj);
    });

    socket.on("waiting", function () {
        console.log("I'm waiting!");
    });

    socket.on("in", function () {
        console.log("I'm in!");
    });
});

function get_query() {
    var url = document.location.href;
    var qs = url.substring(url.indexOf("?") + 1).split("&");
    for (var i = 0, result = {}; i < qs.length; i++) {
        qs[i] = qs[i].split("=");
        result[qs[i][0]] = decodeURIComponent(qs[i][1]);
    }
    return result;
}

function storelocalStorage(myStatus) {/*¨ö?©ö? 3.12*/
    localStorage.setItem('myStatus', JSON.stringify(myStatus));
    let row = myStatus.y/TILE_LENGTH + 1;
    let col = myStatus.x/TILE_LENGTH + 1;
    localStorage.setItem('position', JSON.stringify({row, col}))
}
function updateWindowCenter(myStatus) {
    window.scrollTo(myStatus.x - window.innerWidth/2  + TILE_LENGTH/2 , myStatus.y - window.innerHeight/2 + TILE_LENGTH/2 )
}

function drawBackground(ctx, GAME_SETTINGS) {
    ctx.fillStyle = GAME_SETTINGS.BACKGROUND_COLOR;
    ctx.fillRect(
        0,
        0,
        GAME_SETTINGS.WIDTH,
        GAME_SETTINGS.HEIGHT
    );
}

function drawBlockZone(bitmap, ctx_obj) {
    let bin = (bitmap >>> 0).toString(2);
    let reversed_arr = findAllIndex(bin, 1);
    let arr = reversed_arr.map(x=> bin.length-1-x);
    for(let i =0; i< arr.length; i++) {
        let tile_row_col = convertNumToTileRowCol(arr[i]) 
        let pixel_x = (tile_row_col[1] - 1) * TILE_LENGTH;
        let pixel_y = (tile_row_col[0] - 1) * TILE_LENGTH;
        ctx_obj.fillStyle = "black";
        ctx_obj.fillRect(pixel_x, pixel_y, TILE_LENGTH, TILE_LENGTH);
    }
}

function convertNumToTileRowCol(num) {
    let arr = []
    // let row = parseInt(num / TILE_WIDTH) + 1
    let row = num % TILE_WIDTH ? parseInt(num / TILE_WIDTH) + 1 : parseInt(num / TILE_WIDTH);
    let col = num % TILE_WIDTH ? num % TILE_WIDTH : TILE_WIDTH;
    arr[0] = row
    arr[1] = col
    return arr;
}

function findAllIndex(string, char) { //! ?¨ª¢¥???¢¥? arr¢¬? ¢¬¢ç???¨ª??¢¥?¢¥?. 
    let arr = [];
    for (let i = 0; i < string.length; i++) {
        if (string[i] == char) {
        arr.push(i);
        }
    }
    return arr;
}