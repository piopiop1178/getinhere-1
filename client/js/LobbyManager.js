function LobbyManager(io) {
    var LbMg = this;
    LbMg.lobby = [];
    LbMg.updating = false;

    /* Push socket into lobby */
    LbMg.push = function(socket) {
        LbMg.lobby.push(socket);
    };

    /* Delete socket from lobby */
    LbMg.kick = function(socket) {
        var index = LbMg.lobby.indexOf(socket);
        if (index >= 0) LbMg.lobby.splice(index, 1);
    };

    LbMg.clean = function() {
        var sockets = LbMg.lobby;
        LbMg.lobby = sockets.filter(function(socket) {return socket !== null;});
    };

    LbMg.dispatch = function(RmMg) {
        if (LbMg.dispatching) return;
        LbMg.dispatching = true;

        while (LbMg.lobby.length >= 1) {
            var player = LbMg.lobby.splice(0, 1)[0];

            const roomName = player.handshake.query.room;
            if (roomName != undefined)
            {
                var valid = false;
                let roomList = Object.values(RmMg.rooms);
                for (var room of roomList) {
                    if (room.name == roomName) {
                        RmMg.join(player, room);
                        valid = true;
                        break;
                    }
                }
                if (!valid) {
                    //TODO Use app.use() before proceeding here and give error html
                    console.log('wrong room name!');
                }
            }
            else
            {
                RmMg.create(player);
            }
        }
        LbMg.dispatching = false;
        console.log(RmMg.rooms);
    };
}
module.exports = LobbyManager;
