import abc


class IPasswordHasher(abc.ABC):

    @abc.abstractmethod
    def hash(self, password: str) -> str: ...

    @abc.abstractmethod
    def verify(self, plain_password: str, password_hasher: str) -> bool: ...
