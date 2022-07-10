import React from "react";
import Head from "next/head";
import Link from "next/link";
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { useRecoilState } from "recoil";

import { HeroLogo, HeroLogoMobile } from "../../assets/ui";
import { SendIcon, ReceiveIcon, InfoIcon } from "../../assets/icons";
import { darkModeAtom } from "../../utils/store";

export default function HomeComponent() {
    const [isDarkMode, setIsDarkMode] = useRecoilState(darkModeAtom);
    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
    console.log('%c\uD83D\uDE09 Filora!', 
    'font-weight:bold; font-size:50px;color:red; ' +
    'text-shadow:3px 3px 0 red,6px 6px 0 orange,9px 9px 0 yellow, ' +
    '12px 12px 0 green,15px 15px 0 blue,18px 18px 0 indigo,21px 21px 0 violet');
    return (
        <>
            <Head>
                <title>Filora | File Share</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
            </Head>

            <div className="dark:bg-darkBackground flex flex-col items-center h-screen">
                <div className="hidden lg:flex flex-col items-center justify-center mx-auto w-2/3 mt-24">
                    <HeroLogo />
                </div>
                <div className="flex lg:hidden flex-col items-center justify-center mx-auto w-2/3 mt-36">
                <span className="animate__animated animate__lightSpeedInLeft"><HeroLogoMobile /></span>
                </div>

                <div className="flex flex-col items-center justify-center my-10 lg:my-4">
                    <div className="grid grid-cols-2 gap-3 lg:gap-10 my-4 px-2 text-center">
                    
                        <a href="/send" className=" animate__animated animate__zoomIn" >
                            <div className="flex flex-col items-center justify-center bg-primaryGreen hover:opacity-80 focus:outline-none text-3xl m-0 lg:m-4 p-2 lg:p-4 rounded-2xl w-full">
                                <SendIcon />
                                <div className="bg-white w-full rounded-l-full rounded-r-full my-3 py-2 shadow-md">
                                    <p className="text-black w-full font-medium text-lg lg:text-xl px-12">Send</p>
                                </div>
                            </div>
                        </a>

                        <Link href="/receive">
                            <a className=" animate__animated animate__zoomIn">
                                <div className="flex flex-col items-center justify-center bg-primaryBlue hover:opacity-80 focus:outline-none text-3xl m-0 lg:m-4 p-2 lg:p-4 rounded-2xl w-full">
                                    <ReceiveIcon />
                                    <div className="bg-white w-full rounded-l-full rounded-r-full my-3 py-2 shadow-md">
                                        <p className="text-black w-full font-medium text-lg lg:text-xl px-12">Receive</p>
                                    </div>
                                </div>
                            </a>
                        </Link>
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