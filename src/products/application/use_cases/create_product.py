from src.products.domain.entities import ProductCreate, Product
from src.products.presentation.dependencies import ProductUoWDep
from src.products.presentation.dtos import ProductCreateDTO


async def create_product(product: ProductCreateDTO, uow: ProductUoWDep) -> Product:
    product_data = ProductCreate(**product.model_dump())

    async with uow:
        product = await uow.products.add(product_data)
        await uow.commit()

    return product
