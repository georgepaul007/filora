import React, { Fragment, useEffect, useRef, useState } from "react";
import Head from "next/head";
import { useRecoilState } from "recoil";
import otpGenerator from "otp-generator";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import { CopyIcon, Loading, ResetIcon } from "../../assets/icons";
import { darkModeAtom } from "../../utils/store";
import { QR_GENERATE_API } from "../../utils/constants";
import { io, Socket } from "socket.io-client";
import SimplePeer from "simple-peer";
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
} from "../../components/constants";
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

let peer = null;
let conn = null;

export const getnumid = (id) => {
  var id = otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });
  if (Number.isInteger(id)) {
    ("Connection is working");
  } else {
    ("Not working");
  }
};





export const getQRCode = async (txt) => {
  const img_src = await fetch(QR_GENERATE_API + txt);
  return img_src.url;
};

export default function SendComponent() {
  const [files,setFiles] = useState([]);
  const socketRef = useRef();
  const peersRef = useRef([]);
  const fileRef = useRef();
  const otpRef = useRef();
  const connections = useRef(0);
  const current = useRef(0);
  const fileInd = useRef(0);
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    showCloseButton: true,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });
  console.log('%c\uD83D\uDE09 Filora!', 
            'font-weight:bold; font-size:50px;color:red; ' +
            'text-shadow:3px 3px 0 red,6px 6px 0 orange,9px 9px 0 yellow, ' +
            '12px 12px 0 green,15px 15px 0 blue,18px 18px 0 indigo,21px 21px 0 violet');
  const [lastPeerId, setLast] = useState(null);
  const [peerId, setPeer] = useState(null);
  const [isDarkMode, setIsDarkMode] = useRecoilState(darkModeAtom);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    generateOtp();
    connectSocket();
  }, []);
  
  const generateOtp = () => {
    otpRef.current = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      specialChars: false,
      upperCase: false,
    });
    console.log(otpRef.current);
  };
  // ! NEW CODE BASE
  // async function initialize() {

  //   var beepsound = new Audio("audio.mp3");
  //   beepsound.setAttribute("preload", "auto");
  //   var connec = otpGenerator.generate(6, {
  //       digits: true,
  //       alphabets: false,
  //       upperCase: false,
  //       specialChars: false,
  //   });
  //   console.log(connec);
  //   let qr_src = await getQRCode(connec);
  //   setQrSrc(qr_src);
  //   peer = new Peer(connec);
  //   peer.on("open", function (id) {
  //     beepsound.play();
  //     if (peer.id === null) {
  //         console.log("Received null id from peer open");
  //         peer.id = lastPeerId;
  //     } else {
  //         setLast(peer.id);
  //     }

  //     console.log("ID: " + peer.id);
  //     setPeer(peer.id);
  // });
  // }
