let sip_server = '@sipjs.onsip.com';
let randomCode = undefined;
let username;
let password;
let newUser;
var userAgent;
var remoteVideo;
var localVideo;
var session;
var session1;
var connectedUsers = [];
var unknown_user_counter = 0;


// create room
function createRoom() {


    username = document.getElementById("username").value;
    password = document.getElementById("password").value;

    if (username.length == 0 || password.length == 0) {
        document.getElementById("alertNotification").style.display = "block";
        return;
    }
    randomCode = password;
    newUser = {
        username: username,
        uri: `${username}.${randomCode}${sip_server}`,
        randomCode: randomCode
    }
    document.getElementById("index-header").style.display = "none";
    document.getElementById("video-stream").style.display = "block";
    userAgent = new SIP.UA({
        traceSip: true,
        uri: newUser.uri,
        displayName: newUser.username
    });

}

// start video call caller side
function startVideoCall() {

    remoteVideo = document.getElementById('remoteVideo');
    localVideo = document.getElementById('localVideo');

    var pc = session.sessionDescriptionHandler.peerConnection;

    var remoteStream = new MediaStream();
    pc.getReceivers().forEach(function (receiver) {
        remoteStream.addTrack(receiver.track);
    });
    remoteVideo.srcObject = remoteStream;
    remoteVideo.play();

    var localStream = new MediaStream();
    pc.getSenders().forEach(function (sender) {
        localStream.addTrack(sender.track);
    });
    localVideo.srcObject = localStream;
    localVideo.play();

}

// sendconn to other clinets by a clientt
function sendConnectRequest(uri){

    let session_gp_send_side = userAgent.invite(uri);
    
    document.getElementById("call-during-connected-body").style.display = "block";

    session_gp_send_side.on('failed', function (response, cause) {
        alert('call failed')
    });
    
    session_gp_send_side.on('accepted', function (data) {
        document.getElementById("call-during-connected-body").style.display = "none";
        
        let participantNewUser = {
            username: uri
        }
        connectedUsers.push(participantNewUser); 
        startVideoCallRecieveGp(participantNewUser,session_gp_send_side);
    });

    session_gp_send_side.on('terminated', function (message, cause) {
        alert('call terminated')
    });

}

// add participant gp call as an host
function addParticipantGp() {

    let participant_username = document.getElementById("username-participant").value;
    
    let participantNewUser = {
        username: participant_username,
        uri: `${participant_username}.${randomCode}${sip_server}`,
        randomCode: randomCode
    }
    
    // document.getElementById("add-participant-body").style.display = "none";
    
    
    document.getElementById("main-video-body").style.display = "block";

    let session_gp_send_side = userAgent.invite(participantNewUser.uri);

    document.getElementById("call-during-connected-body").style.display = "block";

    session_gp_send_side.on('failed', function (response, cause) {
        document.getElementById("start-video-call-body").style.display = "none";
        document.getElementById("main-video-body").style.display = "none";
        document.getElementById("call-during-connected-body").style.display = "none";
        document.getElementById("call-disconnected-body").style.display = "block";
    });
    session_gp_send_side.on('accepted', function (data) {
        
        // send new connection client details to old connected clients
        if(connectedUsers.length != 0){
            connectedUsers.forEach(element => {
                userAgent.message(element.uri, participantNewUser.uri);
            });
        }

        // add connected users 
        connectedUsers.push(participantNewUser);

        document.getElementById("call-during-connected-body").style.display = "none";

        document.getElementById("call-connected-body").style.display = "block";

        document.getElementById("start-video-call-body").style.display = "block";

        startVideoCallGp(participantNewUser,session_gp_send_side);

    });
    session_gp_send_side.on('terminated', function (message, cause) {
        document.getElementById("start-video-call-body").style.display = "none";
        document.getElementById("main-video-body").style.display = "none";
        document.getElementById("call-during-connected-body").style.display = "none";
        document.getElementById("call-terminated-body").style.display = "block";
    });

}

