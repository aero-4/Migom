import closeSvg from "../../assets/close.svg";

function CloseButton({close}) {
    return (
        <button
            type="button"
            onClick={close}
            aria-label="Закрыть корзину"
            className="p-4 h-12 w-12 ml-auto rounded-md hover:bg-gray-100 focus:outline-none "
        >
            <img src={closeSvg} alt=""/>
        </button>
    );
}

export default CloseButton;