import abc

from src.users.domain.entities import UserCreate, User, UserUpdate


class IUserRepository(abc.ABC):

    @abc.abstractmethod
    def add(self, user: UserCreate) -> User:
        ...

    @abc.abstractmethod
    def get_by_email(self, email: str) -> User:
        ...

    @abc.abstractmethod
    def get_by_id(self, id: int) -> User:
        ...

    @abc.abstractmethod
    def delete(self, id: int) -> bool:
        ...

    @abc.abstractmethod
    def update(self, user_data: UserUpdate) -> User:
        ...