// add participant
function addParticipant() {

    let participant_username = document.getElementById("username-participant").value;
    let participantNewUser = {
        username: participant_username,
        uri: `${participant_username}.${randomCode}${sip_server}`,
        randomCode: randomCode
    }
    document.getElementById("add-participant-body").style.display = "none";
    document.getElementById("main-video-body").style.display = "block";

    session = userAgent.invite(participantNewUser.uri);

    document.getElementById("call-during-connected-body").style.display = "block";

    session.on('failed', function (response, cause) {
        document.getElementById("start-video-call-body").style.display = "none";
        document.getElementById("main-video-body").style.display = "none";
        document.getElementById("call-during-connected-body").style.display = "none";
        document.getElementById("call-disconnected-body").style.display = "block";
    });
    session.on('accepted', function (data) {
        
        document.getElementById("call-during-connected-body").style.display = "none";

        document.getElementById("call-connected-body").style.display = "block";

        document.getElementById("start-video-call-body").style.display = "block";
    });
    session.on('terminated', function (message, cause) {
        document.getElementById("start-video-call-body").style.display = "none";
        document.getElementById("main-video-body").style.display = "none";
        document.getElementById("call-during-connected-body").style.display = "none";
        document.getElementById("call-terminated-body").style.display = "block";
    });

}



// start video call call side  / host side group chatting

function startVideoCallGp(participantNewUser,session_gp_send_side) {
    
    var remoteVideoDiv = document.getElementById("remoteVideoDiv");

    // create new video elemnet
    var video = document.createElement('video');
    let temp = `${participantNewUser.username}_${Math.random().toFixed(2)*10000}`
    video.id = temp;
    remoteVideoDiv.appendChild(video);
    // get new video 
    remoteVideo = document.getElementById(temp);

    localVideo = document.getElementById('localVideo');

    var pc = session_gp_send_side.sessionDescriptionHandler.peerConnection;
    // Gets remote tracks
    var remoteStream = new MediaStream();
    pc.getReceivers().forEach(function (receiver) {
        remoteStream.addTrack(receiver.track);
    });
    remoteVideo.srcObject = remoteStream;
    remoteVideo.play();

    // Gets local tracks
    var localStream = new MediaStream();
    pc.getSenders().forEach(function (sender) {
        localStream.addTrack(sender.track);
    });
    localVideo.srcObject = localStream;
    localVideo.play();

}



// start video call recceive side session_gp_recieve_side
function startVideoCallRecieveGp(participantNewUser, session_gp_recieve_side) {

    
    var remoteVideoDiv = document.getElementById("remoteVideoDiv");

    // create new video elemnet
    var video = document.createElement('video');
    video.id = `${participantNewUser.username}`
    remoteVideoDiv.appendChild(video);
    // get new video 
    remoteVideo = document.getElementById(`${participantNewUser.username}`);

    localVideo = document.getElementById('localVideo');

    var pc = session_gp_recieve_side.sessionDescriptionHandler.peerConnection;
    // Gets remote tracks
    var remoteStream = new MediaStream();
    pc.getReceivers().forEach(function (receiver) {
        remoteStream.addTrack(receiver.track);
    });
    remoteVideo.srcObject = remoteStream;
    remoteVideo.play();

    // Gets local tracks
    var localStream = new MediaStream();
    pc.getSenders().forEach(function (sender) {
        localStream.addTrack(sender.track);
    });
    localVideo.srcObject = localStream;
    localVideo.play();


}


// start video call recceive side
function startVideoCallRecieve() {

    remoteVideo = document.getElementById('remoteVideo');
    localVideo = document.getElementById('localVideo');

    var pc = session1.sessionDescriptionHandler.peerConnection;
    // Gets remote tracks
    var remoteStream = new MediaStream();
    pc.getReceivers().forEach(function (receiver) {
        remoteStream.addTrack(receiver.track);
    });
    remoteVideo.srcObject = remoteStream;
    remoteVideo.play();

    // Gets local tracks
    var localStream = new MediaStream();
    pc.getSenders().forEach(function (sender) {
        localStream.addTrack(sender.track);
    });
    localVideo.srcObject = localStream;
    localVideo.play();


}

