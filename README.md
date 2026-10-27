\# KalaKart — Handmade Indian Crafts Marketplace



\## 1. Project Overview



KalaKart is a full-stack e-commerce web application designed to showcase handmade Indian crafts and traditional artisan products. It provides a digital marketplace where users can explore products, add items to their shopping cart, place orders and submit custom product requests.



The project aims to promote Indian handicrafts and give traditional artisans a digital platform to display their work.



\## 2. Key Features



- User authentication: Sign up with validation, secure login with password hashing (scrypt), JWT sessions, and instant sign out.
- Customer account & profile management: update delivery address and contact details with real-time MongoDB persistence.
- Order history tracking: logged-in customers can view past orders, order status, item breakdown, and delivery address.
- Browse handmade products with images, descriptions, prices and available stock.
- View product details.
- Add products to the shopping cart.
- Proceed through the checkout and order-creation flow (with auto-filled customer info for logged-in users).
- Store orders, users, and product information in MongoDB.
- Update product stock and customer address after successful order creation.
- Submit custom product requests linked to user profile.
- Retrieve product data through REST API endpoints.



\## 3. Technology Stack



\### Frontend

\- React

\- Vite

\- JavaScript

\- HTML and CSS



\### Backend

\- Node.js

\- Express.js

\- REST APIs



\### Database

\- MongoDB

\- Mongoose



\## 4. Project Structure



```text

KalaKart/

├── client/             # React frontend

│   ├── public/

│   │   └── images/     # Local product images

│   └── src/            # Frontend source code

├── server/             # Node.js backend

│   ├── models/         # MongoDB/Mongoose models

│   ├── routes/         # API routes

│   ├── scripts/        # Utility scripts

│   ├── .env            # Local environment configuration

│   └── server.js       # Backend entry point

└── README.md

```



Note: The exact contents of the folders may vary according to the current project files.



\## 5. Prerequisites



\- Node.js and npm

\- MongoDB Community Server running locally

\- A modern web browser



\## 6. Installation and Setup



\### Backend



Open a terminal and navigate to the server directory:



```bash

cd server

npm install

```



Configure the `server/.env` file:



```env

PORT=5000

MONGODB\_URI=mongodb://127.0.0.1:27017/kalakart

```



Start the backend:



```bash

npm run dev

```



The API runs on `http://localhost:5000`.



\### Frontend



Open a separate terminal:



```bash

cd client

npm install

npm run dev

```



Open the local URL displayed by Vite, normally `http://localhost:5173/`.



\## 7. Database



The application uses MongoDB to store product data, orders and custom requests.



Product information includes fields such as name, description, price, category, image, stock, artisan and region.



The backend uses Mongoose models to interact with the database.



\## 8. API Verification



The backend health endpoint can be checked at:



`http://localhost:5000/api/health`



A successful response confirms that the API is running and the database connection is available.



Product retrieval can be checked at:



`http://localhost:5000/api/products`



\## 9. Testing Performed



The following core workflows have been manually tested:



\- Homepage and product image display

\- Product details

\- Shopping cart

\- Checkout and order creation

\- Product stock updates

\- Custom product request submission

\- Backend health and database connectivity

\- Product retrieval through the API



Further edge-case testing is recommended before final submission.



\## 10. Limitations and Future Enhancements



- Integrate a payment gateway (e.g. Razorpay or Stripe).
- Introduce an artisan and administrator management dashboard.
- Deploy the application to a production hosting environment.
- Add additional end-to-end automated UI tests.



\## 11. Conclusion



KalaKart demonstrates the development of a full-stack e-commerce application using React, Node.js, Express and MongoDB. It connects a user-friendly frontend with backend APIs and persistent database storage to support product browsing, order processing and custom product requests.

