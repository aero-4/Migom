import React, {useState} from 'react';
import minusSvg from "../../assets/minus.svg";
import bottomSvg from "../../assets/bottom.svg";

export default function OpenButton({elements, title=null, className=""}) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <>
            <button className={`menu__button flex flex-row ${className}`}
                    onClick={() => setIsVisible(!isVisible)}>
                {title &&
                    (<h1 className="title">{title}</h1>)
                }

                <h1 className="lex flex-row">

                    {isVisible ? (
                        <img src={minusSvg} alt="Закрыть" className="w-5"/>
                    ) : (
                        <img src={bottomSvg} alt="Раскрыть" className="w-5"/>
                    )}
                </h1>
            </button>

            {isVisible && (
                <div className="flex flex-col gap-3 rounded-xl">
                    {elements}
                </div>
            )}
        </>
    );
}

