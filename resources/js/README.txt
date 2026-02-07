React conversion for Laravel 8 Products module (Products + Categories + Outstock + Expired)

Drop these files into:
- resources/js/Products/...
- resources/js/utils/api.js
- resources/js/components/Modal.jsx

Expected SPA Routes (React Router):
  /products                -> Products/Index.jsx
  /products/create         -> Products/Create.jsx
  /products/:id/edit       -> Products/Edit.jsx
  /categories              -> Products/Categories.jsx
  /outstock                -> Products/Outstock.jsx
  /expired                 -> Products/Expired.jsx

Expected API endpoints (adjust inside files if your backend differs):
  GET    /api/products
  POST   /api/products
  GET    /api/products/:id
  PUT    /api/products/:id
  DELETE /api/products/:id
  GET    /api/products/outstock
  GET    /api/products/expired

  GET    /api/categories
  POST   /api/categories
  PUT    /api/categories/:id
  DELETE /api/categories/:id

  GET    /api/purchases   (for the "Product" dropdown on create/edit)

CSRF:
Ensure your main Blade layout includes:
  <meta name="csrf-token" content="{{ csrf_token() }}">
