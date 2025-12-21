import logging
from typing import List

from sqlalchemy import select, desc, or_, and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.addresses.domain.entities import Address
from src.core.domain.exceptions import AlreadyExists, NotFound
from src.orders.domain.entities import OrderCreate, Order, OrderUpdate, OrderStatus
from src.orders.domain.interfaces.order_repo import IOrderRepository
from src.orders.infrastructure.db.orm import OrdersOrm, OrderProductsOrm
from src.products.domain.entities import Product
from src.products.infrasctructure.db.orm import ProductsOrm


class PGOrdersRepository(IOrderRepository):

    def __init__(self, session: AsyncSession):
        super().__init__()
        self.session = session

    async def add(self, order_data: OrderCreate) -> Order:
        obj: OrdersOrm = OrdersOrm(**order_data.model_dump(exclude={"products"}))
        self.session.add(obj)

        try:
            await self.session.flush()
        except IntegrityError:
            raise AlreadyExists()

        await self._add_links(order_data, obj)

        stmt = (
            select(OrdersOrm)
            .options(
                selectinload(OrdersOrm.product_links)
                .selectinload(OrderProductsOrm.product)
            )
            .where(OrdersOrm.id == obj.id)
        )
        result = await self.session.execute(stmt)
        order_data: OrdersOrm = result.scalar_one_or_none()
        if not order_data:
            raise NotFound()

        return self._to_entity(order_data)

    async def _add_links(self, order_data: OrderCreate, obj: OrdersOrm):
        product_ids = [item.product_id for item in order_data.products]
        stmt = select(ProductsOrm).where(ProductsOrm.id.in_(product_ids))
        result = await self.session.execute(stmt)
        products: List[ProductsOrm] = result.scalars().all()

        links: List[OrderProductsOrm] = []
        total_amount: int = 0

        for item in order_data.products:
            product = next((p for p in products if p.id == item.product_id), None)

            if not product:
                raise NotFound(detail=f"Product with id {item.product_id} not found")

            link = OrderProductsOrm(
                order_id=obj.id,
                product_id=product.id,
                quantity=item.quantity,
                amount=product.price
            )
            links.append(link)
            total_amount += item.quantity * product.discount_price if product.discount_price else item.quantity * product.price

        self.session.add_all(links)

        obj.amount = total_amount
        self.session.add(obj)

        try:
            await self.session.flush()
        except Exception as ex:
            raise AlreadyExists() from ex

    async def get(self, id: int) -> Order:
        stmt = (
            select(OrdersOrm)
            .options(
                selectinload(OrdersOrm.product_links)
                .selectinload(OrderProductsOrm.product)
            )
            .where(OrdersOrm.id == id)
        )
        result = await self.session.execute(stmt)
        obj = result.scalar_one_or_none()
        if not obj:
            raise NotFound()
        return self._to_entity(obj)

    async def get_current(self, user_id: int) -> Order:
        stmt = (
            select(OrdersOrm)
            .options(
                selectinload(OrdersOrm.product_links)
                .selectinload(OrderProductsOrm.product)
            )
            .where(or_(OrdersOrm.courier_id == user_id,
                       OrdersOrm.cook_id == user_id),
                   and_(
                       OrdersOrm.status.notin_([OrderStatus.CREATED, OrderStatus.SUCCESS])
                   ))
        )
        result = await self.session.execute(stmt)
        obj = result.scalar_one_or_none()
        if not obj:
            raise NotFound()
        return self._to_entity(obj)

    async def get_all(self, user_id: int) -> list[Order]:
        stmt = (
            select(OrdersOrm)
            .options(
                selectinload(OrdersOrm.product_links)
                .selectinload(OrderProductsOrm.product)
            )
            .where(OrdersOrm.creator_id == user_id)
            .order_by(desc(OrdersOrm.created_at))
        )

        result = await self.session.execute(stmt)
        objs: list[OrdersOrm] = result.scalars().all()

        return [self._to_entity(obj) for obj in objs]

    async def delete(self, id: int) -> None:
        stmt = select(OrdersOrm).where(OrdersOrm.id == id)
        result = await self.session.execute(stmt)
        obj: OrdersOrm | None = result.scalar_one_or_none()

        if not obj:
            raise NotFound()

        await self.session.delete(obj)
        await self.session.flush()

    async def update(self, order_data: OrderUpdate) -> Order:
        stmt = select(OrdersOrm).where(OrdersOrm.id == order_data.id)
        result = await self.session.execute(stmt)
        obj: OrdersOrm | None = result.scalar_one_or_none()

        if not obj:
            raise NotFound()

        order_data.status = OrderStatus(order_data.status) if order_data.status else None

        for key, value in order_data.model_dump(exclude_none=True).items():
            setattr(obj, key, value)

        await self.session.flush()

        result = await self.session.execute(
            select(OrdersOrm)
            .options(
                selectinload(OrdersOrm.product_links)
                .selectinload(OrderProductsOrm.product)
            )
            .where(OrdersOrm.id == obj.id)
        )
        result = result.scalar_one()

        return self._to_entity(result)

    async def filter(self, status: list[str]) -> List[Order]:
        statuses = [OrderStatus(s) for s in status]
        stmt = select(OrdersOrm).filter(OrdersOrm.status.in_(statuses))
        result = await self.session.execute(stmt)
        objs: List[OrdersOrm] = result.scalars().all()

        return [self._to_entity(o) for o in objs]

    @staticmethod
    def _to_entity(order_data: OrdersOrm) -> Order:
        products_data = []

        for link in order_data.product_links:
            product = link.product
            products_data.append(Product(
                id=product.id,
                created_at=product.created_at,
                updated_at=product.updated_at,
                name=product.name,
                content=product.content,
                composition=product.composition,
                price=product.price,
                discount_price=product.discount_price,
                discount=product.discount,
                count=product.count,
                kilocalorie=product.kilocalorie,
                grams=product.grams,
                protein=product.protein,
                fats=product.fats,
                carbohydrates=product.carbohydrates,
                photo=product.photo,
                category_id=product.category_id,
                quantity=link.quantity
            ).model_dump(mode="json"))

        return Order(
            id=order_data.id,
            creator_id=order_data.creator_id,
            created_at=order_data.created_at,
            update_at=order_data.updated_at,
            products=products_data,
            status=order_data.status,

            address=Address(
                city=order_data.address.city,
                street=order_data.address.street,
                house_number=order_data.address.house_number,
                entrance=order_data.address.entrance,
                floor=order_data.address.floor,
                apartment_number=order_data.address.apartment_number,
                comment=order_data.address.comment,
                is_leave_at_door=order_data.address.is_leave_at_door,
            ).model_dump(mode="json"),

            courier_id=order_data.courier_id,
            cook_id=order_data.cook_id,

            amount=order_data.amount
        )
