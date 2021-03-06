const socket = io();
const videoGrid = document.getElementById('video-grid');
const videoHost = document.getElementById('video-host');
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const changeBtn = document.getElementById("changeInput");
const camerasSelect = document.getElementById("cameras");
const finish = document.getElementById("finish");
const nameHost = document.getElementById("name-host");
const join = document.getElementById("join");
//const micVolume = document.getElementById("micVol");

let muted = false;
let mic_vol_mute = false;
let cameraOff =false;
let isfront = true;
let firstCamera = true;
let isAlter = false;
let isfirst = true;
let myName = USER_NAME;
let blockp2p = false;
let join_num = 0;
let join_limit = LIMIT;
let myVideoStream;


if(join_limit < 5){
  videoGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(250px,1fr))";
} else if (join_limit < 10){
  videoGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(200px,1fr))";
} else {
  videoGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(150px,1fr))";
}

// videoGrid.style.gridTemplateColumns = "repeat(auto-fit, minmax(400px,1fr))";



let myStream;
let myPeerId;
const myPeer = new Peer({
  config: {'iceServers': [
        {url: 'stun:stun.l.google.com:19302'},
        {
          url: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
      },
      {
          url: 'turn:192.158.29.39:3478?transport=udp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808'
      },
      { 
          url: 'turn:192.158.29.39:3478?transport=tcp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808'
      },
      {
          url: 'turn:turn.bistri.com:80',
          credential: 'homeo',
          username: 'homeo'
      },
      {
          url: 'turn:turn.anyfirewall.com:443?transport=tcp',
          credential: 'webrtc',
          username: 'webrtc'
      }
    ]}
  });
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
let calls = [];
let isStart = false;
let host = false;
let hostId;

// nameHost.innerText = USER_NAME;

if(ISCREATOR == "1"){
  host = true;
  console.log("??????????????????");
  finish.innerText = "????????????";
} else {
  blockp2p = true;
}


function handleMuteClick(){
  console.log(myStream.getAudioTracks());
  myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
  if(!muted){
      muteBtn.innerText = "????????? ON"
      muted = true;
  } else {
      muteBtn.innerText = "????????? OFF"
      muted = false;
  }
  audioTrack2 = myStream.getAudioTracks()[0];
  calls.forEach(function(pc){
    pc.peerConnection.getSenders().find((sender) => sender.track.kind === "audio").replaceTrack(audioTrack2);
  })


}

function handleCameraClick(){
  myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
  if(cameraOff){
      cameraBtn.innerText = "????????? OFF"
      cameraOff = false;
  } else {
      cameraBtn.innerText = "????????? ON"
      cameraOff = true;
  }
}

async function handleChangeInput(){ //?????? ??????
  console.log(camerasSelect[camerasSelect.length-1]);
  // await getMedia(camerasSelect.value);
  // console.log("?????????");
  // console.log(myStream.getVideoTracks());
  if (isfront == true){
    await getMedia(camerasSelect[camerasSelect.length-1].value);
    isfront = false;
  } else {
    await getMedia(camerasSelect[0].value);
    isfront = true;
  }
  const videoTrack = myStream.getVideoTracks()[0];
  console.log("????????? call???");
  console.log(calls);
  calls.forEach(function(pc){
    pc.peerConnection.getSenders().find((sender) => sender.track.kind === "video").replaceTrack(videoTrack);
  })
  // if (myPeer) {
  //   const videoTrack = myStream.getVideoTracks()[0];
  //   const videoSender = myPeer
  //     .getSenders()
  //     .find((sender) => sender.track.kind === "video");
  //   videoSender.replaceTrack(videoTrack);
  // }
}

