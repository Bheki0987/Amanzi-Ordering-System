<div align="center">

  <img src="frontend/public/images/Amanzi%20Logo.png" alt="Amanzi Logo" width="200" />

  # Amanzi Ordering System
  ### 💧 Hydration on Demand

  <p>
    A comprehensive, full-stack water delivery solution designed for the NWU Mahikeng Campus ecosystem. Bridging the gap between student residences and local water service providers.
  </p>

  <p>
    <img src="https://img.shields.io/badge/MERN-Stack-000000?style=for-the-badge&logo=mongodb&logoColor=green" alt="MERN Stack" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/Stripe-Integration-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
  </p>

  <h4>
    <a href="#-features">Features</a> .
    <a href="#-tech-stack">Tech Stack</a> .
    <a href="#-installation">Installation</a> .
    <a href="#-api-documentation">API Docs</a> .
    <a href="#-team">Team</a>
  </h4>
</div>

---

## 📖 Overview

**Amanzi Ordering System** is a web-based platform that streamlines the logistics of water delivery. By digitizing the ordering process, we eliminate manual coordination errors, provide real-time tracking for students, and offer powerful revenue analytics for service providers.

This system was built to solve the specific logistical challenges faced by students living in residence clusters who require reliable access to purified water.

---

## ✨ Features

The application serves two distinct user groups with tailored dashboards:

### 🎓 For Students (Customers)
* **🛒 Seamless Ordering:** Place orders for 5L+ capacities with just a few clicks.
* **📍 Smart Location:** Select residence clusters for precise delivery.
* **💳 Flexible Payments:** Integrated **Stripe** payments or Cash on Delivery options.
* **📱 Live Tracking:** Real-time status updates (Pending → Accepted → Out for Delivery).
* **📄 Digital Invoicing:** Auto-generated invoices with provider contact details.
* **🔔 Smart Alerts:** Email and in-app notifications for order updates.

### 🚛 For Service Providers
* **📦 Order Command Center:** Accept, reject, and manage incoming orders efficiently.
* **📊 Analytics Suite:** Visual charts for revenue trends, popular delivery slots, and residence hotspots.
* **💰 Financial Tracking:** Monitor daily earnings and transaction history.
* **📈 Capacity Planning:** Analyze peak ordering times to optimize delivery routes.

---

## 🛠 Tech Stack

This project leverages the **MERN** architecture for scalability and performance.

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Chart.js, Axios |
| **Backend** | Node.js, Express.js, REST API Architecture |
| **Database** | MongoDB (Atlas), Mongoose ODM |
| **Security** | JWT Auth, BCrypt hashing, CORS policies |
| **Services** | Stripe API (Payments), Nodemailer (Notifications) |

---

## 🚀 Getting Started

### Prerequisites
Ensure you have the following installed locally:
* [Node.js](https://nodejs.org/) (v16+)
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) URI
* [Git](https://git-scm.com/)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/amanzi-ordering-system.git](https://github.com/YOUR_USERNAME/amanzi-ordering-system.git)
    cd amanzi-ordering-system
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    ```
    *Create a `.env` file in `/backend` and add:*
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_secure_secret
    STRIPE_SECRET_KEY=your_stripe_secret
    FRONTEND_URL=http://localhost:5173
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASSWORD=your_app_password
    ```

3.  **Frontend Setup**
    ```bash
    cd ../frontend
    npm install
    ```
    *Create a `.env.development` file in `/frontend` and add:*
    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
    ```

4.  **Run the Application**
    *Terminal 1 (Backend):* `npm run dev`
    *Terminal 2 (Frontend):* `npm run dev`

---

## 📂 Project Structure

<details>
<summary>Click to view the full file tree</summary>

```text
amanzi-ordering-system/
├── backend/
│   ├── src/
│   │   ├── config/         # DB & Stripe Config
│   │   ├── controllers/    # Logic for Orders, Auth, Payments
│   │   ├── middleware/     # Auth & Error Handling
│   │   ├── models/         # Mongoose Schemas (User, Order)
│   │   ├── routes/         # API Route Definitions
│   │   └── services/       # Email & Helper Services
│   └── server.js           # Entry Point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/       # Login/Register components
│   │   │   ├── Charts/     # Dashboard Visualizations
│   │   │   ├── Dashboard/  # Role-based Dashboards
│   │   │   ├── Invoices/   # Invoice Generation
│   │   │   └── Payment/    # Stripe Elements
│   │   ├── services/       # Axios API consumers
│   │   └── styles/         # Global styles
│   └── vite.config.js
```
</details>

---

## 📡 API Documentation

Base URL: `http://localhost:5000/api`

### 🔐 Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new Customer/Provider |
| `POST` | `/auth/login` | Authenticate user & retrieve Token |

### 📦 Orders
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders` | Customer | Create a new water order |
| `GET` | `/orders/my-orders`| Customer | View personal order history |
| `PUT` | `/orders/:id/status`| Provider | Update status (Accept/Reject) |

### 💳 Payments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/payments/create-intent` | Initialize Stripe transaction |
| `POST` | `/payments/webhook` | Listen for payment success events |

---

## 👨‍💻 Development Team

Proudly built by students of **North-West University (Mahikeng Campus)**.

| Name | Role | Links |
| :--- | :--- | :--- |
| **Bheki Mogola** | Backend Lead & Architecture | [![LinkedIn](https://img.shields.io/badge/LinkedIn-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/bheki-mogola-8481122b7/) |
| **Karabo Makau** | Frontend Lead & UI/UX | [![LinkedIn](https://img.shields.io/badge/LinkedIn-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/karabo-makau-399398221/) |
| **Potego Sethwape** | Documentation & QA | [![LinkedIn](https://img.shields.io/badge/LinkedIn-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/potegosethwape/) |

---

## 🤝 Contributing

We welcome contributions to improve hydration access!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>B
