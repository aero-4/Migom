import bcrypt

from src.users.domain.interfaces.password_hasher import IPasswordHasher


class BcryptPasswordHasher(IPasswordHasher):
    encode = "utf-8"

    def hash(self, password: str) -> str:
        pwd_bytes: bytes = password.encode(self.encode)
        salt = bcrypt.gensalt()
        hashed_pwd = bcrypt.hashpw(pwd_bytes, salt)
        return hashed_pwd.decode(self.encode)

    def verify(self, plain_password: str, password_hashed: str) -> bool:
        return bcrypt.checkpw(plain_password.encode(self.encode), password_hashed.encode(self.encode))