// async function handleCameraChange() {
//   await getMedia(camerasSelect.value);
//   if (myPeer) {
//     const videoTrack = myStream.getVideoTracks()[0];
//     // console.log(calls[0].peerConnection.getSenders()[0]);
//     // console.log(calls[0].peerConnection.getSenders().find((sender) => sender.track.kind === "video"));
//     calls.forEach(function(pc){
//       pc.peerConnection.getSenders().find((sender) => sender.track.kind === "video").replaceTrack(videoTrack);
//     })
//     //calls[0].peerConnection.getSenders().find((sender) => sender.track.kind === "video").replaceTrack(videoTrack);
//     //calls[0].peerConnection.getSenders()[0].replaceTrack(videoTrack);
//     //   .getSenders()
//     //   .find((sender) => sender.track.kind === "video");
//     // videoSender.replaceTrack(videoTrack);
//   }
// }

function handelFinish(){
  if(host){
    confirm("???????????? ?????????????????????????");
  } else {
    confirm("??????????????????????");
  }
}

async function handleMicVol(mic_val){

  console.log("????????? ?????? ?????????" + mic_val);

  if(mic_val == 0){
    mic_vol_mute = true;
  } else {
    mic_vol_mute = false;
  }
  console.log("????????? : " + muted);

  const audioContext = new AudioContext();
  const gainNode = audioContext.createGain();

  audioContext.resume();

  refreshMedia();

  let audioSource = audioContext.createMediaStreamSource(myStream);
  let AudioDestination = audioContext.createMediaStreamDestination();
  audioSource.connect(gainNode);
  gainNode.connect(AudioDestination);

  console.log(mic_val);
  let volume = mic_val;

  gainNode.gain.value = volume;
  console.log(gainNode.gain.value);

  audioTrack = myStream.getAudioTracks()[0];
  myStream.removeTrack(audioTrack);
  myStream.addTrack(AudioDestination.stream.getAudioTracks()[0]);

  audioTrack2 = myStream.getAudioTracks()[0];
  calls.forEach(function(pc){
    pc.peerConnection.getSenders().find((sender) => sender.track.kind === "audio").replaceTrack(audioTrack2);
  })
}


//micVolume.addEventListener("change",handleMicVol);

muteBtn.addEventListener("click",handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);
changeBtn.addEventListener("click",handleChangeInput);
finish.addEventListener("click",handelFinish);
//camerasSelect.addEventListener("input", handleCameraChange);

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    console.log(cameras);
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function refreshMedia(){
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      {
        audio: true,
        video: { facingMode: "user" },
      }
    );
  } catch(e){
    console.log(e);
}
}

async function getMedia(deviceId){
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  const cameraBack = {
    audio: true,
    video: { facingMode: "environment" },
  };
  try {
    if(deviceId != null){
      console.log("null??????");
      myStream = await navigator.mediaDevices.getUserMedia(
        {
          audio: true,
          video: { facingMode: "environment" },
        }
      );
    } else {
      console.log("null???");
      myStream = await navigator.mediaDevices.getUserMedia(
        {
          audio: true,
          video: { facingMode: "user" },
        }
      );
    }
    // myStream = await navigator.mediaDevices.getUserMedia(
    //     deviceId? cameraBack : initialConstrains
    // );
    console.log("????????? ?????????");
    console.log(myStream);

    if(firstCamera){
      console.log("first111111111");
      const text2 = document.createElement("p");
      const div1 = document.createElement("div");
      div1.style.position = "relative";
      div1.style.boxSizing = "border-box";
      text2.style.position = "absolute";
      text2.style.bottom = "0px";
      text2.style.backgroundColor = "rgba(0,0,0,0.4)";
      text2.style.color = "white";

      addListener(myVideo);
      addVideoStream(myVideo, myStream,"0",USER_NAME, text2,div1);
      firstCamera = false;
    } else{
      console.log("second2222222222222");
      const text2 = document.createElement("p");
      const div1 = document.createElement("div");
      // div1.style.position = "relative";
      // div1.style.boxSizing = "border-box";
      // text2.style.position = "absolute";
      // text2.style.bottom = "0px";
      // text2.style.backgroundColor = "rgba(0,0,0,0.4)";
      // text2.style.color = "white";

      isAlter = true;
      addVideoStream(myVideo,myStream,"0",USER_NAME, text2,div1);
    }
    if (!deviceId) {
        await getCameras();
      }
} catch(e){
    console.log(e);
}
//   console.log(myStream);
//   myStream = await navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true,
// })
// .catch(error=>{
//   console.log("error??????" + error);
// });

// addListener(myVideo);
// addVideoStream(myVideo, myStream);
}

