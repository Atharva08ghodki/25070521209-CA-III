\# KalaKart — API Documentation



\## 1. Project Overview



KalaKart is a handmade Indian crafts e-commerce marketplace. The backend is built using Node.js, Express.js, and MongoDB with Mongoose.



\*\*Base URL:\*\* `http://localhost:5000`



\*\*Database:\*\* MongoDB  

\*\*Database Name:\*\* `kalakart`



\### Technologies Used

\- Node.js

\- Express.js

\- MongoDB

\- Mongoose

\- CORS

\- dotenv



\---



\## 2. Server Health



\### Check API and Database Status



\- \*\*Method:\*\* GET

\- \*\*Endpoint:\*\* `/api/health`



Example:



```http

GET http://localhost:5000/api/health

```



Successful response:



```json

{

&#x20; "status": "ok",

&#x20; "service": "KalaKart API",

&#x20; "database": "connected"

}

```



\---



\## 3. Product APIs



Base endpoint: `/api/products`



\### 3.1 Get All Products



\- \*\*Method:\*\* GET

\- \*\*Endpoint:\*\* `/api/products`



Returns the available products, sorted by featured status and creation date.



Optional query parameters:

\- `search` — search products

\- `category` — filter by category

\- `featured=true` — show featured products



Examples:



```http

GET /api/products

GET /api/products?search=pottery

GET /api/products?category=Home%20Decor

GET /api/products?featured=true

```



\### 3.2 Get Product by ID



\- \*\*Method:\*\* GET

\- \*\*Endpoint:\*\* `/api/products/:id`



Example:



```http

GET /api/products/PRODUCT\_ID

```



Possible responses:

\- `200 OK` — product found

\- `400 Bad Request` — invalid product ID

\- `404 Not Found` — product does not exist



\### 3.3 Create a Product



\- \*\*Method:\*\* POST

\- \*\*Endpoint:\*\* `/api/products`



Example request body:



```json

{

&#x20; "name": "Handmade Clay Vase",

&#x20; "description": "A handcrafted decorative vase",

&#x20; "price": 899,

&#x20; "category": "Home Decor",

&#x20; "image": "/images/clay-vase.jpg",

&#x20; "stock": 10,

&#x20; "featured": false,

&#x20; "artisan": "KalaKart Artisan",

&#x20; "region": "India"

}

```



Required fields: `name`, `price`, and `category`.



Successful response: `201 Created`.



\### 3.4 Update a Product



\- \*\*Method:\*\* PUT

\- \*\*Endpoint:\*\* `/api/products/:id`



Example request body:



```json

{

&#x20; "price": 999,

&#x20; "stock": 8

}

```



The supplied fields are updated, subject to model validation.



Possible responses:

\- `200 OK` — product updated

\- `400 Bad Request` — invalid ID or validation error

\- `404 Not Found` — product does not exist



\### 3.5 Delete a Product



\- \*\*Method:\*\* DELETE

\- \*\*Endpoint:\*\* `/api/products/:id`



Possible responses:

\- `200 OK` — product deleted

\- `400 Bad Request` — invalid product ID

\- `404 Not Found` — product does not exist



\*\*Note:\*\* Product creation, updates, and deletion modify database records.



\---



\## 4. Order APIs



Base endpoint: `/api/orders`



\### 4.1 Place an Order



\- \*\*Method:\*\* POST

\- \*\*Endpoint:\*\* `/api/orders`



Example request body:



```json

{

&#x20; "customer": {

&#x20;   "name": "Demo Customer",

&#x20;   "email": "customer@example.com",

&#x20;   "address": "Pune, Maharashtra, India"

&#x20; },

&#x20; "items": \[

&#x20;   {

&#x20;     "productId": "PRODUCT\_ID",

&#x20;     "quantity": 2

&#x20;   }

&#x20; ]

}

```



Required customer fields:

\- `name`

\- `email`

\- `address`



The `items` array must contain at least one item. Each item requires a valid `productId` and an integer `quantity` of at least 1.



The server retrieves product prices and stock from MongoDB, calculates the total, checks stock availability, decreases stock, and creates the order.



Possible responses:

\- `201 Created` — order placed

\- `400 Bad Request` — invalid or missing input

\- `404 Not Found` — product does not exist

