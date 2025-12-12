# Stock Validation & Error Handling Guide

## Backend Validation Flow

The `/orders/save` endpoint now implements **triple-validation** to prevent negative inventory:

### 1. **First Validation** - Before Order Creation
- Checks if stock is available for all items
- Accounts for reserved stock
- Returns detailed error list if any item fails

### 2. **Second Validation** - Before Order Finalization
- Double-checks current stock levels (prevents race conditions)
- Ensures no other user depleted stock between validations

### 3. **Third Validation** - Before Stock Deduction
- Final verification before actual inventory reduction
- If fails, order is deleted to maintain data integrity

---

## Error Response Format

### Insufficient Stock Error
```json
{
  "success": false,
  "message": "Insufficient stock for one or more items",
  "errors": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Nike Air Max Pro",
      "requested": 5,
      "available": 2,
      "remaining": 2,
      "error": "Insufficient stock for Nike Air Max Pro. Available: 2 units"
    }
  ]
}
```

### Stock Depleted During Checkout
```json
{
  "success": false,
  "message": "Stock verification failed. Inventory may have changed.",
  "errors": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Nike Air Max Pro",
      "requested": 5,
      "available": 0,
      "error": "Stock depleted. Only 0 remaining."
    }
  ]
}
```

---

## Frontend Implementation

### Handle Order Response

```javascript
const handlePlaceOrder = async (orderData) => {
  try {
    const response = await fetch('/orders/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (!data.success) {
      // Handle stock errors
      if (data.errors && data.errors.length > 0) {
        const errorMessage = data.errors
          .map(err => `${err.productName}: ${err.error}`)
          .join('\n');
        
        showPopupNotification({
          type: 'error',
          title: 'Order Failed',
          message: errorMessage,
          details: `Available: ${data.errors.map(e => `${e.productName} (${e.available})`).join(', ')}`
        });
      } else {
        showPopupNotification({
          type: 'error',
          title: 'Order Failed',
          message: data.message
        });
      }
      return;
    }

    // Order successful
    showPopupNotification({
      type: 'success',
      title: 'Order Confirmed!',
      message: `Order #${data.orderId} placed successfully`,
      orderId: data.orderId,
      trackingCode: data.trackingCode
    });

  } catch (error) {
    showPopupNotification({
      type: 'error',
      title: 'Error',
      message: 'Failed to place order. Please try again.'
    });
  }
};
```

### Popup Notification Component Example

```jsx
const StockErrorPopup = ({ errors, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">Order Could Not Be Processed</h2>
        
        <div className="space-y-3 mb-4">
          {errors.map((error, idx) => (
            <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="font-semibold text-gray-800">{error.productName}</p>
              <p className="text-sm text-gray-600">
                Requested: {error.requested} | Available: {error.available}
              </p>
              <p className="text-sm text-red-600 mt-1">{error.error}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Update Cart & Try Again
        </button>
      </div>
    </div>
  );
};
```

---

## API Endpoints Reference

### Validate Stock (Optional - Before Checkout)
```
POST /api/validate-stock
Body: { productSelected: [...] }
Response: { success: true/false, message: string, errors: [...] }
```

### Cancel Order (Restores Stock)
```
POST /orders/:orderId/cancel
Response: { success: true/false, message: string }
```

### View Stock History
```
GET /api/products/:id/stock-history
Response: {
  productId: string,
  productName: string,
  currentStock: number,
  reservedStock: number,
  availableStock: number,
  history: [{ action, quantity, orderId, timestamp }]
}
```

---

## Key Features

✅ **Prevents Negative Stock** - Triple validation ensures inventory never goes below 0
✅ **Handles Race Conditions** - Multiple checks catch simultaneous purchases
✅ **Detailed Error Info** - Shows what user ordered vs. what's available
✅ **Audit Trail** - All stock changes logged in `stock_history`
✅ **Auto-Rollback** - Failed orders automatically deleted with stock restored
