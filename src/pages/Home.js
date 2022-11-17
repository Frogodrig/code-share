import React, { useState } from "react";
import { v4 as uuidV4 } from 'uuid'; //Package to generate unique room ids
import toast, { Toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {

        const navigate = useNavigate();

        // 'new room' state tracking
        const [roomId, setRoomId] = useState('');

        // 'Username' state tracking
        const [username, setUsername] = useState('');

        // New Room event listener
        const createNewRoom = (e) => {

            // To stop page reload
            e.preventDefault(); 

            // Generating unique room id
            const id = uuidV4();
            
            // Setting room id
            setRoomId(id);

            // Generating success toast  
            toast.success('New Room Created');
        };

        const joinRoom = () => {
            
            // Generating error toast  
            if(!roomId || !username) {
                toast.error('Room Id and Username are required');
                return;
            }

            // Redirect 
            navigate(`/editor/${roomId}`, {
                state: {
                    username,
                },
            })
        };

        const handleInputEnter = (e) => {
            if(e.code === 'Enter') {
                joinRoom();
            }
        };

        return (
            <div className="homePageWrapper">
                <div className="formWrapper">
                    <img className="homePageLogo" src="/code-share.png" alt="code-share-logo" />
                    <h4 className="mainLabel">Paste invitation ROOM ID</h4>
                    <div className="inputGroup">
                        <input type="text" className="inputBox" placeholder="ROOM ID" onChange={(e) => setRoomId(e.target.value)} value={roomId} onKeyUp={handleInputEnter}/>
                        <input type="text" className="inputBox" placeholder="USERNAME" onChange={(e) => setUsername(e.target.value)} value={username} onKeyUp={handleInputEnter}/>
                        <button className="btn joinBtn" onClick={joinRoom}>Join</button>
                        <span className="createInfo">
                            If you don't have an invite then create &nbsp; 
                            <a onClick={createNewRoom} href="" className="createNewBtn">
                                new room
                            </a>
                        </span>
                    </div>
                </div>

                <footer>
                    <h4>Built with 💛&nbsp;by&nbsp;<a href="https://github.com/Frogodrig">Aditya Awasthi</a></h4>
                </footer>
            </div>
        );

}

export default Home;