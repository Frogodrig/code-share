import React, { useEffect, useRef, useState } from 'react';
import { Toast } from 'react-hot-toast';
import ACTIONS from '../actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

function EditorPage() {

    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const {roomId} = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));
            
            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            // Listening for joined event
            socketRef.current.on(ACTIONS.JOINED, ({clients, username, socketId}) => {
                if(username !== location.state?.username ) {
                    toast.success(`${username} joined the room.`);
                    console.log(`${username} joined`);
                }

                setClients(clients);

                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId,
                });
            })

            // Listening for disconnected
            socketRef.current.on(ACTIONS.DISCONNECTED, ({socketId, username}) => {
                toast.success(`${username} left the room.`);
                console.log(`${username} left`);
                setClients((prev) => {
                    return prev.filter(client => client.socketId !== socketId);
                });
            });
        };
        init();

        // Cleaning function
        return () => {
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
            socketRef.current.disconnect();
        }

    }, []);

    async function copyRoomId() {
        // Using in-built browser API
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room Id copied to clipboard');

        } catch(err) {
            toast.error('Could not copy Room Id');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    if(!location.state) {
        return <Navigate to="/" />
    }

    return (
        <div className='mainWrap'>
            <div className='aside'>
                <div className='asideInner'>
                    <div className='logo'>
                        <img className="logoImage" src="/code-share.png" alt="code-share-logo"></img>
                    </div>
                    <h3>Connected People</h3>
                    <div className='clientsList'>

                        {
                            clients.map((client) => (
                                <Client 
                                    key={client.socketId} 
                                    username={client.username}
                                />
                            ))
                        }

                    </div>
                </div>
                <button className='btn copyBtn' onClick={copyRoomId}>Copy Room Id</button>            
                <button className='btn leaveBtn' onClick={leaveRoom}>Leave</button>
            </div>
            <div className='editorWrap'>
                <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => {codeRef.current = code;}} />
            </div>
        </div>
    );

}

export default EditorPage;