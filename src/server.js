import http from "http"
import SocketIO from "socket.io"
//import WebSocket from "ws";
import express from "express";
import peer from "peer";

const app = express();
const server = require("http").Server(app);
const {PeerServer} = require('peer');
const peerServer = PeerServer({port:9000, path:'/peerjs'});
const {v4:uuidv4} = require("uuid");
const io = require("socket.io")(server);
app.set('view engine', "pug");
app.set("views",__dirname + "/views")
app.use("/public",express.static(__dirname+"/public"));

let rooms = {};
let isHost = false;

//연결부분
// app.get("/", (req,res)=> {
//     res.redirect(`/${uuidv4()}`)
// });
// app.get("/", (req,res)=> {
//     res.redirect("/123")
// });
// app.get("/:home", (req,res) => {
//     console.log(req.params);
//     res.render("home",{roomId: req.params.home});
// });
// app.get("/:home/:userName", (req,res) => {
//     console.log(req.params);
//     res.render("home",{roomId: req.params.home,userName:req.params.userName});
// });
app.get("/:home/:userName/:limit", (req,res) => {
    console.log(req.params);
    //maxnum = req.params.limit;
    isHost = false;
    if(rooms[req.params.home]){
        res.render("home",{roomId: req.params.home,userName:req.params.userName, limit:req.params.limit});
    }
    else {
        res.render("test");
    }
    //res.render("home",{roomId: req.params.home,userName:req.params.userName, limit:req.params.limit});
});
app.get("/:home/:userName/:limit/:isCreator", (req,res) => {
    console.log(req.params);
    //maxnum = req.params.limit;
    isHost = true;
    res.render("home",{roomId: req.params.home,userName:req.params.userName,limit:req.params.limit, isCreator: req.params.isCreator});
});

// app.set('view engine', "pug");
// app.set("views",__dirname + "/views")
// app.use("/public",express.static(__dirname+"/public"));
// app.get("/", (req,res)=>res.render("home"));

// const httpServer = http.createServer(app);
// const wsServer = SocketIO(httpServer);
io.on('connection', (socket) => {
    console.log(socket.id);
    console.log("왔구나");
    socket.on('join-room', (roomId, peerId, name) => {
        if(isHost){
            rooms[roomId] = peerId;
            io.sockets.to(socket.id).emit('send-alarm',roomId);
        }
        if(rooms[roomId]){ //해당 방이 존재할때
            console.log(rooms);
            console.log(peerId);
            console.log(roomId);
            socket.join(roomId);
            //io.sockets.to(socket.id).emit("good-gate");
            socket.to(roomId).broadcast.emit('user-connected', peerId, name);
        
            socket.on('disconnect', () => {
                console.log(peerId);
                socket.to(roomId).broadcast.emit('user-disconnected', peerId);
                if(rooms[roomId] == peerId){ //호스트가 퇴장한 경우
                    console.log("호스트 퇴장");
                    console.log(rooms);
                    delete rooms[roomId];
                    console.log(rooms);
                }
            });
        } 
        // else { //해당 방이 없을때
        //     console.log("dddd");
        //     io.sockets.to(socket.id).emit("bad-gate");
        //     //socket.to(socket.id).emit("bad-gate");
        // }
        
    });
    // socket.on('send-peer-list', (roomId, peerList)=>{
    //     console.log("send peer list" + peerList);
    //     socket.to(roomId).broadcast.emit('peer-list', peerList);
    // });
  });

// io.on("connection", (socket) => {
//     //console.log(socket.id);
//     socket.on("join_room",(roomName, userId)=>{
//         console.log(roomName,"방에 ", userId, "님이 입장하셨습니다.");
//         socket.join(roomName);
//         socket.to(roomName).broadcast.emit('user_connected',userId);
//         //socket.to(roomName).emit('user_connected',userId);
//     });
// });


const handleListen = () => console.log('Listening http://localhost:3001');
//httpServer.listen(3001, handleListen);
server.listen(3001, handleListen);