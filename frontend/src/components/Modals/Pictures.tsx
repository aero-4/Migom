import React, { useState } from "react";

function Pictures({ product }) {
    const [isOpenPhoto, setIsOpenPhoto] = useState(false);

    return (
        <div>
            <img
                src={product.photo}
                alt={product.name}
                onClick={() => setIsOpenPhoto(true)}
                className="bg-gray-50 w-full min-w-[320px] max-h-[640px] rounded-3xl object-cover cursor-pointer transition-transform"
            />

            {isOpenPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black"
                    onClick={() => setIsOpenPhoto(false)}
                >
                    <img
                        src={product.photo}
                        alt={product.name}
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-[95%] max-h-[95vh] object-contain cursor-zoom-out transition-transform"
                    />
                </div>
            )}
        </div>
    );
}

export default Pictures;
