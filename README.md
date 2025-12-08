FULL-STACK WEB CHATBOT ASSIGNMENT

PROJECT OVERVIEW:
Build a smart web chatbot that:
- Understands user messages (NLP)
- Shows product deals as image cards
- Shows order history & payment status
- Registers new users
- Uses full-stack architecture (React + Node.js)

FUNCTIONAL REQUIREMENTS:
1. Chatbot Interface:
   - Chat UI with bot/user messages
   - Supports text, buttons, cards, images

2. NLP Intent Detection:
   - Detect intents like: deals, orders, payment, register
   - Example:
        "show deals", "discounts", "offers" → DEALS
        "my orders", "order history" → ORDERS
        "payment status", "pending payment" → PAYMENT
        "register", "new user" → REGISTER

3. Deals Display (with images):
   - Large product image
   - Title
   - Description
   - Price
   - Button

4. User Flow:
   - User enters phone number
   - If new → registration
   - If existing → main menu

5. Main Menu Options:
   1. New Deals
   2. Orders
   3. Payment Status
   4. Others

BACKEND REQUIREMENTS:
- Node.js + Express
- APIs: /register, /login, /deals, /orders, /payments
- NLP logic
- JWT Authentication
- Database: MongoDB/MySQL

FRONTEND REQUIREMENTS:
- React / Next.js
- Chat UI
- API integration
- Deals shown as cards

DATABASE STRUCTURE:
Users:
- userId, name, phone, address, email

Deals:
- dealId, title, description, price, imageURL

Orders:
- orderId, userId, productName, imageURL, status

Payments:
- paymentId, orderId, amountPaid, pendingAmount

DELIVERABLES:
- Full source code (frontend + backend)
- Working chatbot UI
- NLP intent handling
- Deals displayed with images
- README
