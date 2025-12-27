from src.products.infrasctructure.db.unit_of_work import PGProductUnitOfWork
from src.products.presentation.dtos import ProductUpdateDTO
from src.utils.integers import calculate_discount


async def update_product(id: int, product: ProductUpdateDTO, uow: PGProductUnitOfWork):
    product.discount_price = calculate_discount(product.price, product.discount) if not product.discount_price and product.discount and product.price else None

    async with uow:
        product = await uow.products.update(product.to_entity(id))
        await uow.commit()
    return product