// recieve call
function createUAandRecieveCall() {
    
    // start loading

    document.getElementById("main-container").style.display = "none";
    document.getElementById("loading-body").style.display = "block";

    username = document.getElementById("username").value;
    password = document.getElementById("password").value;

    if (username.length == 0 || password.length == 0) {
        document.getElementById("alertNotification").style.display = "block";
        return;
    }



    document.getElementById("index-header").style.display = "none";
    document.getElementById("video-stream").style.display = "block";
    document.getElementById("add-participant-body").style.display = "none";
    document.getElementById("main-video-body").style.display = "block";
    document.getElementById("waiting-call").style.display = "block";

    randomCode = password;

    newUser = {
        username: username,
        uri: `${username}.${randomCode}${sip_server}`,
        randomCode: randomCode
    }


    userAgent = new SIP.UA({
        traceSip: true,
        uri: newUser.uri,
        displayName: newUser.username
    });


    userAgent.on('invite', function (session) {
        
        document.getElementById("main-container").style.display = "block";
        document.getElementById("loading-body").style.display = "none";

        document.getElementById("incoming-call-body").style.display = "block";

        session1 = session;
        session.accept();

        document.getElementById("call-during-connected-body").style.display = "block";

        session1.on('failed', function (response, cause) {
            document.getElementById("start-video-call-body-recieve").style.display = "none";
            document.getElementById("main-video-body").style.display = "none";
        document.getElementById("call-during-connected-body").style.display = "none";
            document.getElementById("call-disconnected-body").style.display = "block";
        });
        session1.on('accepted', function (data) {
            document.getElementById("call-during-connected-body").style.display = "none";
            document.getElementById("call-connected-body").style.display = "block";
            document.getElementById("start-video-call-body-recieve").style.display = "block";
        });
        session1.on('terminated', function (message, cause) {
            document.getElementById("start-video-call-body-recieve").style.display = "none";
            document.getElementById("main-video-body").style.display = "none";
        document.getElementById("call-during-connected-body").style.display = "none";

            document.getElementById("call-terminated-body").style.display = "block";
        });

    });

}


// recieve call for group
function createUAandRecieveCallGp() {
    
    // start loading

    document.getElementById("main-container").style.display = "none";
    document.getElementById("loading-body").style.display = "block";

    username = document.getElementById("username").value;
    password = document.getElementById("password").value;

    if (username.length == 0 || password.length == 0) {
        document.getElementById("alertNotification").style.display = "block";
        return;
    }

    document.getElementById("index-header").style.display = "none";
    document.getElementById("video-stream").style.display = "block";
    document.getElementById("add-participant-body").style.display = "none";
    document.getElementById("main-video-body").style.display = "block";
    document.getElementById("waiting-call").style.display = "block";

    randomCode = password;

    newUser = {
        username: username,
        uri: `${username}.${randomCode}${sip_server}`,
        randomCode: randomCode
    }


    userAgent = new SIP.UA({
        traceSip: true,
        uri: newUser.uri,
        displayName: newUser.username
    });


    userAgent.on('message', function(msg){                  
        // alert(msg.remoteIdentity.displayName);
        alert('Host is calling' + msg.body + '...');
        sendConnectRequest(msg.body);       
    });

    userAgent.on('invite', function (session) {
        
        document.getElementById("main-container").style.display = "block";
        document.getElementById("loading-body").style.display = "none";
        document.getElementById("incoming-call-body").style.display = "block";

        let session_gp_recieve_side = session;
        session.accept();

        document.getElementById("call-during-connected-body").style.display = "block";

        session_gp_recieve_side.on('failed', function (response, cause) {
            document.getElementById("start-video-call-body-recieve").style.display = "none";
            document.getElementById("main-video-body").style.display = "none";
            document.getElementById("call-during-connected-body").style.display = "none";
            document.getElementById("call-disconnected-body").style.display = "block";
        });
    
        session_gp_recieve_side.on('accepted', function (data) {
            
            unknown_user_counter =  unknown_user_counter + 1;
            let participantNewUser = {
                username: `username_${unknown_user_counter}_${Math.random().toFixed(2)*10000}`
            } 
            connectedUsers.push(participantNewUser);
            
            document.getElementById("call-during-connected-body").style.display = "none";
            document.getElementById("call-connected-body").style.display = "block";
            document.getElementById("start-video-call-body-recieve").style.display = "block";
            
            startVideoCallRecieveGp(participantNewUser, session_gp_recieve_side);

        });
    
        session_gp_recieve_side.on('terminated', function (message, cause) {
            document.getElementById("start-video-call-body-recieve").style.display = "none";
            document.getElementById("main-video-body").style.display = "none";
            document.getElementById("call-during-connected-body").style.display = "none";
            document.getElementById("call-terminated-body").style.display = "block";
        });

    });

}

// end call
function endcall() {
    window.location.href = 'index.html';
}

// go home button
function goHome() {
    window.location.href = 'index.html';
}