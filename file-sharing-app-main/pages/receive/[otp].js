import React, { Fragment, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import SimplePeer from "simple-peer";
import download from "downloadjs";
import { useRouter } from "next/router";
import {
  SOCKET_URL,
  WELCOME,
  WELCOME_REPLY_RECEIVER,
  SENDER_SIGNAL_SOCKET_REPLY,
  RECEIVER_SIGNAL,
  COMPLETED,
  RECEIVER_JOINED,
  RECEIVED_FILE,
} from "../../components/constants";

function Receive2() {
  const router = useRouter();
  const { otp } = router.query;
  const socketRef = useRef();
  const peerRef = useRef();
  const fileChunksRef = useRef([]);
  const fileNameRef = useRef("sample.txt");

  const connectSocket = () => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on(WELCOME, () => {
      console.log(WELCOME_REPLY_RECEIVER);
      console.log("Socket ID: ", socketRef.current.id);
      socketRef.current.emit(RECEIVER_JOINED, socketRef.current.id, otp);
    });

    socketRef.current.on(SENDER_SIGNAL_SOCKET_REPLY, (data, senderSocketID) => {
      console.log("STEP 1 COMPLETED");
      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
      });

      peer.signal(data);
      peer.on("signal", (signal) => {
        socketRef.current.emit(RECEIVER_SIGNAL, signal, senderSocketID);
      });

      peer.on("connect", () => {
        console.log("Connected Receiver");
      });

      peer.on("data", (chunk) => {
        if (chunk.toString() === COMPLETED) {
          const file = new File(fileChunksRef.current, "document.docx");

          console.log("received file: ", file);

          download(file, fileNameRef.current);
          fileChunksRef.current = [];
          peer.send(RECEIVED_FILE);
        } else if (chunk.toString().includes("fileName")) {
          const parsed = JSON.parse(chunk);
          fileNameRef.current = parsed.fileName;
        } else {
          console.log("chunk pushed");
          fileChunksRef.current.push(chunk);
        }
      });

      peerRef.current = peer;
    });
  };

  useEffect(() => {
    if (router.isReady) {
      // workerRef.current = new Worker("/worker.js");
      connectSocket();
      // initializePeer();
    }
  }, [router.isReady]);

  return (
    <Fragment>
      <h1>RECEIVE 2</h1>
    </Fragment>
  );
}

export default Receive2;
