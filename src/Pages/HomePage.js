import React from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Preloader from "../components/Preloader";

const HomePage = () => {
  const navigate = useNavigate();
  const [Loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
      
      setTimeout(()=>{
  
            setLoading(false);
      },3000)
      
  }, []);

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Created a new room");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Room Id & Username is required");
      return;
    }

    // Redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  if (Loading) {
    return <Preloader />;
  } else {
    return (
      <div className="HomePageWrapper">
        <div className="FormWrapper">
          <img src="/code-sync.png" alt="CodeImage" className="HomePageLogo" />
          <h4 className="MainLabel">Paste Invitation Room Id</h4>

          <div className="InputGroup">
            <input
              type="text"
              className="InputBox"
              placeholder="Room Id"
              onChange={(e) => setRoomId(e.target.value)}
              value={roomId}
              onKeyUp={handleInputEnter}
            />

            <input
              type="text"
              className="InputBox"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              onKeyUp={handleInputEnter}
            />

            <button className="btn joinBtn" onClick={joinRoom}>
              Join
            </button>

            <span className="createInfo">
              if you don't have invite then create &nbsp;
              <a href="#sf" className="createNewBtn" onClick={createNewRoom}>
                new room
              </a>
            </span>
          </div>
        </div>

        <footer className="footer">
          <h4>
            Created By{" "}
            <a
              className="footer-name"
              href="https://github.com/Akashkhandelwal191"
            >
              Akash Khandelwal ❤
            </a>{" "}
          </h4>
        </footer>
      </div>
    );
  }
};

export default HomePage;
