import Head from "next/head";
import Link from "next/link";
import Swal from "sweetalert2";
import otpGenerator from "otp-generator";
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { useRecoilState } from "recoil";
import React, { Fragment, useEffect,useState, useRef } from "react";
import { io } from "socket.io-client";
import { QR_GENERATE_API } from "../../utils/constants";
import { darkModeAtom } from "../../utils/store";
import { CopyIcon, Loading, ResetIcon } from "../../assets/icons";
import { sizeConverter } from "../../utils/functions";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { FaAngleDoubleDown } from "react-icons/fa";
import Push from "push.js";
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });
import dynamic from "next/dynamic";
let peer = null;
let conn = null;
import {
    SOCKET_URL,
    WELCOME,
    WELCOME_REPLY_RECEIVER,
    SENDER_SIGNAL_SOCKET_REPLY,
    RECEIVER_SIGNAL,
    COMPLETED,
    RECEIVER_JOINED,
  } from "../../components/constants";

// INFO: Function to play sound notifications
export const checkaud = (sound, recievesound) => {
    var sound = new Audio("audio.mp3");
    var recievesound = new Audio("audio1.mp3");
    if (sound.paused && recievesound.paused) {
        ("true");
    } else {
        ("false");
    }
};

// INFO: Function to generate OTP
export const getNumId = (id) => {
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

// INFO: Function to show download success/failure prompt
export const getprompt = (prompt) => {
    var prompt = Swal.fire({
        title: "Prompt Display",
    });
    if (prompt == Swal.isVisible()) {
        ("File downloaded!");
    } else {
        ("Download cancelled!");
    }
};

// INFO: Function to generate QR Code
export const getQRCode = async (txt) => {
    const img_src = await fetch(QR_GENERATE_API + txt);
    return img_src.url;
};


export default function ReceiveComponent() {
    const socketRef = useRef();
  const peerRef = useRef();
  const fileChunksRef = useRef([]);
    const [tab, setTab] = useState("OTP");
    const [currentOTP, setOTP] = useState('');
    const [myPeersState, setMyPeersState] = useState([]);
    const [qrScans, setQrScans] = useState([]);
    const [lastPeerId, setLast] = useState(null);
    const [peerId, setPeer] = useState(null);
    const [qrSrc, setQrSrc] = useState(null);
    const [isDarkMode, setIsDarkMode] = useRecoilState(darkModeAtom);
    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    useEffect(() => {
        // initialize();
        // setMyPeersState([new Peer()]);
        connectSocket();
    }, []);

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
//     async function initialize() {
//         console.log('%c\uD83D\uDE09 Filora!', 
//             'font-weight:bold; font-size:50px;color:red; ' +
//             'text-shadow:3px 3px 0 red,6px 6px 0 orange,9px 9px 0 yellow, ' +
//             '12px 12px 0 green,15px 15px 0 blue,18px 18px 0 indigo,21px 21px 0 violet');
//             navigator.serviceWorker.register('sw.js');
//             let per = Push.Permission.get();
//             if(per === "default"){
//                 Swal.fire({
//                     icon: 'info',
//                     title: 'Allow Notification',
//                     text: 'Allow permission to get notify when file downloaded',
//                     allowOutsideClick: false,
//                     showDenyButton: true,
//                     showCancelButton: false,
//                     confirmButtonText: `Allow`,
//                     denyButtonText: `Don't Allow`,
//                   }).then((result) => {
//                     /* Read more about isConfirmed, isDenied below */
//                     if (result.isConfirmed) {
//                         Notification.requestPermission().then(function (permission) {
//                             // If the user accepts, let's create a notification
//                             if (permission === "granted") {
//                             console.log(permission);
//                             Swal.fire({
//                                 icon: 'success',
//                                 title: 'Notification Allowed',
//                                 text: 'Set Permission Allowed Succesfuly',
//                                 allowOutsideClick: false,
//                                 showCloseButton: true,
//                               });
//                             }
//                             else if(permission==="denied"){
//                                 console.log(permission);
//                                 Swal.fire({
//                                     icon: 'info',
//                                     title: 'Allow Notification',
//                                     text: 'Permission not Allowed or blocked',
//                                     allowOutsideClick: false,
//                                     showCloseButton: true,
//                                   });
//                             }
//                             else{
//                                 console.log(permission);
//                                 console.log("Permission cancel");
//                             }
//                           });
//                     } else if (result.isDenied) {
//                         Notification.requestPermission().then(function (permission) {
//                             // If the user accepts, let's create a notification
//                             if (permission === "granted") {
//                             console.log(permission);
//                             Swal.fire({
//                                 icon: 'success',
//                                 title: 'Notification Allowed',
//                                 text: 'Set Permission Allowed Succesfuly',
//                                 allowOutsideClick: false,
//                                 showCloseButton: true,
//                               });
//                             }
//                             else if(permission==="denied"){
//                                 console.log(permission);
//                                 Swal.fire({
//                                     icon: 'info',
//                                     title: 'Allow Notification',
//                                     text: 'Permission not Allowed or blocked',
//                                     allowOutsideClick: false,
//                                     showCloseButton: true,
//                                   });
//                             }
//                             else{
//                                 console.log(permission);
//                                 console.log("Permission cancel");
//                             }
//                           });
//                     }
//                   });
//             }
//             else{
//                 console.log("Permission already granted or block");
//             }
//         var beepsound = new Audio("audio.mp3");
//         beepsound.setAttribute("preload", "auto");
//         var connec = otpGenerator.generate(6, {
//             digits: true,
//             alphabets: false,
//             upperCase: false,
//             specialChars: false,
//         });
//         let qr_src = await getQRCode(connec);
//         setQrSrc(qr_src);
//         peer = new Peer(connec);
//         peer.on("open", function (id) {
//             beepsound.play();
//             if (peer.id === null) {
//                 console.log("Received null id from peer open");
//                 peer.id = lastPeerId;
//             } else {
//                 setLast(peer.id);
//             }

//             console.log("ID: " + peer.id);
//             setPeer(peer.id);
//         });

//         peer.on("connection", function (c) {
//             if (conn && conn.open) {
//                 c.on("open", function () {
//                     c.send("Already connected to another client");
//                     setTimeout(function () {
//                         c.close();
//                     }, 500);
//                 });
//                 return;
//             }
//             conn = c;
//             console.log("Connected to: " + conn.peer);
//             var recieveFile = new Audio("audio1.mp3");
//             recieveFile.setAttribute("preload", "auto");
//             recieveFile.play();
//             let el = document.getElementById("status");
//             document.getElementById("status").innerText =
//                 "Connected to peer successfully!";
//         if(el.innerHTML==="Connected to peer successfully!"){
//             let valu = document.getElementById("scroll-down");
//                 document.getElementById("scroll-down").style.display = "block";
//                 setTimeout(function(){  valu.remove();}, 5000);
                
//              }else{
//                 document.getElementById("scroll-down").style.display = "none";
//              }
//         if(el.innerHTML==="Connected to peer successfully!"){
//                document.getElementById("loader-iu").style.display = "block";
//         }
//         else{
//             document.getElementById("loader-iu").style.display = "none";
//         }
//             document.getElementById("connection_status").innerHTML = " ";
//             ready();
//         });

//         peer.on("disconnected", function () {
//             console.log("Connection lost. Please reconnect");
//             Toast.fire({
//                 icon: "warning",
//                 title: "Connection Lost. Please reconnect",
//             });
//             peer.id = lastPeerId;
//             peer._lastServerId = lastPeerId;
//             peer.reconnect();
//         });

//         peer.on("close", function () {
//             conn = null;
//             Toast.fire({
//                 icon: "warning",
//                 title: "Connection destroyed. Please refresh",
//             });
//             console.log("Connection destroyed");
//         });
//         peer.on("error", function (err) {
//             console.log(err);
//             Toast.fire({
//                 icon: "warning",
//                 title: "" + err,
//             });
//         });

//         //! NEW CODEBASE

//   let myConnections = [];
//   let inputs = [];
//   myPeersState.map((p, i) => {
//     myConnections.push(
//       p.connect(inputs[i], {
//         reliable: true,
//       })
//     );
//   });

// // ! END OF NEW CODEBASE

//     }

    const ready = () => {
        conn.on("data", function (data) {
            if(data!=null || data!=""){
                document.getElementById("loader-iu").style.display = "none";
                document.getElementById("button_1").style.display = "block";
                navigator.serviceWorker.ready.then(function(registration) {
                        var option = {
                        body: data.total_files+' '+'Files Downloaded Successfully!',
                        icon: '/android-chrome-192x192.png',
                        tag: 'Filora notify',
                        badge: '/android-chrome-192x192.png',
                        vibrate: [200, 100, 200, 100, 200, 100, 200],
                        requireInteraction: true,
                        actions: [
                            {
                              action: 'show',
                              title: '✔ OPEN'
                            }
                          ],
                      };
                      registration.showNotification('Filora', option);
                  });
            }

            console.log(data);
            let text = "<ul id='ul-Li' class='animate__animated animate__fadeIn animate__slow'>";
            for (let i = 0; i < data.total_files; i++) {
            console.table([data.title[i]]);
            text += "<li style='padding:10px;font-weight:bold;' id='remove_"+i+"'>"+data.title[i].name+"<br>"+"<button style='color:white; font-size:15px; cursor:pointer; background-color:#d14529; padding:5px; border-radius:5px;' class='cancel'>"+"remove"+"</button>"+"  "+"<button class='ok' style='color:white; font-size:15px; cursor:pointer; background-color:green; padding:5px; border-radius:5px;'>"+"download"+"</button>"+"</li>";
        };
         text += "</ul>";
         document.getElementById("demo").innerHTML = text;
        
         [...document.querySelectorAll('.ok')].forEach(function(item,i) {
            item.addEventListener('click', function() {
               forwad(data.title[i].data,data.title[i].name,data.title[i].size,i);
            });
             });
             [...document.querySelectorAll('.cancel')].forEach(function(item,i) {
                item.addEventListener('click', function() {
                  remove(data.title[i].name,data.title[i].size,i);
                });
                 });    
        const forwad = (data,name,size,i) => {
            Swal.fire({
               title: `Are you sure you want to download?\n`,
               text: `File Name: ${name}`,
               footer: `Size: ${sizeConverter(size)}`,
               allowOutsideClick: false,
               showDenyButton: true,
               showCancelButton: false,
               confirmButtonText: `Accept`,
               confirmButtonColor: "#0ED073",
               denyButtonText: `Deny`,
           }).then((result) => {
               if (result.isConfirmed) {
                   createAndDownloadBlobFile(data,name);
                   var myobj = document.getElementById("remove_"+i+"");
                    myobj.setAttribute("class", "animate__animated animate__backOutRight animate__slow"); 
                    setTimeout(function(){  myobj.remove(); if(document.getElementById("ul-Li").innerHTML.trim() == ""){
                        document.getElementById("button_1").style.display = "none";
                    }}, 1000);
                   } else if (result.isDenied) {
                   return false;
               }
           });
       };

        const remove = (name,size,i) => {
            Swal.fire({
                title: `Are you sure you want to remove from download?\n`,
                text: `File Name: ${name}`,
                footer: `Size: ${sizeConverter(size)}`,
                allowOutsideClick: false,
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Yes`,
                confirmButtonColor: "#0ED073",
                denyButtonText: `No`,
            }).then((result) => {
                if (result.isConfirmed) {
                    var myobj = document.getElementById("remove_"+i+"");
                    myobj.setAttribute("class", "animate__animated animate__backOutLeft animate__slow"); 
                    setTimeout(function(){  myobj.remove(); if(document.getElementById("ul-Li").innerHTML.trim() == ""){
                        document.getElementById("button_1").style.display = "none";
                    }}, 1000);
                    } else if (result.isDenied) {
                    return false;
                }
            });
        };

           window.val =  data.total_files;
           window.p2 = Object.assign({}, data);
            //SaveAll(data,data.total_files);
                /*Swal.fire({
                title: `Are you sure you want to download?\n`,
                text: `File Name: ${data.title.name}`,
                footer: `Size: ${sizeConverter(data.title.size)}`,
                allowOutsideClick: false,
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: `Accept`,
                confirmButtonColor: "#0ED073",
                denyButtonText: `Deny`,
            }).then((result) => {
                if (result.isConfirmed) {
                    createAndDownloadBlobFile(data.title[i].data, data.title[i].name);
                    Swal.fire({
                        title: `Downloading file in progress`,
                        text: `File Name: ${data.name}`,
                        footer: `Size: ${sizeConverter(data.size)}`,
                        showCloseButton: true,
                        showCancelButton: false,
                        confirmButtonText: `Save`,
                        didOpen: () => {
                            Swal.showLoading();
                          }
                        });
                    } else if (result.isDenied) {
                    return false;
                }
            });*/
        });

        conn.on("close", function () {
            document.getElementById("connection_status").innerHTML =
                "Sender connection was reset!";
            document.getElementById("status").innerHTML =
                "Share it with your friend to receive files";
            conn = null;
        });
    }

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

    // INFO: Function to create and download a blob file
    const createAndDownloadBlobFile = (body,filename) => {
        const blob = new Blob([body]);
        const fileName = `${filename}`;
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, fileName);
        } else {
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", fileName);
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    // ! NEW CODEBASE

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
    
      const handleError = (e) => {
        console.log("Error:", e);
      };

    // ! END OF NEWCODEBASE

    const SaveAll =  (data,filess) => {
            for(let i = 0;i<filess;i++){
                createAndDownloadBlobFile(data.title[i].data, data.title[i].name);
               }
     }

    const handleChange = (event) => {
      console.log(event.target.value);
      setOTP(event.target.value);
    }
    return (
        <>
            <div className="dark:bg-darkBackground flex h-screen">
                <Head>
                    <script defer src="https://unpkg.com/peerjs@1.3.1/dist/peerjs.min.js"></script>
                    <title>Filora | Receive Files</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
                </Head>
                <div className="flex flex-col items-center justify-items-center m-auto text-center bg-lightBlue">                   
                 <div className="flex flex-col p-6 bg-lightBlue rounded-md shadow-lg w-full">

                        <p className="text-deepGreen text-4xl font-semibold" id="receiver-id">
                            Receive Files
                        </p>

                        <div className="flex flex-row">
              <div
                className={`w-1/2 h-1/2 py-5 text-md cursor-pointer bg-primaryBlue ${
                  tab === "OTP" ? "" : "bg-opacity-50"
                }`}
                onClick={() => {
                  setTab("OTP");
                }}
              >
                Send Via OTP
              </div>
              <div
                className={`w-1/2 h-1/2 py-5 text-md cursor-pointer bg-primaryBlue ${
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
                <input
                          name = "OTP"
                          onChange = {handleChange}
                          placeholder="Peer-ID"
                          className="py-4 px-10 m-2 focus:outline-none rounded shadow-md text-center"
                          type="number"
                          minLength={6}
                          maxLength={6}
                        />
                </div>
                {/* <div className="flex flex-col">
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
                </div> */}
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
                  showViewFinder={false}
                  style={{ width: 300, height: 300 }}
                  // showViewFinder={false}
                  className="m-auto"
                />
              </div>
            </div>


                        <p className="font-bold my-2 text-black" id="status">
                            
                        </p>

                        <p className="font-medium text-sm my-1" id="connection_status"></p>

                        <div className="flex justify-center">
                            <button className="bg-red text-2xl w-4/5 my-4 lg:w-2/5 p-2 focus:outline-none rounded-md shadow-md">
                                <Link href="/">
                                    <a>Back</a>
                                </Link>
                            </button><span className="animate__animated animate__bounce animate__infinite" id="scroll-down"><FaAngleDoubleDown/></span>
                        </div>
                        <button onClick={() => SaveAll(p2,val)} id="button_1">Download All</button>
                       <p id="demo"></p>
                       <div id="loader-iu">
                       <br></br>
                        <SkeletonTheme color="#d3d3d3" highlightColor="silver">
                        <Skeleton />
                        <Skeleton />
                        <Skeleton width={70} height={20}/> <Skeleton width={70} height={20} />
                        <br></br>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton width={70} height={20}/> <Skeleton width={70} height={20} />
                        <br></br>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton width={70} height={20}/> <Skeleton width={70} height={20} />
                        <br></br>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton width={70} height={20}/> <Skeleton width={70} height={20} />
                        <br></br>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton width={70} height={20}/> <Skeleton width={70} height={20} />
                        </SkeletonTheme>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 left-6">
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