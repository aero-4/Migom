import React, {JSX} from "react";

import fishJpeg from "../../assets/image_test.jpg";
import teaPng from "../../assets/tea.png"
import milkPng from "../../assets/milk.png"
import fruitsPng from "../../assets/fruits_orange.png"
import meatPng from "../../assets/meat.png"

export default function Categories(): JSX.Element {

    const categories = [
        {name: "Осень пришла!", url: "fruits", photo: fruitsPng},
        {name: "Рыба", url: "fish", photo: fishJpeg},
        {name: "Мясо", url: "meat", photo: meatPng},
        {name: "Молочные изделия", url: "milk", photo: milkPng},
        {name: "Теплый вечер", url: "tea", photo: teaPng},
        {name: "Теплый вечер", url: "tea", photo: teaPng},
        {name: "Теплый вечер", url: "tea", photo: teaPng},
        {name: "Теплый вечер", url: "tea", photo: teaPng},
        {name: "Теплый вечер", url: "tea", photo: teaPng},
        {name: "Осень пришла!", url: "fruits", photo: fruitsPng},
        {name: "Рыба", url: "fish", photo: fishJpeg},
        {name: "Мясо", url: "meat", photo: meatPng},
        {name: "Молочные изделия", url: "milk", photo: milkPng},
        {name: "Теплый вечер", url: "tea", photo: teaPng},

    ]

    return (
        <>
            <div className="flex flex-wrap gap-6 items-center justify-center bg-white p-3 rounded-xl">
                {categories.map((category, idx) => (
                    <a href={`/category/${category.url}`}
                       className="flex flex-col"
                       key={`cat-${idx}`}>
                        <img src={category.photo} alt="" className="borer-1 rounded-2xl w-32 h-32 object-cover bg-gray-100 hover:font-stretch-50%"/>
                        <span className="font-medium text-2xs text-gray text-center estra">{category.name}</span>
                    </a>
                ))}

            </div>
        </>
    );
}