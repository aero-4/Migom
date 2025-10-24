import React, {JSX} from "react"

import loaderSvg from "../../assets/loader.svg"



export default function Loader(): JSX.Element {
    return (
        <>
            <div className="flex min-h-screen justify-center my-auto items-center z-99 w-screen h-screen">
                <img src={loaderSvg} alt="" width={100}/>
            </div>
        </>
    );
}