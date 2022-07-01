CREATE DATABASE chatDB;

USE chatDB;

DROP TABLE IF EXISTS users;

CREATE TABLE
    users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
    );

DROP TABLE IF EXISTS tokens;

CREATE TABLE
    tokens (
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

DROP TABLE IF EXISTS rooms;

CREATE TABLE
    rooms (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_by INT NOT NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );

DROP TABLE IF EXISTS room_user_rel;

CREATE TABLE
    room_user_rel (
        user_id INT NOT NULL,
        room_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, room_id)
    );

DROP TABLE IF EXISTS chats;

CREATE TABLE
    chats (
        user_id INT NOT NULL,
        room_id INT NOT NULL,
        chat VARCHAR(255) NOT NULL,
        file VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT now(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );