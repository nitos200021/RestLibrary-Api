import sys
import requests
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QPushButton, QTableWidget,
    QTableWidgetItem, QHBoxLayout, QDialog, QLabel, QLineEdit, QMessageBox, QTextEdit
)
from PyQt5.QtCore import QTimer

class BookDialog(QDialog):
    def __init__(self, parent=None, book=None):
        super().__init__(parent)
        self.setWindowTitle("Добавить книгу" if book is None else "Обновить книгу")
        self.layout = QVBoxLayout()
        self.title_label = QLabel("Название:")
        self.title_input = QLineEdit()
        self.author_label = QLabel("Автор:")
        self.author_input = QLineEdit()
        self.year_label = QLabel("Год издания:")
        self.year_input = QLineEdit()
        self.genre_label = QLabel("Жанр:")
        self.genre_input = QLineEdit()
        self.content_label = QLabel("Содержание:")
        self.content_input = QTextEdit()
        self.layout.addWidget(self.title_label)
        self.layout.addWidget(self.title_input)
        self.layout.addWidget(self.author_label)
        self.layout.addWidget(self.author_input)
        self.layout.addWidget(self.year_label)
        self.layout.addWidget(self.year_input)
        self.layout.addWidget(self.genre_label)
        self.layout.addWidget(self.genre_input)
        self.layout.addWidget(self.content_label)
        self.layout.addWidget(self.content_input)
        self.button_layout = QHBoxLayout()
        self.save_button = QPushButton("Сохранить")
        self.cancel_button = QPushButton("Отмена")
        self.button_layout.addWidget(self.save_button)
        self.button_layout.addWidget(self.cancel_button)
        self.layout.addLayout(self.button_layout)
        self.setLayout(self.layout)
        self.save_button.clicked.connect(self.accept)
        self.cancel_button.clicked.connect(self.reject)
        if book:
            self.title_input.setText(book['title'])
            self.author_input.setText(book['author'])
            self.year_input.setText(str(book['year']))
            self.genre_input.setText(book['genre'])
            self.content_input.setText(book.get('content', ''))

