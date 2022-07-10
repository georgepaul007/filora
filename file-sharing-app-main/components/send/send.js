import React, { createRef, useEffect, useState } from "react";
import Head from "next/head";
import { useRecoilState } from "recoil";
import otpGenerator from "otp-generator";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import { darkModeAtom } from "../../utils/store";
import { InfoIcon } from "../../assets/icons";

const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

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

let fileRef = createRef();
let status = createRef();

// ! No need of this anymore
// function initialize() {
//   const Toast = Swal.mixin({
//     toast: true,
//     position: "top-end",
//     showConfirmButton: false,
//     showCloseButton: true,
//     timerProgressBar: true,
//     didOpen: (toast) => {
//       toast.addEventListener("mouseenter", Swal.stopTimer);
//       toast.addEventListener("mouseleave", Swal.resumeTimer);
//     },
//   });
//   var connec = otpGenerator.generate(6, {
//     digits: true,
//     alphabets: false,
//     upperCase: false,
//     specialChars: false,
//   });
//   peer = new Peer(connec);

//   peer.on("open", function (id) {
//     // Workaround for peer.reconnect deleting previous id
//     if (peer.id === null) {
//       console.log("Received null id from peer open");
//       peer.id = lastPeerId;
//     } else {
//       lastPeerId = peer.id;
//     }

//     console.log("ID: " + peer.id);
//   });
//   peer.on("connection", function (c) {
//     // Disallow incoming connections
//     c.on("open", function () {
//       c.send("Sender does not accept incoming connections");
//       setTimeout(function () {
//         c.close();
//       }, 500);
//     });
//   });
//   peer.on("disconnected", function () {
//     status.current.innerHTML = "Connection lost. Please reconnect";
//     // setStatus("Connection lost. Please reconnect");
//     console.log("Connection lost. Please reconnect");

//     // Workaround for peer.reconnect deleting previous id
//     peer.id = lastPeerId;
//     peer._lastServerId = lastPeerId;
//     peer.reconnect();
//   });
//   peer.on("close", function () {
//     conn = null;
//     status.current.innerHTML = "Connection destroyed. Please refresh";
//     // setStatus("Connection destroyed. Please refresh");
//     console.log("Connection destroyed");
//   });
//   peer.on("error", function (err) {
//     console.log(err);
//     //alert("" + err);
//     Toast.fire({
//       icon: "warning",
//       title: "" + err,
//     });
//   });
// }
// ! -- End of Useless Code (Review Before deleting)

