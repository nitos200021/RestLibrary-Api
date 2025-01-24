const request = require('supertest');
const express = require('express');
const booksRouter = require('../routes/books');
const fs = require('fs-extra');
const DATA_FILE = 'data.json';

const app = express();
app.use(express.json());
app.use('/books', booksRouter);

beforeEach(async () => {
    const initialData = [
        {
            "id": "1a2b3c4d-5678-90ab-cdef-1234567890ab",
            "title": "Test 1",
            "author": "WR8",
            "year": 2024,
            "genre": "Фэнтези"
        },
        {
            "id": "2b3c4d5e-6789-0abc-def1-234567890abc",
            "title": "Test 2",
            "author": "IN",
            "year": 2023,
            "genre": "Драма"
        },
        {
            "id": "3c4d5e6f-7890-1bcd-ef12-34567890abcd",
            "title": "Test 3",
            "author": "Nikita",
            "year": 2022,
            "genre": "Мистика"
        }
    ];
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
});

describe('Books API', () => {
    it('может создать новую книгу', async () => {
        const res = await request(app)
            .post('/books')
            .send({
                title: 'Test 4',
                author: 'Рандомный Автор',
                year: 2025,
                genre: 'Приключения'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe('Test 4');
        expect(res.body.author).toBe('Рандомный Автор');
        expect(res.body.year).toBe(2025);
        expect(res.body.genre).toBe('Приключения');
    });

    it('должен получить все книги', async () => {
        const res = await request(app).get('/books');
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(3);
        expect(res.body.total).toBe(3);
    });

    it('должен получить книгу по id', async () => {
        const res = await request(app).get('/books/1a2b3c4d-5678-90ab-cdef-1234567890ab');
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe('Test 1');
        expect(res.body.author).toBe('WR8');
    });

    it('должен обновить книгу', async () => {
        const res = await request(app)
            .put('/books/2b3c4d5e-6789-0abc-def1-234567890abc')
            .send({
                title: 'Обновленный Test 2',
                author: 'IN',
                year: 2026,
                genre: 'Триллер'
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe('Обновленный Test 2');
        expect(res.body.year).toBe(2026);
        expect(res.body.genre).toBe('Триллер');
    });

    it('должен удалить книгу', async () => {
        const res = await request(app).delete('/books/3c4d5e6f-7890-1bcd-ef12-34567890abcd');
        expect(res.statusCode).toEqual(204);
        const getRes = await request(app).get('/books/3c4d5e6f-7890-1bcd-ef12-34567890abcd');
        expect(getRes.statusCode).toEqual(404);
    });

    it('должен фильтровать книги по автору', async () => {
        const res = await request(app).get('/books').query({ author: 'WR8' });
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].author).toBe('WR8');
    });

    it('должен осуществлять пагинацию', async () => {
        for (let i = 4; i <= 15; i++) {
            await request(app)
                .post('/books')
                .send({
                    title: `Test ${i}`,
                    author: `Автор ${i}`,
                    year: 2000 + i,
                    genre: 'Жанр'
                });
        }
        const res = await request(app).get('/books').query({ page: 2, limit: 10 });
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toBe(5);
        expect(res.body.page).toBe(2);
        expect(res.body.limit).toBe(10);
    });
});