async function initProcess(){
  console.log("initprocess");
  await getMedia();
}
async function firstini(){
  await initProcess();

  myPeer.on('call', (call) => { //?????? ???????????????????????? ??????
    join_num = call.metadata.join;
    join.innerText = "???????????? : " + join_num + " / " + join_limit;
    console.log("call");
    console.log(call.metadata);
    //console.log(call.peer);
    //console.log(call.metadata.type);
    calls.push(call);
    if(call.metadata.host){
      hostId = call.metadata.type;
    }
    peers[call.metadata.type] = call;
    call.answer(myStream);
    console.log("????????? ?????????(??????) : " + hostId);
    console.log("answer");
    const video = document.createElement('video');

    const text2 = document.createElement("p");
    const div1 = document.createElement("div");
    div1.style.position = "relative";
    div1.style.boxSizing = "border-box";
    text2.style.position = "absolute";
    text2.style.bottom = "0px";
    text2.style.backgroundColor = "rgba(0,0,0,0.4)";
    text2.style.color = "white";

    //stream??? 2?????? ???????????? ????????????
    call.on('stream', (userVideoStream) => {
      console.log("1?????? stream");
      //console.log(peers);
      addListener(video);
      addVideoStream(video, userVideoStream,call.peer, call.metadata.name, text2,div1);
    });
    call.on('close', () => {
      console.log("B?????? ??????");
      deleteCall(call.connectionId);
      video.remove();
      text2.remove();
      div1.remove();
    });
  });
  
  socket.on('user-connected', (peerId, name) => {
    join_num += 1;
    join.innerText = "???????????? : " + join_num + " / " + join_limit;
    console.log("user_connected peer id : " + peerId);
    connectToNewUser(peerId, myStream, name);
    //????????? ????????? ???????????? ????????????
  });
}

firstini();

socket.on('user-disconnected', (peerId) => {
  if(join_num >0){
    join_num -= 1;
  }
  join.innerText = "???????????? : " + join_num + " / " + join_limit;
  console.log("user_disconnected : " + peerId);
  console.log(peerId);
  console.log(peers);
  //?????????????????? -1 ???????????? ????????????
  if(peerId == hostId){
    alert("??????????????? ???????????? ??????????????????!"); 
  }
  //if (peers[userId]) peers[userId].close();
  let peerKeyArray = Object.keys(peers);
  for (var value of peerKeyArray){
    if(value.indexOf(peerId) != -1){
      console.log("?????????????????? ?????????");
      peers[value].close();
    }
  }
});

myPeer.on('open', (id) => { //?????? ???????????? ??????
  console.log("??? ?????? ????????? : " + id);
  myPeerId = id;
  console.log("????????? ??? ?????? ????????? : " + id);
  socket.emit('join-room', ROOM_ID, id, USER_NAME);
  console.log("join-room??????" + ROOM_ID);
});


//????????? ????????? connectToNew???????????? stream??? ?????? ?????????? 2?????? stream??? ????????????????????????
//connect to new user?????? call????????????
function connectToNewUser(peerId, stream, name) {
  if(!blockp2p){
    console.log("connectToNewUser");
    console.log(stream);
    if(host){
      options = {metadata: {"type":myPeerId, "name":myName, "join":join_num, "host":true}};
    } else {
      options = {metadata: {"type":myPeerId, "name":myName, "join":join_num, "host":false}};
    }
    const call = myPeer.call(peerId, stream,options);
    calls.push(call);
    const video = document.createElement('video');

    const text2 = document.createElement("p");
    const div1 = document.createElement("div");
    div1.style.position = "relative";
    div1.style.boxSizing = "border-box";
    text2.style.position = "absolute";
    text2.style.bottom = "0px";
    text2.style.backgroundColor = "rgba(0,0,0,0.4)";
    text2.style.color = "white";

    call.on('stream', (userVideoStream) => {
      console.log("2?????? stream(????????? stream)");
      addListener(video);
      //addAudioListner(userVideoStream);
      addVideoStream(video, userVideoStream, peerId, name, text2, div1);
    });
    call.on('close', () => {
      console.log("A?????? ??????");
      deleteCall(call.connectionId);
      video.remove();
      text2.remove();
      div1.remove();
    });
    peers[myPeerId +"/"+ peerId] = call;
  }
  // socket.emit('send-peer-list', ROOM_ID, "peers");
  // console.log(peers);
  // console.log(Object.keys(peers));
}

