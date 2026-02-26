# 🛒 MERN POS System

A full-featured, production-ready **Point of Sale system** built with the MERN stack (MongoDB, Express, React, Node.js). Designed for F&B businesses with support for multiple tax types, kitchen printing, role-based access, and sales analytics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![MongoDB](https://img.shields.io/badge/database-MongoDB-brightgreen.svg)
![React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb.svg)

---

## 📸 Screenshots

| POS Screen          | Admin Dashboard      | Kitchen Ticket         |
| ------------------- | -------------------- | ---------------------- |
| Product grid + cart | Sales charts + stats | Large text for kitchen |

---

## ✨ Features

### 🧑‍💼 Role-Based Access

- **Admin** — full access to dashboard, products, categories, orders, users, settings
- **Cashier** — POS screen only

### 🛒 POS Screen

- Product grid with category tabs and search
- Click to add to cart, +/− quantity controls
- Per-item special notes (e.g. "no onion", "extra spicy")
- Discount percentage input
- Payment methods: Cash, Card, eWallet
- Change calculator with quick cash amount buttons
- Customer name + table number fields

### 🖨️ Dual Receipt Printing

- **Customer Receipt** — full breakdown with taxes, change, store info
- **Kitchen Ticket** — large text, items + quantity only, no prices, timestamps

### 🧾 Compound Tax System

- Add multiple named taxes (e.g. Service Charge 10%, SST 6%)
- Compound stacking — each tax applies on top of the previous running total
- Enable/disable individual taxes
- Live preview in settings

### 📦 Product Management

- Full CRUD with image upload (Cloudinary)
- Low stock alerts with pulsing badges
- Category filtering with color-coded tags
- Barcode field support
- Cost price tracking for profit reports

### 📊 Admin Dashboard & Reports

- Today's sales, monthly revenue, total orders (animated count-up)
- Area chart — sales over 7 days / 30 days / 12 months
- Top 5 selling products with progress bars
- Payment method breakdown (pie chart)
- Orders history with date filtering and full order detail modal

### 👥 User Management

- Admin creates/edits/disables cashier accounts
- Password reset by admin
- Self-service password change
- Account cannot disable itself (safety guard)

### ⚙️ Settings

- Store name, address, phone, email (shown on receipt)
- Currency configuration
- Receipt footer message
- Multiple compound tax configuration

### 🎨 Animations

- Product cards stagger in on load
- Scale pop on product click
- Cart items slide in from right
- Charge button pulses when ready
- Stats cards count up on load
- Skeleton loaders while fetching data
- Modal slide-up entrance

---

## 🗂️ Project Structure

```
mern-pos/
├── client/                     # React frontend (Vite)
│   ├── public/
│   └── src/
│       ├── api/                # Axios API helper functions
│       │   ├── axios.js        # Base axios instance with JWT interceptor
│       │   ├── authAPI.js
│       │   ├── categoryAPI.js
│       │   ├── productAPI.js
│       │   ├── orderAPI.js
│       │   ├── reportAPI.js
│       │   ├── userAPI.js
│       │   └── settingsAPI.js
│       ├── components/
│       │   ├── pos/
│       │   │   ├── ProductGrid.jsx
│       │   │   ├── CartPanel.jsx
│       │   │   ├── ReceiptModal.jsx
│       │   │   └── KitchenTicket.jsx
│       │   ├── dashboard/
│       │   │   ├── StatsCard.jsx
│       │   │   ├── SalesChart.jsx
│       │   │   ├── TopProducts.jsx
│       │   │   └── PaymentBreakdown.jsx
│       │   ├── AdminLayout.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── CartContext.jsx
│       │   └── SettingsContext.jsx
│       ├── hooks/
│       │   └── useAnimation.js
│       ├── pages/
│       │   ├── auth/
│       │   │   └── LoginPage.jsx
│       │   ├── admin/
│       │   │   ├── CategoriesPage.jsx
│       │   │   ├── ProductsPage.jsx
│       │   │   ├── OrdersPage.jsx
│       │   │   ├── UsersPage.jsx
│       │   │   └── SettingsPage.jsx
│       │   ├── DashboardPage.jsx
│       │   └── POSPage.jsx
│       ├── styles/
│       │   └── animations.css
│       └── App.jsx
│
└── server/                     # Node.js + Express backend
    ├── config/
    │   ├── db.js               # MongoDB connection
    │   └── cloudinary.js       # Cloudinary + Multer setup
    ├── controllers/
    │   ├── authController.js
    │   ├── categoryController.js
    │   ├── productController.js
    │   ├── orderController.js
    │   ├── reportController.js
    │   ├── userController.js
    │   └── settingsController.js
    ├── middleware/
    │   └── authMiddleware.js   # JWT protect + adminOnly
    ├── models/
    │   ├── User.js
    │   ├── Category.js
    │   ├── Product.js
    │   ├── Order.js
    │   └── Settings.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── categoryRoutes.js
    │   ├── productRoutes.js
    │   ├── orderRoutes.js
    │   ├── reportRoutes.js
    │   ├── userRoutes.js
    │   └── settingsRoutes.js
    ├── .env
    └── server.js
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org) v18 or higher
- [Git](https://git-scm.com)
- A [MongoDB Atlas](https://cloud.mongodb.com) account (free tier)
- A [Cloudinary](https://cloudinary.com) account (free tier)

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/mern-pos.git
cd mern-pos
```

---

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` folder:

```env
# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://yourUsername:yourPassword@cluster0.mongodb.net/posdb

# JWT secret key — change this to something long and random in production
JWT_SECRET=your_super_secret_jwt_key_change_this

# Server port
PORT=5000

# Cloudinary credentials (from your Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:

```bash
npm run dev
```

You should see:

```
Server running on http://localhost:5000
MongoDB Connected: cluster0.mongodb.net
```

---

### 3. Set Up the Frontend

```bash
cd ../client
npm install
npm run dev
```

The app will open at `http://localhost:5173`

---

### 4. Create Your First Admin Account

Use Thunder Client, Postman, or curl to register the first admin:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@yourstore.com",
    "password": "yourpassword",
    "role": "admin"
  }'
