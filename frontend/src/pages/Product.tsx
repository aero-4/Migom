import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import config from '../../config.ts';
import AddInCartBtn from '../components/Ui/AddInCartButton.tsx';

type ProductType = {
    id: number;
    name: string;
    content: string;
    composition: string;
    price: number;
    discount_price?: number | null;
    discount?: number | null;
    count: number;
    grams: number;
    protein: number;
    fats: number;
    carbohydrates: number;
    kilocalorie: number;
    photo?: string | null;
    category_id?: number | null;
};

const Product: React.FC = () => {
    const {id} = useParams();
    const product_id = id?.split('-').pop();

    const [product, setProduct] = useState<ProductType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!product_id) {
                setError('Неверный ID продукта');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${config.API_URL}/api/products/${product_id}`);
                if (!response.ok) {
                    throw new Error('Ошибка при загрузке данных продукта');
                }

                const data: ProductType = await response.json();
                setProduct(data);
            } catch (err: any) {
                setError(err.message || 'Неизвестная ошибка');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [product_id]);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!product) return <div>Продукт не найден</div>;

    return (
        <div className="card p-9 gap-12">
            <div className="flex flex-col md:flex-row gap-12">
                {product.photo && (
                    <img src={product.photo}
                         alt={product.name}
                         className="img"
                    />
                )}

                <div className="flex flex-col gap-12">
                    <div className="flex flex-col gap-9 my-auto">
                        <h1 className="text-2xl md:text-4xl font-bold">{product.name}</h1>

                        <p className="text-sm text-gray-800">{product.content}</p>


                    </div>

                    <div className="flex flex-row gap-3 text-center justify-center items-center">


                        <div className="flex flex-col">
                            {product.discount_price ? (
                                <p className="text-3xl font-bold ml-auto">
                                    {product.discount_price} ₽
                                </p>
                            ) : (
                                <p className="text-3xl font-bold ml-auto">
                                    {product.price} ₽
                                </p>
                            )}

                            <p className="text-sm text-gray-400">{product.grams} г</p>
                        </div>


                    </div>

                    <div className="text-center justify-center mx-auto">
                        <AddInCartBtn product={product}
                                      label="Добавить в корзину"/>
                    </div>
                </div>

            </div>

            <div className="flex flex-row gap-20 border-gray-400 ">
                <div className="min-w-1/3 rounded-xl">
                    <h3 className="text-sm text-gray-500 font-medium">Состав:</h3>
                    <p className="text-sm text-gray-700">
                        {product.composition}
                    </p>
                </div>

                <div className="min-w-1/3 flex flex-col rounded-xl">
                    <h3 className="text-sm text-gray-500 font-medium">В 100 граммах:</h3>
                    <p className="text-sm text-gray-700">
                        ккал: {product.kilocalorie} г
                    </p>
                    <p className="text-sm text-gray-700">
                        белки: {product.protein} г
                    </p>
                    <p className="text-sm text-gray-700">
                        жиры: {product.fats} г
                    </p>
                    <p className="text-sm text-gray-700">
                        углеводы: {product.carbohydrates} г
                    </p>
                </div>
            </div>


        </div>
    );
};

export default Product;