class App(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Управление библиотекой")
        self.resize(900, 600)
        self.layout = QVBoxLayout()
        self.table = QTableWidget()
        self.table.setColumnCount(6)
        self.table.setHorizontalHeaderLabels(["ID", "Название", "Автор", "Год", "Жанр", "Содержание"])
        self.layout.addWidget(self.table)
        self.button_layout = QHBoxLayout()
        self.add_button = QPushButton("Добавить книгу")
        self.update_button = QPushButton("Обновить книгу")
        self.delete_button = QPushButton("Удалить книгу")
        self.button_layout.addWidget(self.add_button)
        self.button_layout.addWidget(self.update_button)
        self.button_layout.addWidget(self.delete_button)
        self.layout.addLayout(self.button_layout)
        self.setLayout(self.layout)
        self.add_button.clicked.connect(self.add_book)
        self.update_button.clicked.connect(self.update_book)
        self.delete_button.clicked.connect(self.delete_book)
        self.fetch_books()
        self.timer = QTimer()
        self.timer.timeout.connect(self.fetch_books)
        self.timer.start(5000)

    def fetch_books(self):
        try:
            response = requests.get("http://localhost:3000/books?limit=1000")
            if response.status_code == 200:
                books = response.json().get('data', [])
                self.table.setRowCount(0)
                for book in books:
                    row_position = self.table.rowCount()
                    self.table.insertRow(row_position)
                    self.table.setItem(row_position, 0, QTableWidgetItem(book['id']))
                    self.table.setItem(row_position, 1, QTableWidgetItem(book['title']))
                    self.table.setItem(row_position, 2, QTableWidgetItem(book['author']))
                    self.table.setItem(row_position, 3, QTableWidgetItem(str(book['year'])))
                    self.table.setItem(row_position, 4, QTableWidgetItem(book['genre']))
                    self.table.setItem(row_position, 5, QTableWidgetItem(book['content']))
        except Exception as e:
            print(f"Error fetching books: {e}")
            QMessageBox.critical(self, "Ошибка", "Не удалось подключиться к серверу.")

    def add_book(self):
        dialog = BookDialog(self)
        if dialog.exec_() == QDialog.Accepted:
            title = dialog.title_input.text()
            author = dialog.author_input.text()
            year = dialog.year_input.text()
            genre = dialog.genre_input.text()
            content = dialog.content_input.toPlainText()
            if not title or not author:
                QMessageBox.warning(self, "Предупреждение", "Название и автор обязательны.")
                return
            try:
                year_int = int(year) if year else None
            except:
                year_int = None
            data = {
                "title": title,
                "author": author,
                "year": year_int,
                "genre": genre,
                "content": content
            }
            try:
                response = requests.post("http://locaclhost:3000/books", json=data)
                if response.status_code == 201:
                    self.fetch_books()
                else:
                    QMessageBox.critical(self, "Ошибка", f"Не удалось добавить книгу. Статус: {response.status_code}")
            except Exception as e:
                print(f"Error adding book: {e}")
                QMessageBox.critical(self, "Ошибка", "Не удалось добавить книгу.")

    def update_book(self):
        selected = self.table.currentRow()
        if selected < 0:
            QMessageBox.warning(self, "Предупреждение", "Выберите книгу для обновления.")
            return
        book_id = self.table.item(selected, 0).text()
        try:
            response = requests.get(f"http://locaclhost:3000/books/{book_id}")
            if response.status_code != 200:
                QMessageBox.critical(self, "Ошибка", f"Не удалось получить данные книги. Статус: {response.status_code}")
                return
            book = response.json()
        except Exception as e:
            print(f"Error fetching book details: {e}")
            QMessageBox.critical(self, "Ошибка", "Не удалось получить данные книги.")
            return
        dialog = BookDialog(self, book)
        if dialog.exec_() == QDialog.Accepted:
            new_title = dialog.title_input.text()
            new_author = dialog.author_input.text()
            new_year = dialog.year_input.text()
            new_genre = dialog.genre_input.text()
            new_content = dialog.content_input.toPlainText()
            if not new_title or not new_author:
                QMessageBox.warning(self, "Предупреждение", "Название и автор обязательны.")
                return
            try:
                new_year_int = int(new_year) if new_year else None
            except:
                new_year_int = None
            data = {
                "title": new_title,
                "author": new_author,
                "year": new_year_int,
                "genre": new_genre,
                "content": new_content
            }
            try:
                response = requests.put(f"http://locaclhost:3000/books/{book_id}", json=data)
                if response.status_code == 200:
                    self.fetch_books()
                else:
                    QMessageBox.critical(self, "Ошибка", f"Не удалось обновить книгу. Статус: {response.status_code}")
            except Exception as e:
                print(f"Error updating book: {e}")
                QMessageBox.critical(self, "Ошибка", "Не удалось обновить книгу.")

    def delete_book(self):
        selected = self.table.currentRow()
        if selected < 0:
            QMessageBox.warning(self, "Предупреждение", "Выберите книгу для удаления.")
            return
        book_id = self.table.item(selected, 0).text()
        reply = QMessageBox.question(
            self,
            "Подтверждение",
            "Вы действительно хотите удалить эту книгу?",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            try:
                response = requests.delete(f"http://locaclhost:3000/books/{book_id}")
                if response.status_code == 204:
                    self.fetch_books()
                else:
                    QMessageBox.critical(self, "Ошибка", f"Не удалось удалить книгу. Статус: {response.status_code}")
            except Exception as e:
                print(f"Error deleting book: {e}")
                QMessageBox.critical(self, "Ошибка", "Не удалось удалить книгу.")

class ContentDialog(QDialog):
    def __init__(self, parent=None, content=""):
        super().__init__(parent)
        self.setWindowTitle("Содержание книги")
        self.layout = QVBoxLayout()
        self.content_label = QLabel("Содержание:")
        self.content_text = QTextEdit()
        self.content_text.setReadOnly(True)
        self.content_text.setText(content)
        self.layout.addWidget(self.content_label)
        self.layout.addWidget(self.content_text)
        self.setLayout(self.layout)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = App()
    window.show()
    sys.exit(app.exec_()