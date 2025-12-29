#### Stack Backend: Python 3.12, FastAPI, SQLAlchemy, Redis, Pydantic, PostgresSQL, Pytest, Prometheus, Docker, Docker Compose.

### Реализованные сервисы:

- addresses - (создание адресов для заказов)
- auth - (JWT авторизация пользователей, авторизация, регистрация, логаут, рефреш access токена)
- categories - (CRUD категорий)
- files - (работа с загрузкой файлов на s3 хранилище)
- orders - (CRUD заказов)
- payments - (создание оплат, получение оплаты)
- products - (CRUD товаров, поиск товаров)
- users (работа с пользователями, вывод информации о себе, смена пароля)
- admin (CRUD-операции со всеми сущностями базы данных)

#### Тесты:
Тесты находятся в папке tests

Unit Tests - tests/unit
Integration Tests - tests/integration
Functional Tests - tests/funtional

Запуск тестов осуществляется через 
```pytest tests```


#### Запуск:
Запуск бекенда осуществляется через команду
```uvicorn src:app --reload```

или через main.py
```python main.py```