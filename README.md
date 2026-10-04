# 🎁 GIFTORA – Handmade & Personalized Gifts

**GIFTORA** is a modern e-commerce web application designed for a handmade and personalized gift shop. The platform provides customers with a simple, attractive, and convenient way to discover, customize, and purchase unique gifts for special occasions.

The system focuses on creating a smooth online shopping experience, from browsing products and viewing product details to managing a shopping cart and completing the checkout process.

---

## 🌸 Project Overview

GIFTORA is designed as an online platform for selling a variety of handmade and personalized gifts, including:

* 🎀 Greeting Cards
* 🔑 Resin Keychains
* 🎁 Gift Boxes
* 🕯️ Handmade Candles
* 🪵 Wooden Gifts
* 🖼️ Photo Frames
* 🎂 Customized Cakes
* ✨ Other Personalized Gifts

The website uses a clean and elegant design with a soft, natural color palette to match the handmade and personalized nature of the products.

---

## ✨ Main Features

### 🛍️ Product Browsing

Customers can:

* Browse available gift products
* View products by category
* Search for products
* Filter products
* View detailed product information
* View product images, prices, and descriptions

### 🛒 Shopping Cart

Customers can:

* Add products to the shopping cart
* View selected products
* Change product quantities
* Remove products from the cart
* View the subtotal
* View delivery charges
* View the final order total

Cart information is maintained using browser local storage.

### 👤 Customer Authentication

The system provides customer authentication features including:

* Customer registration
* Customer login
* Logout
* Customer sessions
* Customer profile management
* Customer dashboard

### 💳 Checkout & Payments

The checkout system allows customers to enter:

* Full name
* Phone number
* Email address
* Delivery address
* Billing address
* Postal code
* Order notes

Customers can select from available payment methods such as:

* 💵 Cash on Delivery
* 🏦 Bank Transfer
* 💳 PayHere

The project also includes **PayHere Sandbox integration** for testing online payments.

### 🧑‍💼 Admin Management

The administrative section provides functionality for managing:

* Products
* Categories
* Customers
* Orders
* Administrator authentication

---

## 🎨 User Interface

GIFTORA follows a clean and modern visual style designed specifically for a handmade gift store.

The interface focuses on:

* Simple navigation
* Attractive product presentation
* Responsive layouts
* Clear product information
* Easy checkout
* Consistent typography
* Soft and natural colors

The design aims to make the shopping experience feel warm, friendly, and suitable for a gift-oriented business.

---

## 🏗️ Project Structure

```text
Gift Shop/
│
├── home.html
├── product_listing.html
├── product_details.html
├── login.html
├── register.html
├── cart.html
├── checkout.html
├── customer_dashboard.html
├── profile.html
│
├── login.css
├── register.css
├── cart.css
├── checkout.css
├── customer_dashboard.css
├── profile.css
│
├── login.js
├── register.js
├── checkout.js
├── customer_dashboard.js
├── profile.js
├── auth.js
│
├── success.html
├── cancel.html
│
├── Logo.png
│
├── shop_images/
│   └── product images
│
└── backend/
    │
    ├── admin/
    │   ├── categories.php
    │   ├── customers.php
    │   ├── login.php
    │   ├── logout.php
    │   ├── orders.php
    │   └── products.php
    │
    ├── api/
    │   ├── change_password.php
    │   ├── check_session.php
    │   ├── register.php
    │   ├── login.php
    │   ├── logout.php
    │   ├── orders.php
    │   ├── payment.php
    │   ├── products.php
    │   ├── profile.php
    │   └── payhere/
    │       └── notify.php
    │
    └── config/
        ├── database.php
        └── session.php
```

---

## 🛠️ Technologies Used

### Frontend

* **HTML5** – Page structure and content
* **CSS3** – Styling and responsive layouts
* **JavaScript** – Client-side functionality and interaction
* **Local Storage** – Maintaining shopping cart data

### Backend

* **PHP** – Server-side processing and APIs
* **MySQL** – Database management
* **PHP Sessions** – Customer authentication and session management

### Payment

* **PayHere Sandbox** – Online payment testing and integration

### Development Environment

* **XAMPP** – Local Apache and MySQL server
* **Git & GitHub** – Version control and project management

---

## 🔄 Customer Shopping Flow

