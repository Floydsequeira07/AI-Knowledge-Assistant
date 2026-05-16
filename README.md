# AI-Powered Knowledge Base Chatbot

An AI-powered internal knowledge base chatbot system with real-time admin monitoring, role-based authentication, persistent chat sessions, and AI-generated responses using company KB articles.

---

# Features

## Authentication & Authorization

* Admin and Employee login system
* Role-based protected routes
* Persistent login using localStorage
* Separate dashboards for Admin and Employees

---

# Admin Features

## Knowledge Base Management

* Add KB Articles
* Edit KB Articles
* Delete KB Articles
* Search KB Articles

## Employee Monitoring

* Real-time online/offline employee tracking
* View employee latest messages
* Monitor employee chat sessions
* View full conversation history
* Stop employee chat sessions

---

# Employee Features

* Start multiple chat sessions
* Persistent chat history
* AI-powered chatbot responses
* Real-time typing-like response effect
* Session-based conversations

---

# AI Integration

* Integrated with Groq AI API
* Uses Knowledge Base articles as context
* Responds only using KB articles
* Returns:
  "I don't have that information."
  when answer is unavailable

---

# Real-Time Features

* Socket.IO based real-time communication
* Live admin monitoring
* Online/offline presence tracking
* Instant message updates

---

# Tech Stack

## Frontend

* React.js
* Tailwind CSS
* Axios
* React Router DOM
* React Hot Toast
* Socket.IO Client

## Backend

* Node.js
* Express.js
* Socket.IO
* Groq SDK

## Database

* MySQL

---

# Project Structure

/client

* React Frontend

/server

* Express Backend
* Socket.IO Server
* AI Integration
* MySQL Database

---

# Installation

## Clone Repository

```bash
git clone <your-repository-url>
```

---

# Backend Setup

```bash
cd server
npm install
npm run dev
```

Create `.env` file:

```env
PORT=5000
GROQ_API_KEY=your_api_key
```

---

# Frontend Setup

```bash
cd my-ai-kb-chatbot
npm install
npm run dev
```

---

# Database Tables

## users

* id
* email
* password
* role

## kb_articles

* id
* title
* content

## chat_sessions

* id
* employee_id
* stopped
* created_at

## messages

* id
* session_id
* sender
* content
* created_at

---

# Functionalities Implemented

* Authentication
* Protected Routes
* Role-Based Access
* Real-Time Monitoring
* Chat Sessions
* Persistent Storage
* AI Integration
* KB CRUD
* Online/Offline Tracking
* Admin Monitoring
* Session History
* Stop Chat Functionality
* Responsive UI

---

# Future Improvements

* PDF Upload Support
* Chat Summary Feature
* Dark Mode
* Admin Intervention in Chats
* Advanced Search

---

# Author

Floyd Jostin Sequeira