```

Then log in at `http://localhost:5173/login` with those credentials.

---

## 🔑 Environment Variables Reference

| Variable                | Description                              | Required |
| ----------------------- | ---------------------------------------- | -------- |
| `MONGO_URI`             | MongoDB Atlas connection string          | ✅ Yes   |
| `JWT_SECRET`            | Secret key for signing JWT tokens        | ✅ Yes   |
| `PORT`                  | Port the backend runs on (default: 5000) | No       |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name               | ✅ Yes   |
| `CLOUDINARY_API_KEY`    | Your Cloudinary API key                  | ✅ Yes   |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret               | ✅ Yes   |

---

## 📡 API Endpoints

### Auth

| Method | Endpoint             | Access    | Description             |
| ------ | -------------------- | --------- | ----------------------- |
| POST   | `/api/auth/register` | Public    | Register a new user     |
| POST   | `/api/auth/login`    | Public    | Login and get JWT token |
| GET    | `/api/auth/me`       | Protected | Get current user info   |

### Categories

| Method | Endpoint              | Access    | Description          |
| ------ | --------------------- | --------- | -------------------- |
| GET    | `/api/categories`     | Protected | Get all categories   |
| POST   | `/api/categories`     | Admin     | Create category      |
| PUT    | `/api/categories/:id` | Admin     | Update category      |
| DELETE | `/api/categories/:id` | Admin     | Soft delete category |

### Products

| Method | Endpoint            | Access    | Description                                         |
| ------ | ------------------- | --------- | --------------------------------------------------- |
| GET    | `/api/products`     | Protected | Get all products (supports `?search=` `?category=`) |
| POST   | `/api/products`     | Admin     | Create product (multipart/form-data for image)      |
| PUT    | `/api/products/:id` | Admin     | Update product                                      |
| DELETE | `/api/products/:id` | Admin     | Soft delete product                                 |

### Orders

| Method | Endpoint                    | Access    | Description                                         |
| ------ | --------------------------- | --------- | --------------------------------------------------- |
| POST   | `/api/orders`               | Protected | Create order (checkout)                             |
| GET    | `/api/orders`               | Admin     | Get all orders (supports `?startDate=` `?endDate=`) |
| GET    | `/api/orders/:id`           | Protected | Get single order                                    |
| GET    | `/api/orders/summary/today` | Protected | Today's summary stats                               |

### Reports

| Method | Endpoint                       | Access | Description                             |
| ------ | ------------------------------ | ------ | --------------------------------------- |
| GET    | `/api/reports/dashboard`       | Admin  | Dashboard stats cards                   |
| GET    | `/api/reports/sales-chart`     | Admin  | Sales chart data (`?period=7\|30\|365`) |
| GET    | `/api/reports/top-products`    | Admin  | Top selling products                    |
| GET    | `/api/reports/payment-methods` | Admin  | Payment method breakdown                |

### Users

| Method | Endpoint                        | Access    | Description         |
| ------ | ------------------------------- | --------- | ------------------- |
| GET    | `/api/users`                    | Admin     | Get all users       |
| POST   | `/api/users`                    | Admin     | Create user         |
| PUT    | `/api/users/:id`                | Admin     | Update user         |
| PUT    | `/api/users/:id/reset-password` | Admin     | Reset user password |
| PUT    | `/api/users/change-password`    | Protected | Change own password |
| DELETE | `/api/users/:id`                | Admin     | Deactivate user     |

### Settings

| Method | Endpoint        | Access    | Description        |
| ------ | --------------- | --------- | ------------------ |
| GET    | `/api/settings` | Protected | Get store settings |
| PUT    | `/api/settings` | Admin     | Update settings    |

---

## 🧾 Tax System Explained

This POS uses a **compound tax system** where taxes stack on top of each other in order.

