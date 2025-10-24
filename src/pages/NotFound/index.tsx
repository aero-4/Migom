import {JSX} from "react"
import notFound from "../../assets/error-404.png"

export default function NotFound(): JSX.Element {
    return (
        <>
            <div className="flex flex-col gap-4 p-4
            lg:flex-row">
                <div className="justify-center items-center my-auto">
                    <img src={notFound} alt="not-found"/>
                </div>

                <div className="flex flex-col gap-9">
                    <h1 className="text-3xl">404</h1>
                    <h1 className="text-2xl">Похоже что такой страницы больше нет...</h1>
                    <a href="/"
                       className="big__button">
                        Перейти на Главную {'>'}
                    </a>
                </div>

            </div>
        </>
    );
}