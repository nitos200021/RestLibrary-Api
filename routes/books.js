const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data.json');

const readData = async () => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(err);
        return [];
    }
};

const writeData = async (data) => {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(err);
    }
};

router.get('/', async (req, res) => {
    const { author, genre, page = 1, limit = 1000 } = req.query;
    let books = await readData();

    if (author) {
        books = books.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
    }

    if (genre) {
        books = books.filter(book => book.genre.toLowerCase().includes(genre.toLowerCase()));
    }

    const total = books.length;
    const start = (page - 1) * limit;
    const end = start + parseInt(limit);
    const paginatedBooks = books.slice(start, end);

    res.json({
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        data: paginatedBooks
    });
});

router.get('/:id', async (req, res) => {
    const books = await readData();
    const book = books.find(b => b.id === req.params.id);
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ message: 'Книга не найдена' });
    }
});

router.post('/', async (req, res) => {
    const { title, author, year, genre, content } = req.body;
    if (!title || !author) {
        return res.status(400).json({ message: 'Название и автор обязательны' });
    }

    const newBook = {
        id: uuidv4(),
        title,
        author,
        year: year || null,
        genre: genre || null,
        content: content || ''
    };

    const books = await readData();
    books.push(newBook);
    await writeData(books);

    res.status(201).json(newBook);
});

router.put('/:id', async (req, res) => {
    const { title, author, year, genre, content } = req.body;
    const books = await readData();
    const bookIndex = books.findIndex(b => b.id === req.params.id);

    if (bookIndex === -1) {
        return res.status(404).json({ message: 'Книга не найдена' });
    }

    const updatedBook = {
        ...books[bookIndex],
        title: title || books[bookIndex].title,
        author: author || books[bookIndex].author,
        year: year !== undefined ? year : books[bookIndex].year,
        genre: genre || books[bookIndex].genre,
        content: content || books[bookIndex].content
    };

    books[bookIndex] = updatedBook;
    await writeData(books);

    res.json(updatedBook);
});

router.delete('/:id', async (req, res) => {
    const books = await readData();
    const filteredBooks = books.filter(b => b.id !== req.params.id);

    if (books.length === filteredBooks.length) {
        return res.status(404).json({ message: 'Книга не найдена' });
    }

    await writeData(filteredBooks);
    res.status(204).send();
});

module.exports = router;