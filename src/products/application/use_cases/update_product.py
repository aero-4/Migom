from src.products.infrasctructure.db.unit_of_work import PGProductUnitOfWork
from src.products.presentation.dtos import ProductUpdateDTO


async def update_product(id: int, product: ProductUpdateDTO, uow: PGProductUnitOfWork):
    async with uow:
        product = await uow.products.update(product.to_entity(id))
        await uow.commit()
    return product
