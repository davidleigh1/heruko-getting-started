module.exports = (io, socket) => {

    // const socketHelperFunctions = require("./socketHelperFunctions.js");
    require("./socketHelperFunctions.js");

    const users = {};
    const sockets = io.fetchSockets();

    const connection_msg = "Connection detected on socket: " + socket.id;
    console.log(connection_msg);
    console.log("Checking for matching users on that socket...");

    io.emit("notify", {
        'type':'notify', 
        'level': 'info', 
        'dest':'all', 
        'content': connection_msg, 
        'happened_at': socket.handshake.issued, 
        'query': socket.handshake.query
    } );
    
    console.log("Current users",users,"Total users:",Object.keys(users).length, "\n\n");
    // socketHelperFunctions.getUsersArray(users);
    getUsersArray(users);

    // socket.on('disconnect', () => {
    //     console.log("Disconnection detected on socket:",socket.id);

    //     // TODO: What if returns 0 or >1 ?
    //     const disconnectedUserObj = findUsers("socket_id", socket.id)[0] || {};

    //     const disconnection_msg = "User '"+disconnectedUserObj.user_name+"' disconnected";

    //     // TODO: Remove from users list on disconnection or on leave?
    //     console.log(disconnection_msg, "on socket: '"+ socket.id + "'. Total users:",Object.keys(users).length,"");
        

    //     // io.emit('info_message', disconnection_msg);
    //     io.emit("notify", {'type':'notify', level: 'warning', 'dest':'all', 'content': disconnection_msg} );
    // });

    const clientConnectionEvent = function (settingsObj) {
        console.log('\n\n==> client_connection:\n', settingsObj);

        console.log("Assiging username: '",settingsObj.user_name,"' to socket.data.username for socket:", socket.id);
        socket.data.username = settingsObj.user_name;

        // logConnection(settingsObj);

        /* Confirm if we recognize this user */
        if ( !users[settingsObj.user_id] ){
            console.log("User not found in users{} with UUID:",settingsObj.user_id);
            const newUser = logNewUser(settingsObj);

            /* Prepare chat_message */
            const msg_obj = {};
            msg_obj.msg_id = getUUID();
            msg_obj.sender_id = 'system';
            msg_obj.sender_name = 'System';
            msg_obj.dest_id = null;
            msg_obj.msg_type = 'chat_message';
            msg_obj.content = "<span class=\"joined inline-username\">" + newUser.user_name + "</span> has joined! ("+newUser.socket_id+")";
            msg_obj.happened_at = new Date().toISOString();
            msg_obj.is_history = false;

            /* Add list of users in this chat */
            const arrayOfUsernames = findUsers("user_name",null,"user_name").sort();
            msg_obj.content += "<br>Now in chat ("+arrayOfUsernames.length+"): <span class=\"inline-username\">" + arrayOfUsernames.join("</span>, <span class=\"inline-username\">") + "</span>";


            io.emit("chat_message", msg_obj);

        } else {
            console.log("User found!",settingsObj.user_id);
            // users[settingsObj.user_id].last_connected_at = new Date();

        // if ( !users[settingsObj.socket_id] ){
        //     console.error("USER NOT FOUND!", settingsObj);
        // } else {
            users[settingsObj.user_id].user_name = settingsObj.user_name;
            users[settingsObj.user_id].socket_id = settingsObj.socket_id;
            users[settingsObj.user_id].last_connected_at = new Date().toISOString();

            const reconnection_msg = "User '"+ users[settingsObj.user_id].user_name +"' is back! ("+users[settingsObj.user_id].socket_id+")";
            io.emit("notify", {'type':'notify', level: 'success', 'dest':'all', 'content': reconnection_msg} );



        }
        console.log("\n-------------\nUsers",users,"Total users:",Object.keys(users).length,"\n-------------\n");

    };

    const chatMessageEvent = function (msg_obj, callback) {
        console.log("New Incoming Message from '" + socket.data.username + "':", msg_obj);
        callback("Server says 'got it' msg_id:"+msg_obj.msg_id);
        // console.log("New Incoming Message from '"+msg_obj.sender_name+"': " + msg_obj.content);
        io.emit('chat_message', msg_obj);
        // TODO: Add green tick on confirmed receipt from all users 
    };

    const disconnectEvent = (payload) => {
        console.log("Disconnection detected on socket:",socket.id);

        // TODO: What if returns 0 or >1 ?
        const disconnectedUserObj = findUsers("socket_id", socket.id)[0] || {};

        const disconnection_msg = "User '"+disconnectedUserObj.user_name+"' disconnected";

        // TODO: Remove from users list on disconnection or on leave?
        console.log(disconnection_msg, "on socket: '"+ socket.id + "'. Total users:",Object.keys(users).length,"");
        

        // io.emit('info_message', disconnection_msg);
        io.emit("notify", {'type':'notify', level: 'warning', 'dest':'all', 'content': disconnection_msg} );
    };

    const readOrder = (orderId, callback) => {
        // ...
    };

    socket.on("disconnect", disconnectEvent);
    socket.on("client_connection", clientConnectionEvent);
    socket.on("chat_message", chatMessageEvent);
    // socket.on("order:read", readOrder);
};
