import React, { Fragment, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import SimplePeer from "simple-peer";
import download from "downloadjs";
import {
  SOCKET_URL,
  WELCOME,
  WELCOME_REPLY_RECEIVER,
  SENDER_SIGNAL_SOCKET_REPLY,
  RECEIVER_SIGNAL,
  COMPLETED,
  RECEIVER_JOINED,
} from "../components/constants";

function Receive2() {
  const socketRef = useRef();
  const peerRef = useRef();
  const fileChunksRef = useRef([]);

  const connectSocket = () => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on(WELCOME, () => {
      console.log(WELCOME_REPLY_RECEIVER);
      console.log("Socket ID: ", socketRef.current.id);
      socketRef.current.emit(RECEIVER_JOINED, socketRef.current.id);
    });

    socketRef.current.on(SENDER_SIGNAL_SOCKET_REPLY, (data) => {
      console.log("STEP 1 COMPLETED");
      peerRef.current = new SimplePeer({
        initiator: false,
        trickle: false,
      });

      peerRef.current.signal(data);
      peerRef.current.on("signal", (data) => {
        console.log("RECEIVING SIGNAL");
        socketRef.current.emit(RECEIVER_SIGNAL, data);
      });

      peerRef.current.on("data", (data) => {
        if (data.toString() === COMPLETED) {
          const file = new File(fileChunksRef.current, "document.docx");

          console.log("received file: ", file);

          download(file, "document.docx");
        } else {
          console.log("chunk pushed");
          fileChunksRef.current.push(data);
        }
      });
    });
  };

  useEffect(() => {
    // workerRef.current = new Worker("/worker.js");
    connectSocket();
    // initializePeer();
  }, []);

  return (
    <Fragment>
      <h1>RECEIVE 2</h1>
    </Fragment>
  );
}

export default Receive2;
