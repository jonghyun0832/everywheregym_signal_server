# EveryWhereGym Signaling Server

## Brief
EveryWhereGym Signaling Server Part (Mesh)
Client(안드로이드), Server, Signaling Server(WebRTC) 3가지로 구성  
Client : https://github.com/jonghyun0832/EveryWhereGym  
Server : https://github.com/jonghyun0832/EveryWhereGymServer  
Signaling Server : https://github.com/jonghyun0832/everywheregym_signal_server  

### Development
* NodeJS (Express, PUG)
* Nodemon
* Babel

### APIs
* SocketIo
* WebRTC
* PeerJS
* HarkJS
* Web Audio API

### Process
1. Make RTCPeerconnection
2. Signaling (exchange SDP, ICE Candidates)
3. Peer to Peer Connection
4. Make DataChannel

### SDP Flow
<img src="https://user-images.githubusercontent.com/72550133/164972793-10d3fcdd-737b-4506-9cec-6263eddb69eb.png" width="800px" height="400px" title="Login" alt="Login"></img>