**Example configuration:**

```
Tax 1: Service Charge — 10% — Order: 1
Tax 2: SST            —  6% — Order: 2
```

**Calculation on RM 100.00 subtotal:**

```
After discount:        RM 100.00
Service Charge 10%:  + RM  10.00  (10% of 100.00)  → Running: RM 110.00
SST 6%:              + RM   6.60  (6% of 110.00)   → Running: RM 116.60
─────────────────────────────────────────────────────────────────────────
Final Total:           RM 116.60
```

Each tax is stored as a snapshot on the order so historical receipts are always accurate even if tax rates change later.

---

## 🏗️ Tech Stack

### Backend

| Package      | Purpose                       |
| ------------ | ----------------------------- |
| Express.js   | Web framework and routing     |
| Mongoose     | MongoDB object modeling       |
| jsonwebtoken | JWT authentication            |
| bcryptjs     | Password hashing              |
| multer       | File upload handling          |
| cloudinary   | Cloud image storage           |
| dotenv       | Environment variable loading  |
| cors         | Cross-origin request handling |
| nodemon      | Dev auto-restart              |

### Frontend

| Package          | Purpose                         |
| ---------------- | ------------------------------- |
| React 18 + Vite  | UI framework and build tool     |
| React Router DOM | Client-side navigation          |
| Axios            | HTTP requests with interceptors |
| Recharts         | Sales charts and graphs         |
| React Hot Toast  | Toast notifications             |
| React Icons      | Icon library                    |

---

## 🚢 Deployment

### Deploy Backend to Railway (Recommended)

[Railway](https://railway.app) is used instead of Render because it has **no sleep/inactive timeout** — your server stays always on for free.

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select your `mern-pos` repository
4. Click on the deployed service → **Settings** tab
5. Set **Root Directory** to `server`
6. Click **Variables** tab and add all environment variables:
   ```
   MONGO_URI              = mongodb+srv://user:pass@cluster.mongodb.net/posdb
   JWT_SECRET             = your_long_random_secret
   CLOUDINARY_CLOUD_NAME  = your_cloud_name
   CLOUDINARY_API_KEY     = your_api_key
   CLOUDINARY_API_SECRET  = your_api_secret
   NODE_ENV               = production
   PORT                   = 5000
   ```
7. Click **Settings → Networking → Generate Domain**
8. Copy your Railway URL (e.g. `https://mern-pos-production.up.railway.app`)

> **Note:** Every push to `main` on GitHub triggers an automatic redeploy on Railway.

---

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **New Project** and import your `mern-pos` repo
3. Set these values:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   ```
   VITE_API_URL = https://mern-pos-production.up.railway.app/api
   ```
   > ⚠️ Must start with `https://` and end with `/api` — no trailing slash
5. Click **Deploy**
6. Get your Vercel URL (e.g. `https://mern-pos-phi.vercel.app`)

---

### Fix React Router on Vercel

Create `client/vercel.json` to handle SPA routing — without this all routes except `/` return 404:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### Create First Admin Account

After deploying, open your browser console on your Vercel URL and run:

```javascript
fetch("https://mern-pos-production.up.railway.app/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Admin",
    email: "admin@yourstore.com",
    password: "yourpassword",
    role: "admin",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

Then log in normally at your Vercel URL.

---

### Live URLs

| Service        | Provider      | URL                                          |
| -------------- | ------------- | -------------------------------------------- |
| 🖥️ Frontend    | Vercel        | `https://mern-pos-phi.vercel.app`            |
| ⚙️ Backend API | Railway       | `https://mern-pos-production.up.railway.app` |
| 🗄️ Database    | MongoDB Atlas | Cloud                                        |
| 🖼️ Images      | Cloudinary    | Cloud                                        |

---

### Update Frontend API URL

`client/src/api/axios.js` uses the environment variable automatically:

```javascript
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});
```

---

## 📋 Development Scripts

### Backend (`/server`)

```bash
npm run dev     # Start with nodemon (auto-restart)
npm start       # Start for production
```

### Frontend (`/client`)

```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run preview # Preview production build
```

---

## 🔐 Security Notes

- Passwords are hashed with **bcrypt** (10 salt rounds) — never stored as plain text
- JWT tokens expire after **7 days**
- All admin routes are protected with `adminOnly` middleware
- Soft deletes used throughout — data is never permanently deleted
- `.env` file is gitignored — never commit secrets to GitHub
- Stock is validated server-side before every order — cannot oversell

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add: your feature description"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use it for personal or commercial projects.

---

## 👨‍💻 Author

Built step by step with ❤️ using Claude AI as a teaching assistant.

---

## 🙏 Acknowledgements

- [MongoDB Atlas](https://cloud.mongodb.com) — free cloud database
- [Cloudinary](https://cloudinary.com) — free image hosting
- [Railway](https://railway.app) — backend hosting (no sleep timeout)
- [Vercel](https://vercel.com) — free frontend hosting
- [Recharts](https://recharts.org) — React chart library
