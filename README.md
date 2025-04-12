# 📊 CS462 - UtiliSense

## 🧩 Web Application

**UtiliSense** is a web application that consists of a **React** frontend and a **Node.js/Express** backend. It displays visualizations based on image data captured by cameras and people count data stored in a **MongoDB** database.

---

## 🛠️ How to Run the Application

### 1. Clone the Repository

```bash
git clone https://github.com/cydniena/cs462
cd cs462
```

---

### 2. Start the Backend Server

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder with the following content (update the values as needed):

```env
MONGO_URI=your_mongodb_connection_string
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

Start the backend server:

```bash
npm start
```

The backend will be running at: [http://localhost:5005](http://localhost:5005)

---

### 3. Start the Frontend Server

Open a new terminal, then run:

```bash
cd frontend
npm install
npm start
```

The frontend will be running at: [http://localhost:3000](http://localhost:3000)

---

## 📦 Technologies Used

- **Frontend**: React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Others**: Telegram Bot API

---

## 📸 Project Overview

This project visualizes people count data captured via cameras. The backend processes the data, stores it in MongoDB, and optionally sends updates via Telegram. The frontend fetches and displays the data through user-friendly visualizations.

---
