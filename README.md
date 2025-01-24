# RestLibrary-Api

**RESTful API и Python-клиент для управления библиотекой книг**

## Оглавление

- [Описание](#описание)
- [Технологии](#технологии)
- [Структура проекта](#структура-проекта)
- [Установка и запуск](#установка-и-запуск)
  - [Часть 1: Настройка и запуск API-сервера](#часть-1-настройка-и-запуск-api-сервера)
  - [Часть 2: Настройка и запуск Python-приложения](#часть-2-настройка-и-запуск-python-приложения)
- [Использование](#использование)
  - [API-сервер](#api-сервер)
  - [Python-приложение](#python-приложение)
- [Тестирование](#тестирование)
- [Разработка](#разработка)
- [Вклад](#вклад)
- [Лицензия](#лицензия)
- [Контакты](#контакты)

## Описание

RestLibrary-Api представляет собой RESTful API, разработанный на Node.js и Express, для управления библиотекой книг. В комплекте с API поставляется Python-приложение с графическим интерфейсом, созданное с использованием PyQt5, которое позволяет пользователям взаимодействовать с библиотекой через удобный и современный интерфейс.

## Технологии

### Backend

- **Node.js**: JavaScript runtime для серверной разработки.
- **Express**: Веб-фреймворк для Node.js.
- **fs-extra**: Расширение стандартного модуля `fs` для работы с файловой системой.
- **UUID**: Генерация уникальных идентификаторов.
- **Jest**: Тестирование JavaScript-кода.
- **Supertest**: Тестирование HTTP-серверов.

### Frontend

- **Python 3**: Язык программирования для создания клиентского приложения.
- **PyQt5**: Библиотека для создания графического интерфейса.
- **Requests**: Библиотека для HTTP-запросов.

## Структура проекта

```
RestLibrary-Api/
├── data.json
├── package.json
├── index.js
├── routes/
│   └── books.js
├── tests/
│   └── books.test.js
├── PythonClient/
│   ├── app.py
│   └── requirements.txt
├── .gitignore
└── README.md
```

- **data.json**: Файл для хранения данных о книгах.
- **package.json**: Файл зависимостей и скриптов для Node.js.
- **index.js**: Главный файл API-сервера.
- **routes/**: Директория с маршрутизаторами API.
- **tests/**: Директория с тестами для API.
- **PythonClient/**: Директория с Python-приложением.
  - **app.py**: Основной файл Python-клиента.
  - **requirements.txt**: Список зависимостей Python-приложения.
- **.gitignore**: Файл для исключения определённых файлов и папок из репозитория Git.
- **README.md**: Документация проекта.

## Установка и запуск

### Часть 1: Настройка и запуск API-сервера

1. **Клонируйте репозиторий:**

    ```bash
    git clone https://github.com/nitos200021/RestLibrary-Api.git
    cd RestLibrary-Api
    ```

2. **Установите зависимости:**

    Убедитесь, что у вас установлен [Node.js](https://nodejs.org/). Затем выполните:

    ```bash
    npm install
    ```

3. **Запустите сервер:**

    ```bash
    npm start
    ```

    Сервер будет доступен по адресу [http://localhost:3000/books](http://localhost:3000/books)

4. **(Опционально) Запуск сервера с использованием PM2:**

    Для обеспечения постоянной работы сервера и автоматического перезапуска при сбоях рекомендуется использовать [PM2](https://pm2.keymetrics.io/).

    - **Установите PM2 глобально:**

        ```bash
        sudo npm install -g pm2
        ```

    - **Запустите приложение с PM2:**

        ```bash
        pm2 start index.js --name RestLibrary-Api
        ```

    - **Сохраните текущие процессы для автозапуска при перезагрузке:**

        ```bash
        pm2 save
        pm2 startup
        ```

        Выполните предложенную команду, чтобы завершить настройку автозапуска.

    - **Проверьте статус процессов PM2:**

        ```bash
        pm2 status
        ```

### Часть 2: Настройка и запуск Python-приложения

1. **Перейдите в директорию Python-клиента:**

    ```bash
    cd PythonClient/
    ```

2. **Создайте и активируйте виртуальное окружение (рекомендуется):**

    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3. **Установите зависимости:**

    ```bash
    pip install -r requirements.txt
    ```

4. **Запустите приложение:**

    ```bash
    python app.py
    ```

    Откроется окно приложения для управления библиотекой книг.

## Использование

### API-сервер

API предоставляет следующие эндпоинты для управления библиотекой книг:

- **Добавление книги**

    ```http
    POST /books
    ```

    **Тело запроса:**

    ```json
    {
      "title": "Название книги",
      "author": "Автор",
      "year": 2025,
      "genre": "Жанр"
    }
    ```

- **Получение всех книг**

    ```http
    GET /books?limit=1000&page=1
    ```

- **Получение книги по ID**

    ```http
    GET /books/{id}
    ```

- **Обновление книги**

    ```http
    PUT /books/{id}
    ```

    **Тело запроса:**

    ```json
    {
      "title": "Новое название",
      "author": "Новый автор",
      "year": 2026,
      "genre": "Новый жанр"
    }
    ```

- **Удаление книги**

    ```http
    DELETE /books/{id}
    ```

### Python-приложение

Приложение позволяет:

- **Просматривать список книг** в таблице.
- **Добавлять новую книгу** через диалоговое окно.
- **Обновлять информацию о книге** путем выбора из таблицы и изменения данных.
- **Удалять книгу** путем выбора из таблицы и подтверждения удаления.

## Тестирование

Для обеспечения корректной работы API-сервера используются `Jest` и `Supertest`.

1. **Запустите тесты:**

    ```bash
    npm test
    ```

    Все тесты должны проходить успешно.

## Разработка

Для обеспечения постоянной работы сервера и автоматического перезапуска при сбоях рекомендуется использовать PM2.

1. **Установите PM2 глобально:**

    ```bash
    sudo npm install -g pm2
    ```

2. **Запустите приложение с PM2:**

    ```bash
    pm2 start index.js --name RestLibrary-Api
    ```

3. **Сохраните текущие процессы для автозапуска при перезагрузке:**

    ```bash
    pm2 save
    pm2 startup
    ```

    Выполните предложенную команду, чтобы завершить настройку автозапуска.

4. **Проверьте статус процессов PM2:**

    ```bash
    pm2 status
    ```
