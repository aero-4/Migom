import React, {JSX} from "react"



export default function Loader({size = 10}): JSX.Element {
    return (
        <>
            <div className="flex min-h-screen justify-center my-auto items-center z-50 w-screen h-screen">
                <span className={`p-${size} rounded-full animate-spin border-4 border-red-500 border-t-transparent`}>
                </span>
            </div>
        </>
    );
}