```text
Home Page
    ↓
Browse Products
    ↓
Search / Filter
    ↓
View Product Details
    ↓
Add to Cart
    ↓
View Cart
    ↓
Checkout
    ↓
Enter Delivery Details
    ↓
Select Payment Method
    ↓
Complete Order / Payment
```

---

## 💳 PayHere Payment Flow

For online payment testing, GIFTORA integrates with the PayHere Sandbox environment.

```text
Customer
    ↓
Checkout Page
    ↓
Select PayHere
    ↓
Generate Payment Request
    ↓
PayHere Sandbox
    ↓
Payment
    ↓
Success / Cancel
    ↓
Payment Notification
    ↓
Backend
```

The PayHere integration is intended for development and testing using the Sandbox environment.

---

## 🔐 Security & Validation

The project includes several basic security and validation mechanisms, including:

* HTML form validation
* JavaScript form validation
* PHP server-side processing
* Session-based authentication
* Password handling through the backend
* Validation of customer input
* Payment request verification through the PayHere integration

> **Note:** The current project is a university/development project and should undergo additional security hardening before being used as a production e-commerce platform.

---

## 📱 Responsive Design

GIFTORA is designed to provide a consistent shopping experience across different screen sizes, including:

* 💻 Desktop
* 📱 Mobile
* 📟 Tablet

The layouts adapt to different screen sizes while maintaining usability and readability.

---

## 🚀 Running the Project Locally

### 1. Install XAMPP

Install XAMPP with:

* Apache
* MySQL
* PHP

### 2. Clone the Repository

```bash
git clone <your-repository-url>
```

### 3. Move the Project

Place the project inside the XAMPP `htdocs` directory:

```text
C:\xampp\htdocs\GiftShop
```

### 4. Start XAMPP

Start:

```text
Apache
MySQL
```

### 5. Configure the Database

Create the required MySQL database and configure the database connection in:

```text
backend/config/database.php
```

### 6. Open the Website

Open the project in your browser:

```text
http://localhost/GiftShop/
```

---

## 🧪 Payment Testing

The PayHere integration uses the **PayHere Sandbox** environment for testing.

No real transactions are performed during development.

For testing:

1. Add products to the cart.
2. Go to Checkout.
3. Enter customer and delivery details.
4. Select **PayHere**.
5. Continue to the PayHere Sandbox.
6. Use the Sandbox test payment details provided by PayHere.
7. Verify the success or cancellation flow.

---

## 📌 Current Project Status

| Feature                     | Status                   |
| --------------------------- | ------------------------ |
| Homepage                    | ✅ Completed              |
| Product Listing             | ✅ Completed              |
| Product Details             | ✅ Completed              |
| Product Search & Filtering  | ✅ Completed              |
| Shopping Cart               | ✅ Completed              |
| Customer Registration       | ✅ Completed              |
| Customer Login              | ✅ Completed              |
| Customer Dashboard          | ✅ Completed              |
| Customer Profile            | ✅ Completed              |
| Checkout                    | ✅ Completed              |
| Cash on Delivery            | ✅ Completed              |
| Bank Transfer               | ✅ Completed              |
| PayHere Sandbox Integration | 🚧 In Progress / Testing |
| Admin Product Management    | ✅ Completed              |
| Admin Customer Management   | ✅ Completed              |
| Admin Order Management      | ✅ Completed              |
| Database Integration        | ✅ Completed              |

---

## 🎯 Project Goals

The main goals of GIFTORA are to:

* Provide an easy-to-use online gift shopping platform.
* Make handmade and personalized gifts easier to discover.
* Provide an attractive and user-friendly shopping experience.
* Simplify product browsing and ordering.
* Provide secure customer authentication.
* Provide multiple payment options.
* Provide an administrative system for managing the online store.
* Demonstrate the development of a complete e-commerce web application.

---

## 🔮 Future Improvements

Possible future improvements include:

* ⭐ Product reviews and ratings
* ❤️ Wishlist functionality
* 🎨 Advanced gift customization
* 📧 Email order confirmations
* 📦 Real-time order tracking
* 🔔 Customer notifications
* 💳 Full production payment integration
* 📊 Advanced admin analytics
* 🏷️ Discount and coupon system
* 📱 Progressive Web App (PWA) support

---

## 👩‍💻 Project

**GIFTORA – Handmade & Personalized Gifts**

A university web development project demonstrating the development of a full-stack e-commerce platform using modern web technologies.

---

### 💚 Made with love for every special moment

**GIFTORA — Give something meaningful. 🎁**
