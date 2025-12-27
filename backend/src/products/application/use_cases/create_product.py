from src.products.domain.entities import ProductCreate, Product
from src.products.presentation.dependencies import ProductUoWDep
from src.products.presentation.dtos import ProductCreateDTO
from src.utils.integers import calculate_discount


async def create_product(product: ProductCreateDTO, uow: ProductUoWDep) -> Product:
    product_data = ProductCreate(**product.model_dump())
    product_data.discount_price = calculate_discount(product_data.price, product_data.discount) if product_data.discount_price is None and product.discount and product_data.price else None

    async with uow:
        product = await uow.products.add(product_data)
        await uow.commit()

    return product
