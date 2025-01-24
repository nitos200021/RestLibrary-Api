const express = require('express');
const booksRouter = require('./routes/books');

const app = express();
app.use(express.json());

app.use('/books', booksRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});