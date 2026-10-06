# Smart Canteen System - CanteenX

A modern **AI-powered Smart Canteen Management and Food Ordering System** designed to make campus food ordering faster, easier, and more efficient.

The system allows students to browse available food items, manage their cart, place orders, and interact with an **AI-powered voice assistant** for food ordering. At the same time, administrators can manage food items, monitor stock, and process student orders through a dedicated admin dashboard.

---

## 🚀 Features

### 👨‍🎓 Student Features

*  User-friendly food ordering interface
*  Browse food items by category
*  View food details and availability
*  Add and remove items from cart
*  Place food orders
*  View order information
*  Real-time stock availability
*  Voice-based food ordering

### 🤖 AI Voice Assistant

The system includes an AI-powered assistant that allows students to interact with the canteen using voice commands.

Example commands:

```text
"Add two samosas to my cart"

"Show my cart"

"Clear my cart"
```

The assistant identifies the user's intent and performs the required action.

Supported operations include:

* `ADD`
* `REMOVE`
* `SHOW_CART`
* `CLEAR_CART`
* `MENU_QUERY`

The system uses **Web Speech API** for voice input and an AI backend for understanding user requests.

---

## 👨‍💼 Admin Features

The admin dashboard provides centralized control over the canteen.

### Food Management

* Add new food items
* Update food information
* Remove food items
* Manage food stock
* Update food availability
* Manage food categories

### Order Management

* View incoming orders
* Filter orders
* Accept orders
* Reject orders
* Track order status
* Monitor canteen operations

---

## 🎯 Problem Statement

Traditional college canteens often experience long queues and delays during short break periods.

When a large number of students try to purchase food at the same time, it can result in:

* Long waiting queues
* Slow manual ordering
* Difficulty checking food availability
* Stock management problems
* Order processing delays
* Increased workload for canteen staff

The Smart Canteen System addresses these problems by providing a centralized digital ordering and management platform.

---

## 💡 Proposed Solution

The system digitizes the canteen ordering process.

```text
Student
   │
   ▼
Browse Food / Voice Assistant
   │
   ▼
Add Items to Cart
   │
   ▼
Place Order
   │
   ▼
Backend API
   │
   ▼
Database
   │
   ▼
Admin Dashboard
   │
   ├── Accept Order
   └── Reject Order
```

This reduces manual interaction and helps students place orders more efficiently.

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      Student         │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     Backend API      │
                    │  Node.js + Express   │
                    └───────┬───────┬──────┘
                            │       │
                ┌───────────┘       └────────────┐
                ▼                                ▼
       ┌────────────────┐              ┌─────────────────┐
       │ MongoDB Atlas  │              │   AI Assistant  │
       │    Database    │              │     Gemini      │
       └────────────────┘              └─────────────────┘
               |                               |
                ________________________________
                              │
                              ▼
                    ┌──────────────────────┐
                    │   Admin Frontend     │
                    │     Dashboard        │
                    └──────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* CSS3
* Web Speech API

### Backend

* Node.js
* Express.js
* REST API
* JWT Authentication

### Database

* MongoDB
* MongoDB Atlas
* Mongoose

### AI

* Gemini API
* Voice interaction using Web Speech API

### Development Tools

* Git
* GitHub
* VS Code
* Postman

---

## 📂 Project Structure

```text
Smart-Canteen-System/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── admin-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── package.json
│   └── server.js
│
├── README.md
```

---

## 🎯 Key Benefits

* Reduces ordering time
* Improves student convenience
* Provides better stock visibility
* Simplifies admin operations
* Enables AI-powered interaction
* Supports voice-based ordering
* Centralizes canteen management
* Provides a digital ordering experience

---

## 🔮 Future Enhancements

The system can be extended with:

* Online payment integration
* Mobile application
* Push notifications
* Real-time order notifications
* Multiple canteen support

---

## 🌐 Deployment

The application can be deployed using:

```text
Frontend       → Vercel
Admin Frontend → Vercel
Backend        → Render
Database       → MongoDB Atlas
```

Architecture:

```text
                 Internet
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     Student App          Admin App
       Vercel               Vercel
          │                   │
          └─────────┬─────────┘
                    ▼
              Backend API
                 Render
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     MongoDB Atlas       AI Service
```
---

## 📄 License

This project is developed for educational and project demonstration purposes.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

**Smart Canteen System — Making Campus Food Ordering Smarter, Faster and Simpler.**