export default function SendComponent() {
  const [tab, setTab] = useState("OTP");
  const [files,setFiles] = useState([]);
  // const [status, setStatus] = useState("");
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
  const [isDarkMode, setIsDarkMode] = useRecoilState(darkModeAtom);
  const [myPeersState, setMyPeersState] = useState([]);
  const [qrScans, setQrScans] = useState([]);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  useEffect(() => {
    // initialize();
    setMyPeersState([new Peer()]);
  }, []);

  const addPeer = () => {
    if (
      document.getElementById(`input_box_${myPeersState.length - 1}`).value ==
      ""
    ) {
      //alert("Please fill in the peer id");
      Toast.fire({
        icon: "warning",
        title: "Please fill in the peer id",
      });
      return;
    }
    let peers = [...myPeersState];
    peers.push(new Peer());
    setMyPeersState(peers);
  };

  const removePeer = () => {
    if (myPeersState.length > 1) {
      let peers = [...myPeersState];
      peers.pop();
      setMyPeersState(peers);
    }
  };

  const doCleanUp = () => {
    setFiles([]);
    setMyPeersState([new Peer()]);
    document.getElementById(`input_box_${0}`).value = "";
  };

  const handleSend = () => {
    try {
      let inputs = [];
      for (let i = 0; i < myPeersState.length; i++) {
        let value = document.getElementById(`input_box_${i}`).value;
        if (value == "") {
          // alert("Missing IDs");
          Toast.fire({
            icon: "warning",
            title: "Missing IDs",
          });
          // doCleanUp();
          return;
        }
        inputs.push(value);
      }

      let myConnections = [];
      myPeersState.map((p, i) => {
        myConnections.push(
          p.connect(inputs[i], {
            reliable: true,
          })
        );
      });

      myConnections.map((conn) => {
        conn.on("open", () => {
          let allFiles = fileRef.current.files;
          var title = [];
          var total_file_size = 0;
          var total_files = allFiles.length;
          for (let i = 0; i < allFiles.length; i++) {
            title[i] = {
                data: allFiles[i],
                name: allFiles[i].name,
                type: allFiles[i].type,
                size: allFiles[i].size
            };
            total_file_size = total_file_size + allFiles[i].size;
        }
        console.log(total_file_size);
        if(allFiles.length>10){
          Swal.fire({
            title: `Selected more than 10 file`,
            icon:"info",
            text: `Select Less than 10 file`,
            allowOutsideClick: false,
            showCancelButton: true,
            confirmButtonText: `Ok`,
            confirmButtonColor: "#0ED073",
        })
        }else{
            conn.send({
              total_file_size,
              total_files,
              title,
            });
          }
        });
      });

      doCleanUp();
    } catch (e) {
      //alert("Wrong ID!");
      Toast.fire({
        icon: "warning",
        title: "Wrong ID!",
      });
      doCleanUp();
    }
  };

  const handleError = (e) => {
    console.log("Error:", e);
  };

  const handleScan = (s) => {
    let scans = [...qrScans];
    if (s !== null && scans.indexOf(s) === -1) {
      let beepSound = new Audio("audio1.mp3");
      beepSound.setAttribute("preload", "auto");
      beepSound.play();
      console.log("Scan:", s);
      scans.push(s);
      setQrScans(scans);
      document.getElementById(`input_box_${0}`).value = scans[0];
      for (let i = 1; i < scans.length; i++) {
        addPeer();
        document.getElementById(`input_box_${i}`).value = scans[i];
      }
    }
  };

  return (
    <>
      <Head>
        <title>Filora | Send Files</title>
        <script src="https://unpkg.com/peerjs@1.3.1/dist/peerjs.min.js"></script>
      </Head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
      <div className="dark:bg-darkBackground flex text-center min-h-screen ">
        <div className="flex flex-col items-center justify-items-center m-auto text-center bg-lightBlue">
          <div className="flex flex-col p-5 bg-green-300 rounded-md shadow-lg">
          <span className="animate__animated animate__zoomIn"><h1 className="text-4xl font-semibold mb-4 text-deepGreen ">Send Files</h1></span>
            <div className="flex flex-row">
              <div
                className={`w-1/2 py-5 text-lg cursor-pointer bg-primaryBlue ${
                  tab === "OTP" ? "" : "bg-opacity-50"
                }`}
                onClick={() => {
                  setTab("OTP");
                }}
              >
                Send Via OTP
              </div>
              <div
                className={`w-1/2 py-5 text-lg cursor-pointer bg-primaryBlue ${
                  tab === "QR" ? "" : "bg-opacity-50"
                }`}
                onClick={() => {
                  setTab("QR");
                }}
              >
                Send Via QR Code
              </div>
            </div>
            <div className="p-10 bg-primaryBlue">
              <div className={tab === "OTP" ? "block" : "hidden"}>
                <p className="font-bold">Enter OTP</p>
                <div className="flex flex-col">
                  {myPeersState.map((p, i) => {
                    return (
                        <input
                          key={i}
                          placeholder="Peer-ID"
                          className="py-4 px-10 m-2 focus:outline-none rounded shadow-md text-center"
                          type="number"
                          id={`input_box_${i}`}
                          minLength={6}
                          maxLength={6}
                        />
                    );
                  })}
                </div>
                <div className="flex flex-row text-center">
                  <div className="m-auto pt-5">
                    <button className="bg-lightBlue text-2xl rounded  px-6 py-1" onClick={() => addPeer()}>+</button>
                  </div>
                  <div className="m-auto pt-5">
                    <button className="bg-red text-2xl rounded px-6 py-1" onClick={() => removePeer()}>-</button>
                  </div>
                </div>
              </div>
      
              <div className={tab === "QR" ? "block" : "hidden"}>
              <div id="player"></div>
                <QrReader
                  delay={1000}
                  onError={handleError}
                  onScan={handleScan}
                  showViewFinder={true}
                  style={{ width: 300, height: 300 }}
                  showViewFinder={false}
                  className="m-auto"
                />
              </div>
            </div>
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
            <p ref={status} className="font-bold">
              Status:
            </p>
            <div className="flex flex-row my-6">
              <button
                onClick={() => handleSend()}
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
