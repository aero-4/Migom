import {JSX} from "react"

export default function NotFound(): JSX.Element {
    return (
        <>
            <div className="flex min-h-screen items-center justify-center">

                <div className="flex flex-col gap-4 p-6">
                    <h1 className="text-3xl helper-text animate-pulse">Увы... Похоже что такой страницы больше нет.</h1>

                    <a href="/"
                       className="big__button full__button">

                        <span className="text-white px-20">
                            Перейти на Главную
                        </span>
                    </a>
                </div>

            </div>
        </>
    );
}