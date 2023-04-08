import React, { useEffect, useState,useRef } from "react";
import Loader from "../components/Loader";
import "./EditorPage.css";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import toast from 'react-hot-toast';
import ACTIONS from "../Action";
import { useParams,useLocation,useNavigate,Navigate} from "react-router-dom";

const EditorPage = () => {

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const {roomId} = useParams();
  const location = useLocation();
  const reactNavigator = useNavigate();
  const [Loading, SetLoading] = useState(true);
  const [Clients, SetClients] = useState([
    { socketId: 1, username: "Rakesh k" },
    { socketId: 2, username: "Akash K" },
  ]);
 
  useEffect(() => {
    let ding = new Audio('/ding.mp3');
    setTimeout(() => {
      SetLoading(false);
      ding.play();
    }, 3000);
  }, []);
  

  useEffect(()=>{
  
      const init = async() =>{

           socketRef.current = await initSocket();
           socketRef.current.on('connect_error', (err) => handleErrors(err));
           socketRef.current.on('connect_failed', (err) => handleErrors(err));

           function handleErrors(e) {
               console.log('socket error', e);
               toast.error('Socket connection failed, try again later.');
               reactNavigator('/');
           }

           socketRef.current.emit(ACTIONS.JOIN,{

             roomId,
             username:location.state?.username,
             
           });


            // Listening for joined event
            socketRef.current.on(
              ACTIONS.JOINED,
              ({ clients, username, socketId }) => {
                  if (username !== location.state?.username) {
                      let Join = new Audio('/Join.mp3');
                      toast.success(`${username} joined the room.`);
                      Join.play();
                      console.log(`${username} joined`);
                  }
                  SetClients(clients);
                  socketRef.current.emit(ACTIONS.SYNC_CODE, {
                      code: codeRef.current,
                      socketId,
                  });
                 
              }
          );
 
          
        //   socketRef.current.emit("typing",{
        //     username:location.state?.username,
        //  });


          //Listening For Typing
          socketRef.current.on("typing",({username})=>{
              
              if(username)
              {
                document.getElementById('type').innerHTML = `${username} is typing...`;
                console.log(`${username} is typing`);
              }
              else
              {
                document.getElementById('type').innerHTML = '';
                console.log(username);
              }
               
          });

          // Listening for disconnected
          socketRef.current.on(
              ACTIONS.DISCONNECTED,
              ({ socketId, username }) => {
                  let Left = new Audio('/Left.mp3');
                  toast.success(`${username} left the room.`);
                  Left.play();
                  SetClients((prev) => {
                      return prev.filter(
                          (client) => client.socketId !== socketId
                      );
                  });
              }
          );
    

      };

      init();
      return () => {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
    };

  },[]);

  async function copyRoomId() {
    try {
        await navigator.clipboard.writeText(roomId);
        toast.success('Room ID has been copied to your clipboard');
    } catch (err) {
        toast.error('Could not copy the Room ID');
        console.error(err);
    }
}

function leaveRoom() {
    reactNavigator('/');
}


 


  if (!location.state) {
    return <Navigate to="/" />;
 }

  if (Loading) {
    return <Loader />;
  } else {
    return (
      <div className="mainWrap">
        <div className="aside">
          <div className="aside-inner">
            <div className="logo">
              <img className="logoImage" src="/code-sync.png" alt="logo" />
            </div>
            <div id="type"></div>
            <h3>Connected</h3>
            <div className="clientsList">
              {Clients.map((client) => {
                return (
                  <Client key={client.socketId} username={client.username} />
                );
              })}
            </div>
          </div>
           <button className="btn copyBtn" onClick={copyRoomId}>COPY ROOM ID</button>
           <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
        </div>
       
        <div className="editorwrap">
        <Editor
                    socketRef={socketRef}
                    username={location.state?.username}
                    roomId={roomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
        </div>
      </div>
    );
  }
};

export default EditorPage;