\- `409 Conflict` — insufficient stock



\*\*Important:\*\* This endpoint creates an actual order and can decrease product stock. Use test data carefully.



\### 4.2 Get All Orders



\- \*\*Method:\*\* GET

\- \*\*Endpoint:\*\* `/api/orders`



Returns up to 100 recent orders.



\### 4.3 Get Order by ID



\- \*\*Method:\*\* GET

\- \*\*Endpoint:\*\* `/api/orders/:id`



Possible responses:

\- `200 OK` — order found

\- `400 Bad Request` — invalid order ID

\- `404 Not Found` — order does not exist



\---



\## 5. Custom Request APIs



Base endpoint: `/api/custom-requests`



\### 5.1 Submit a Custom Craft Request



\- \*\*Method:\*\* POST

\- \*\*Endpoint:\*\* `/api/custom-requests`



Example request body:



```json

{

&#x20; "name": "Demo Customer",

&#x20; "email": "customer@example.com",

&#x20; "craft": "Custom Wall Art",

&#x20; "details": "A handmade wall-art piece with a personalized design.",

&#x20; "budget": "₹1500–₹2500"

}

```



Required fields:

\- `name`

\- `email`

\- `craft`

\- `details`



The `budget` field is optional and defaults to `Flexible`.



Successful response: `201 Created`.



\### 5.2 Get All Custom Requests



\- \*\*Method:\*\* GET

\- \*\*Endpoint:\*\* `/api/custom-requests`



Returns up to 100 recent custom requests.



\---



\## 6. Database Models



\### Product



| Field | Type | Description |

|---|---|---|

| name | String | Product name; required |

| description | String | Product description |

| price | Number | Product price; required, minimum 0 |

| category | String | Product category; required |

| image | String | Product image path |

| stock | Number | Available quantity; minimum 0 |

| featured | Boolean | Featured product flag |

| artisan | String | Artisan name |

| region | String | Product region |

| createdAt | Date | Creation timestamp |

| updatedAt | Date | Last update timestamp |



\### Order



| Field | Type | Description |

|---|---|---|

| customer | Object | Customer name, email, and address |

| items | Array | Product reference, name, price, and quantity |

| total | Number | Calculated order total |

| status | String | Placed, Processing, Shipped, Delivered, or Cancelled |

| createdAt | Date | Creation timestamp |

| updatedAt | Date | Last update timestamp |



\### CustomRequest



| Field | Type | Description |

|---|---|---|

| name | String | Customer name; required |

| email | String | Customer email; required |

| craft | String | Requested craft; required |

| details | String | Request details; required |

| budget | String | Budget preference |

| status | String | New, Contacted, In progress, or Completed |

| createdAt | Date | Creation timestamp |

| updatedAt | Date | Last update timestamp |



\---



\## 7. HTTP Status Codes



| Status Code | Meaning |

|---|---|

| 200 | Request successful |

| 201 | Resource created successfully |

| 400 | Invalid input or validation error |

| 404 | Requested resource or route not found |

| 409 | Conflict, such as insufficient stock |

| 500 | Internal server error |



\---



\## 8. Server Configuration



Configuration is stored in `server/.env`.



Example:



```env

PORT=5000

MONGODB\_URI=mongodb://127.0.0.1:27017/kalakart

```



Keep `.env` private. Do not publish database credentials or secrets.



\---



\## 9. Important Notes and Limitations



\- The frontend is a React application served by Vite during development.

\- The backend provides REST API endpoints through Express.js.

\- MongoDB stores products, orders, and custom craft requests.

- Authentication and user session management are implemented via JWT tokens and secure scrypt password hashing (/api/auth).
- Logged-in users have their orders linked directly to their MongoDB account and can view past orders (/api/orders/my-orders).

\- A payment gateway is not implemented in the documented API routes.

\- Product administration endpoints should be protected before public production deployment.

\- Order stock updates and order creation are separate database operations in the current implementation; transaction-based inventory handling would improve reliability.

\- This documentation describes the current backend implementation. Verify responses against the running application before production use.



\---



\*\*Project:\*\* KalaKart  

\*\*Backend:\*\* Node.js, Express.js, MongoDB  

\*\*Documentation Version:\*\* 1.0

