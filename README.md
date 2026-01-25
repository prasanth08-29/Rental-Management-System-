# AEON CARE - Rental Management System

A comprehensive MERN stack application designed for managing homecare equipment rentals (e.g., hospital beds, oxygen concentrators). It streamlines the entire rental lifecycle from product inventory and booking to agreement generation and administrative oversight.

## 🚀 Key Features

*   **Dashboard & Analytics**: Real-time overview of active rentals, total revenue, available stock, and monthly rental trends.
*   **Rental Management**: 
    *   Create and manage rental bookings.
    *   Track rental periods, security deposits, and delivery charges.
    *   **Automated Agreement Generation**: Generates professional PDF rental agreements with dynamic customer and product details.
*   **Product Inventory**: Manage equipment details, pricing, stock levels, and specifications.
*   **Agreement Template Editor**: Fully customizable HTML-based agreement templates with a rich text editor.
*   **User Management**: Role-based access control (Admin/User) with secure authentication.
*   **Security & UX**: 
    *   JWT-based authentication.
    *   Password visibility toggles.
    *   Responsive and modern UI with glassmorphism design elements.
    *   Form validation and optimized print layouts.

## 🛠️ Tech Stack

*   **Frontend**: React.js (Vite), Lucide React (Icons), React Router, Axios
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Atlas)
*   **Tools**: PDF Generation (html2pdf.js), Rich Text Editor (React Quill)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/YOUR_USERNAME/rental-management-system.git
    cd rental-management-system
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    # Create .env file with: PORT, MONGODB_URI, JWT_SECRET, FRONTEND_URL
    npm start
    ```

3.  **Setup Frontend**
    ```bash
    cd rental-frontend
    npm install
    # Create .env file with: VITE_API_URL=http://localhost:5000/api
    npm run dev
    ```

## 📝 License

This project is proprietary software of Axium Health Solutions Pvt Ltd.
