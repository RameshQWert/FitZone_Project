# Fitness Center Management System

A full-stack web application for managing fitness center operations, including member management, trainer scheduling, class bookings, and subscription plans.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with role-based access (Admin, Trainer, Member)
- **Member Management**: CRUD operations for gym members
- **Trainer Management**: Manage trainers and their schedules
- **Class Scheduling**: Book and manage fitness classes
- **Subscription Plans**: Various membership plans management
- **Admin Dashboard**: Comprehensive dashboard with charts and analytics
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Framer Motion (animations)
- Recharts (data visualization)
- React Router DOM
- React Hot Toast (notifications)

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (password hashing)

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth)
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── utils/          # Helper functions
│   └── ...
│
├── server/                 # Node.js backend
│   ├── config/             # Database & cloud config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth & validation middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── server.js           # Entry point
│
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fitness-center-management.git
   cd fitness-center-management
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```
   
   Create a `.env` file in the server folder:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   ```

4. **Seed the Database (Optional)**
   ```bash
   cd ../server
   node seed.js
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:5000`

2. **Start Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```
   Client runs on `http://localhost:5173`

## 🔐 Default Admin Credentials

After seeding the database:
- **Email**: admin@fitzone.com
- **Password**: admin123

## 📱 Pages

- **Home** - Landing page with hero section
- **About** - About the fitness center
- **Programs** - Available fitness programs
- **Trainers** - Meet our trainers
- **Schedule** - Class schedule
- **Pricing** - Membership plans
- **Contact** - Contact form and location
- **Login/Register** - Authentication pages
- **Admin Dashboard** - Admin management panel

## 📄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Members
- `GET /api/members` - Get all members
- `POST /api/members` - Create member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Trainers
- `GET /api/trainers` - Get all trainers
- `POST /api/trainers` - Create trainer
- `PUT /api/trainers/:id` - Update trainer
- `DELETE /api/trainers/:id` - Delete trainer

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `POST /api/subscriptions` - Create subscription

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Ramesh Kumar

---

⭐ Star this repository if you find it helpful!