// ! END OF NEWCODEBASE

    // INFO: Function to copy Peer ID to clipboard
    const copyToClipBoard = async (copyMe) => {
      try {
          await navigator.clipboard.writeText(copyMe);
          Toast.fire({
              icon: "success",
              timer: 3000,
              title: "OTP copied to clipboard!",
          });
      } catch (err) {
          console.log(err);
      }
  };
  const connectSocket = () => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on(WELCOME, () => {
      console.log(WELCOME_REPLY_SENDER);
      console.log("Socket id: ", socketRef.current.id);
      socketRef.current.emit(CREATE_ROOM, socketRef.current.id, otpRef.current);
    });
    console.log("Completed");
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

  // const addPeer = () => {
  //   if (
  //     document.getElementById(`input_box_${myPeersState.length - 1}`).value ==
  //     ""
  //   ) {
  //     //alert("Please fill in the peer id");
  //     Toast.fire({
  //       icon: "warning",
  //       title: "Please fill in the peer id",
  //     });
  //     return;
  //   }
  //   let peers = [...myPeersState];
  //   peers.push(new Peer());
  //   setMyPeersState(peers);
  // };

  // const removePeer = () => {
  //   if (myPeersState.length > 1) {
  //     let peers = [...myPeersState];
  //     peers.pop();
  //     setMyPeersState(peers);
  //   }
  // };

  // const doCleanUp = () => {
  //   setFiles([]);
  //   setMyPeersState([new Peer()]);
  //   document.getElementById(`input_box_${0}`).value = "";
  // };

  // const handleSend = () => {
  //   try {
  //     let inputs = [];
  //     for (let i = 0; i < myPeersState.length; i++) {
  //       let value = document.getElementById(`input_box_${i}`).value;
  //       if (value == "") {
  //         // alert("Missing IDs");
  //         Toast.fire({
  //           icon: "warning",
  //           title: "Missing IDs",
  //         });
  //         // doCleanUp();
  //         return;
  //       }
  //       inputs.push(value);
  //     }

  //     let myConnections = [];
  //     myPeersState.map((p, i) => {
  //       myConnections.push(
  //         p.connect(inputs[i], {
  //           reliable: true,
  //         })
  //       );
  //     });

  //     myConnections.map((conn) => {
  //       conn.on("open", () => {
  //         let allFiles = fileRef.current.files;
  //         var title = [];
  //         var total_file_size = 0;
  //         var total_files = allFiles.length;
  //         for (let i = 0; i < allFiles.length; i++) {
  //           title[i] = {
  //               data: allFiles[i],
  //               name: allFiles[i].name,
  //               type: allFiles[i].type,
  //               size: allFiles[i].size
  //           };
  //           total_file_size = total_file_size + allFiles[i].size;
  //       }
  //       console.log(total_file_size);
  //       if(allFiles.length>10){
  //         Swal.fire({
  //           title: `Selected more than 10 file`,
  //           icon:"info",
  //           text: `Select Less than 10 file`,
  //           allowOutsideClick: false,
  //           showCancelButton: true,
  //           confirmButtonText: `Ok`,
  //           confirmButtonColor: "#0ED073",
  //       })
  //       }else{
  //           conn.send({
  //             total_file_size,
  //             total_files,
  //             title,
  //           });
  //         }
  //       });
  //     });

  //     doCleanUp();
  //   } catch (e) {
  //     //alert("Wrong ID!");
  //     Toast.fire({
  //       icon: "warning",
  //       title: "Wrong ID!",
  //     });
  //     doCleanUp();
  //   }
  // };

  // const handleError = (e) => {
  //   console.log("Error:", e);
  // };

  // const handleScan = (s) => {
  //   let scans = [...qrScans];
  //   if (s !== null && scans.indexOf(s) === -1) {
  //     let beepSound = new Audio("audio1.mp3");
  //     beepSound.setAttribute("preload", "auto");
  //     beepSound.play();
  //     console.log("Scan:", s);
  //     scans.push(s);
  //     setQrScans(scans);
  //     document.getElementById(`input_box_${0}`).value = scans[0];
  //     for (let i = 1; i < scans.length; i++) {
  //       addPeer();
  //       document.getElementById(`input_box_${i}`).value = scans[i];
  //     }
  //   }
  // };
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
  }
  return (
    <>
      <Head>
        <title>Filora | Send Files</title>
        <script defer src="https://unpkg.com/peerjs@1.3.1/dist/peerjs.min.js"></script>
      </Head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
      <div className="dark:bg-darkBackground flex text-center min-h-screen ">
        <div className="flex flex-col items-center justify-items-center m-auto text-center bg-lightBlue">
          <div className="flex flex-col p-5 bg-green-300 rounded-md shadow-lg md:w-96 sm:w-72">
          <span className="animate__animated animate__zoomIn"><h1 className="text-4xl font-semibold mb-4 text-deepGreen ">Send Files</h1></span>
           
           
          <div className="flex flex-row justify-center">
                            {otpRef.current ? (
                                <>
                                   <span className=" animate__animated animate__flipInX"><h2 className="font-bold text-4xl my-4 text-black tracking-widest">
                                        {otpRef.current}
                                    </h2></span>

                                    <div className="flex flex-row items-center justify-center">
                                        <button title="Regenerate OTP" className="dark:text-white mx-2" onClick={() => initialize()}>
                                            <ResetIcon />
                                        </button>

                                        <button
                                            onClick={() => copyToClipBoard(peerId)}
                                            className="float-right focus:outline-none mx-2"
                                            title="Copy to Clipboard"
                                            id="clipboard"
                                        >
                                            <CopyIcon />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <Loading />
                            )}
                        </div>
                        {/* <p className="text-center text-deepGreen text-xl font-medium my-2">
                            or
                        </p>

                        <div className="flex items-center justify-center">
                            {qrSrc ? (
                                <img className="m-auto data" src={qrSrc} alt="QR-code"/>
                            ) : (
                                <Loading />
                            )}
                        </div> */}

                        {/* <p className="font-bold my-2 text-black" id="status">
                            Scan QR to receive files
                        </p>
           
                        <p className="font-medium text-sm my-1" id="connection_status"></p> */}

            
            
            <button 
              className="p-5 bg-primaryBlue my-5 text-2xl rounded text-white"
              onClick={()=>{
              document.getElementById('file').click();
            }}>
              Choose Files
              <input
              className="my-4"
              ref={fileRef}
              type="file"
              id="file"
              multiple
              hidden
              onChange={(e)=>{
                console.log(fileRef);
                setFiles(fileRef.current.files);
                console.log(files.length);
              }}
            />
            </button>
            <p className="mb-5">
            {
              (files.length > 0)
              ?
                (files.length < 2)
                ?
                  files[0].name
                :
                  files.length + " Files Selected"
              :
                'No file Selected'
            }
            </p>
            {/* <p ref={status} className="font-bold">
              Status:
            </p> */}
            <div className="flex flex-row my-6">
              <button
                onClick={() => sendData(fileInd.current)}
                className="bg-blue-800 w-1/2 text-2xl text-white p-4 m-1 bg-primaryBlue  rounded-md shadow-md"
              >
                Send
              </button>
              <a href="/" className="w-1/2 text-2xl p-4 m-1 bg-red  rounded-md shadow-md ">
                <button className="focus:outline-none">
                  Back
                </button>
              </a>
            </div>
          </div>
        </div>
        <div className="fixed bottom-6 left-6">
          <DarkModeSwitch
            checked={isDarkMode}
            onChange={toggleDarkMode}
            size={60}
          />
        </div>
      </div>
    </>
  );
}