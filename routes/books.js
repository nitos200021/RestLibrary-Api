const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const DATA_FILE = 'data.json';

const readData = async () => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
};

const writeData = async (data) => {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
};

router.post('/', async (req, res) => {
    const { title, author, year, genre } = req.body;
    if (!title || !author) {
        return res.status(400).json({ message: 'Название и автор книги обязательны' });
    }
    const newBook = { id: uuidv4(), title, author, year, genre };
    const books = await readData();
    books.push(newBook);
    await writeData(books);
    res.status(201).json(newBook);
});

router.get('/', async (req, res) => {
    const { author, genre, page = 1, limit = 1000 } = req.query;
    let books = await readData();
    if (author) {
        books = books.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
    }
    if (genre) {
        books = books.filter(book => book.genre.toLowerCase().includes(genre.toLowerCase()));
    }
    const start = (page - 1) * limit;
    const end = start + parseInt(limit);
    const paginatedBooks = books.slice(start, end);
    res.json({
        total: books.length,
        page: parseInt(page),
        limit: parseInt(limit),
        data: paginatedBooks
    });
});

router.get('/:id', async (req, res) => {
    const books = await readData();
    const book = books.find(b => b.id === req.params.id);
    if (!book) {
        return res.status(404).json({ message: 'Книга не найдена' });
    }
    res.json(book);
});

router.put('/:id', async (req, res) => {
    const { title, author, year, genre } = req.body;
    if (!title || !author) {
        return res.status(400).json({ message: 'Название и автор книги обязательны' });
    }
    const books = await readData();
    const index = books.findIndex(b => b.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Книга не найдена' });
    }
    books[index] = { id: req.params.id, title, author, year, genre };
    await writeData(books);
    res.json(books[index]);
});

router.delete('/:id', async (req, res) => {
    const books = await readData();
    const index = books.findIndex(b => b.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ message: 'Книга не найдена' });
    }
    books.splice(index, 1);
    await writeData(books);
    res.status(204).send();
});

module.exports = router;