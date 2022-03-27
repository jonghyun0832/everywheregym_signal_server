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
  host:'peerjs-server.herokuapp.com',
  secure:true,
  port:443,
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
  console.log("생성자입니다");
  finish.innerText = "종료하기";
} else {
  blockp2p = true;
}


function handleMuteClick(){
  console.log(myStream.getAudioTracks());
  myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
  if(!muted){
      muteBtn.innerText = "마이크 ON"
      muted = true;
  } else {
      muteBtn.innerText = "마이크 OFF"
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
      cameraBtn.innerText = "카메라 OFF"
      cameraOff = false;
  } else {
      cameraBtn.innerText = "카메라 ON"
      cameraOff = true;
  }
}

async function handleChangeInput(){
  console.log(camerasSelect[camerasSelect.length-1]);
  // await getMedia(camerasSelect.value);
  console.log("눌렀음");
  console.log(myStream.getVideoTracks());
  if (isfront == true){
    const tracks = myStream.getTracks();
    tracks.forEach(track=>track.stop());
    await getMedia("123");
    isfront = false;
  } else {
    const tracks = myStream.getTracks();
    tracks.forEach(track=>track.stop());
    await getMedia();
    isfront = true;
  }
  const videoTrack = myStream.getVideoTracks()[0];
  console.log("바꾸는 call들");
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
    confirm("라이브를 종료하시겠습니까?");
  } else {
    confirm("나가시겠습니까?");
  }
}

async function handleMicVol(mic_val){

  console.log("마이크 핸들 들어옴" + mic_val);

  if(mic_val == 0){
    mic_vol_mute = true;
  } else {
    mic_vol_mute = false;
  }

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
  // const cameraConstraints = {
  //   audio: true,
  //   video: { deviceId: { exact: deviceId } },
  // };
  const cameraBack = {
    audio: true,
    video: { facingMode: "environment" },
  };
  try {
    if(deviceId != null){
      console.log("null아님");
      myStream = await navigator.mediaDevices.getUserMedia(
        {
          audio: true,
          video: { facingMode: "environment" },
        }
      );
    } else {
      console.log("null임");
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
    console.log("받아온 스트림");
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
//   console.log("error발생" + error);
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

  myPeer.on('call', (call) => { //이건 접속하는쪽에서만 발생
    join_num = call.metadata.join;
    join.innerText = "참여인원 : " + join_num + " / " + join_limit;
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
    console.log("호스트 아이디(피어) : " + hostId);
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

    //stream은 2번씩 발생한다 왜그런가
    call.on('stream', (userVideoStream) => {
      console.log("1번째 stream");
      //console.log(peers);
      addListener(video);
      addVideoStream(video, userVideoStream,call.peer, call.metadata.name, text2,div1);
    });
    call.on('close', () => {
      console.log("B에서 제거");
      deleteCall(call.connectionId);
      video.remove();
      text2.remove();
      div1.remove();
    });
  });
  
  socket.on('user-connected', (peerId, name) => {
    join_num += 1;
    join.innerText = "참여인원 : " + join_num + " / " + join_limit;
    console.log("user_connected peer id : " + peerId);
    connectToNewUser(peerId, myStream, name);
    //여기서 받아온 인원수로 늘려주고
  });
}

firstini();

socket.on('user-disconnected', (peerId) => {
  if(join_num >0){
    join_num -= 1;
  }
  join.innerText = "참여인원 : " + join_num + " / " + join_limit;
  console.log("user_disconnected : " + peerId);
  console.log(peerId);
  console.log(peers);
  //감지할때마다 -1 시켜주면 될듯ㅇㅋ
  if(peerId == hostId){
    alert("트레이너가 라이브를 종료했습니다!"); 
  }
  //if (peers[userId]) peers[userId].close();
  let peerKeyArray = Object.keys(peers);
  for (var value of peerKeyArray){
    if(value.indexOf(peerId) != -1){
      console.log("삭제프로세스 들어감");
      peers[value].close();
    }
  }
});

myPeer.on('open', (id) => { //이건 어디서든 발생
  console.log("내 피어 아이디 : " + id);
  myPeerId = id;
  console.log("저장된 내 피어 아이디 : " + id);
  socket.emit('join-room', ROOM_ID, id, USER_NAME);
  console.log("join-room보냄" + ROOM_ID);
});


//아마도 여기서 connectToNew하기전에 stream이 먼저 나와서? 2번쨰 stream이 적용안되는거같음
//connect to new user에서 call발생시킴
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
      console.log("2번째 stream(상대방 stream)");
      addListener(video);
      //addAudioListner(userVideoStream);
      addVideoStream(video, userVideoStream, peerId, name, text2, div1);
    });
    call.on('close', () => {
      console.log("A에서 제거");
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
    console.log('말하는거 감지됨');
    video.style.border = "solid green 2px";
    if(!muted && !mic_vol_mute){
      myVideoStream.style.border = "solid green 2px";
    } else {
      myVideoStream.style.border = "solid black 2px";
    }
  });
  speech.on('stopped_speaking', function(){
    console.log("말하기 멈춤");
    video.style.border = "solid black 2px";
    if(!muted && !mic_vol_mute){
      myVideoStream.style.border = "solid black 2px";
    }
  })

  console.log("비디오 추가하는곳");
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
    if(!host){ //자신이 호스트가 아닌경우
      videoGrid.style.gridTemplateColumns = "100%";
      videoGrid.style.gridAutoRows = "100%";
      if(hostId){ //호스트 정의 되었을 때
        if(peerId == hostId){ //호스트일때 왼쪽 배치
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
    }else { //호스트인 경우
      if(isfirst){ //처음엔 자신을 배치
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
    cameraBtn.innerText = "카메라 ON"
    cameraOff = true;
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
  console.log("리스너등록됨");
  video.addEventListener('loadedmetadata', () => {
    console.log("22로드메타데이터22");
    video.play();
  });
  
  // function onDouble(){
  //   console.log("더블클릭");
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
//     console.log("말하는중입니다");
//   });

//   speechEvents.on('stopped_speaking', function(){
//     console.log('말하기 멈춤');
//   })
//   }

function deleteCall(id){
  console.log("call삭제부분들어옴");
  for(let i=0; i<calls.length; i++){
    if(calls[i].connectionId == id){
      console.log(id + " 삭제됨");
      calls.splice(i,1);
      i--;
    }
  }
}