function addVideoStream(video, stream, peerId, name, text2, div1) {

  let speech = hark(stream);
  speech.on('speaking',function(){
    console.log('???????????? ?????????');
    video.style.border = "solid green 3px";
    if(!muted && !mic_vol_mute){
      myVideoStream.style.border = "solid green 3px";
    } else {
      myVideoStream.style.border = "solid black 3px";
    }
  });
  speech.on('stopped_speaking', function(){
    console.log("????????? ??????");
    video.style.border = "solid black 3px";
    if(!muted && !mic_vol_mute){
      myVideoStream.style.border = "solid black 3px";
    }
  })

  console.log("????????? ???????????????");
  console.log(video);
  console.log(stream);
  console.log(stream.getAudioTracks());
  console.log(isStart);
  console.log(video.readyState);
  if(!isAlter){
    video.srcObject = stream;
    text2.innerText = name;
    div1.append(text2);
    div1.append(video);
    if(!host){ //????????? ???????????? ????????????
      videoGrid.style.gridTemplateColumns = "100%";
      videoGrid.style.gridAutoRows = "100%";
      if(hostId){ //????????? ?????? ????????? ???
        if(peerId == hostId){ //??????????????? ?????? ??????
          videoHost.append(video);
          nameHost.innerText = name;
          //nameHost.innerText = name
        } else{
          videoGrid.append(div1);
        }
      } else {
        // videoGrid.style.gridTemplateColumns = "100%";
        // videoGrid.style.gridAutoRows = "100%";
        videoGrid.append(div1);
        myVideoStream = video;

      }
    }else { //???????????? ??????
      if(isfirst){ //????????? ????????? ??????
        videoHost.style.width = "0%";
        videoGrid.style.width = "100%";
        videoGrid.append(div1)
        // videoHost.append(video);
        // nameHost.innerText = name;
        myVideoStream = video;
        isfirst = false;
      } else{
        videoGrid.append(div1);
      }
    }
  } else {
    video.srcObject = stream;
  }
  //videoGrid.append(video);
}

// function handleVol(video){
//   video.addEventListener("click", ()=>{
//     console.log(video.volume);
//   });
// }

function addListener(video){
  //handleVol(video);
  console.log("??????????????????");
  video.addEventListener('loadedmetadata', () => {
    console.log("22?????????????????????22");
    video.play();
  });
  
  // function onDouble(){
  //   console.log("????????????");
  //   let target = this;
  //   target.style.width = "800px";
  //   target.style.height = "600px";
  //   target.style.zindex = "10";
  // }
  // video.addEventListener("dblclick",onDouble);
}

// async function addAudioListner(stream){
//   console.log(stream.getAudioTracks()[0]);

//   const options = {};
//   const speechEvents = hark(stream, options);

//   speechEvents.on('speaking', function(){
//     console.log("?????????????????????");
//   });

//   speechEvents.on('stopped_speaking', function(){
//     console.log('????????? ??????');
//   })
//   }

function deleteCall(id){
  console.log("call?????????????????????");
  for(let i=0; i<calls.length; i++){
    if(calls[i].connectionId == id){
      console.log(id + " ?????????");
      calls.splice(i,1);
      i--;
    }
  }
}