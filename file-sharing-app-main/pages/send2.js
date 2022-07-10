import React, { Fragment, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import SimplePeer from "simple-peer";
import otpGenerator from "otp-generator";
import {
  SOCKET_URL,
  WELCOME,
  WELCOME_REPLY_SENDER,
  SENDER_SIGNAL,
  RECEIVER_SIGNAL_SOCKET_REPLY,
  COMPLETED,
  CREATE_ROOM,
  MAKE_CONNECTION,
  RECEIVED_FILE,
} from "../components/constants";

function Send2() {
  const socketRef = useRef();
  const peersRef = useRef([]);
  const fileRef = useRef();
  const otpRef = useRef();
  const connections = useRef(0);
  const current = useRef(0);
  const fileInd = useRef(0);

  const generateOtp = () => {
    otpRef.current = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      specialChars: false,
      upperCase: false,
    });
    console.log(otpRef.current);
  };

  const connectSocket = () => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on(WELCOME, () => {
      console.log(WELCOME_REPLY_SENDER);
      console.log("Socket id: ", socketRef.current.id);
      socketRef.current.emit(CREATE_ROOM, socketRef.current.id, otpRef.current);
    });

    socketRef.current.on(MAKE_CONNECTION, (receiverSocketID) => {
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
      });

      peer.on("signal", (data) => {
        console.log(`Sender's Signal ${peersRef.current.length}`);
        socketRef.current.emit(
          SENDER_SIGNAL,
          data,
          receiverSocketID,
          socketRef.current.id
        );
      });

      peer.on("connect", () => {
        console.log("Connected Sender");
      });

      peer.on("data", (data) => {
        if (data.toString() === RECEIVED_FILE) {
          current.current++;
        }

        if (current.current === connections.current) {
          fileInd.current++;
          current.current = 0;
          if (fileInd.current === fileRef.current.files.length) {
            fileInd.current = 0;
            return;
          }
          sendData(fileInd.current);
        }
      });

      peersRef.current.push(peer);
      connections.current++;
    });

    socketRef.current.on(RECEIVER_SIGNAL_SOCKET_REPLY, (data) => {
      peersRef.current[peersRef.current.length - 1].signal(data);
      console.log("STEP 2 Completed");
    });
  };

  const sendData = (ind) => {
    console.log("Clicked on Send");
    let files = fileRef.current.files;

    const file = files[ind];
    const fileName = file.name;
    peersRef.current.map((peer) => {
      peer.send(JSON.stringify({ fileName }));
    });
    file.arrayBuffer().then((buffer) => {
      const chunkSize = 256 * 1024;

      while (buffer.byteLength) {
        const chunk = buffer.slice(0, chunkSize);
        buffer = buffer.slice(chunkSize, buffer.byteLength);
        // peerRef.current.send(chunk);
        peersRef.current.map((peer) => {
          peer.send(chunk);
        });
      }
      // peerRef.current.send(COMPLETED);
      peersRef.current.map((peer) => {
        peer.send(COMPLETED);
      });
    });

    console.log(file);

    // peer.send("done");
  };

  useEffect(() => {
    generateOtp();
    connectSocket();
    // initializePeer();
  }, []);
  return (
    <Fragment>
      <h1>SEND 2</h1>
      <button onClick={() => sendData(fileInd.current)}>Send</button>
      <input ref={fileRef} type="file" multiple />
    </Fragment>
  );
}

export default Send2;
