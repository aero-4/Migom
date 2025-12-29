# Migom — Online Restaurant and Product Delivery

Migom — веб-приложение для онлайн-заказа еды и доставки продуктов. Проект разделён на backend и frontend части и запускается в контейнерах как сервисы через Docker Compose.

## Репозитории

Backend:
[https://github.com/aero-4/Migom/tree/main/backend](https://github.com/aero-4/Migom/tree/main/backend)

Frontend:
[https://github.com/aero-4/Migom/tree/main/frontend](https://github.com/aero-4/Migom/tree/main/frontend)

## Структура проекта

Проект имеет следующую структуру:

* `backend/` — серверная часть (API, бизнес-логика, база данных)
* `frontend/` — клиентская часть (веб-интерфейс)
* `docker-compose.yml` — конфигурация для запуска всех сервисов

## Требования

Перед запуском убедитесь, что установлены:

* Docker
* Docker Compose

Проверка:

```
docker --version
docker-compose --version
```

## Запуск проекта через Docker Compose

### 1. Клонировать репозиторий

```
git clone https://github.com/aero-4/Migom.git
cd Migom
```

### 2. Сборка контейнеров

```
docker-compose build
```

Эта команда:

* соберёт образы backend и frontend,
* установит все зависимости,
* подготовит окружение для запуска.

### 3. Запуск контейнеров

```
docker-compose up
```

Для запуска в фоновом режиме:

```
docker-compose up -d
```

### 4. Остановка контейнеров

```
docker-compose down
```

## Доступ к приложению

После успешного запуска:

* Frontend: `http://localhost:3000` (или другой порт, указанный в `docker-compose.yml`)
* Backend API: `http://localhost:8000` (или соответствующий порт)

Точные порты можно посмотреть в файле `docker-compose.yml`.

