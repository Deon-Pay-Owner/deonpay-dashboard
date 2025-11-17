# Webhooks API Documentation

## Overview

The Webhooks API allows you to programmatically manage webhooks for your merchant account. All endpoints support two authentication methods:

1. **Session-based authentication** - For dashboard UI (cookies)
2. **API Key authentication** - For programmatic access using secret keys

## Authentication

### Using API Keys (Recommended for external integrations)

Include your secret key in the `Authorization` header:

```bash
Authorization: Bearer sk_test_xxxxxxxxxxxxxx
```

### Using Session (Dashboard UI)

Session authentication is automatic when using the dashboard. Requests must include `merchantId` in query parameters.

## Endpoints

### 1. List All Webhooks

**GET** `/api/webhooks`

List all webhooks for your merchant account.

**Query Parameters:**
- `merchantId` (required for session auth, optional for API key auth)

**Example Request:**
```bash
curl -X GET "https://dashboard.deonpay.mx/api/webhooks?merchantId=xxx" \
  -H "Authorization: Bearer sk_test_xxxxxxxxxxxxxx"
```

**Response:**
```json
{
  "webhooks": [
    {
      "id": "uuid",
      "merchant_id": "uuid",
      "url": "https://example.com/webhook",
      "description": "Production webhook",
      "events": ["payment.succeeded", "payment.failed"],
      "is_active": true,
      "secret": "whsec_xxxxx",
      "created_at": "2025-01-08T10:00:00Z",
      "updated_at": "2025-01-08T10:00:00Z"
    }
  ]
}
```

---

### 2. Create Webhook

**POST** `/api/webhooks`

Create a new webhook endpoint.

**Request Body:**
```json
{
  "url": "https://example.com/webhook",
  "description": "Production webhook",
  "events": ["payment.succeeded", "payment.failed"]
}
```

**Example Request:**
```bash
curl -X POST "https://dashboard.deonpay.mx/api/webhooks" \
  -H "Authorization: Bearer sk_test_xxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/webhook",
    "description": "Production webhook",
    "events": ["payment.succeeded", "payment.failed"]
  }'
```

**Response:**
```json
{
  "webhook": {
    "id": "uuid",
    "merchant_id": "uuid",
    "url": "https://example.com/webhook",
    "description": "Production webhook",
    "events": ["payment.succeeded", "payment.failed"],
    "is_active": true,
    "secret": "whsec_xxxxx",
    "created_at": "2025-01-08T10:00:00Z",
    "updated_at": "2025-01-08T10:00:00Z"
  }
}
```

**Important:** Save the `secret` value - you'll need it to verify webhook signatures.

---

### 3. Get Webhook Details

**GET** `/api/webhooks/{webhookId}`

Get details of a specific webhook including recent delivery events.

**Example Request:**
```bash
curl -X GET "https://dashboard.deonpay.mx/api/webhooks/xxx-xxx-xxx" \
  -H "Authorization: Bearer sk_test_xxxxxxxxxxxxxx"
```

**Response:**
```json
{
  "webhook": {
    "id": "uuid",
    "merchant_id": "uuid",
    "url": "https://example.com/webhook",
    "description": "Production webhook",
    "events": ["payment.succeeded"],
    "is_active": true,
    "secret": "whsec_xxxxx",
    "created_at": "2025-01-08T10:00:00Z",
    "updated_at": "2025-01-08T10:00:00Z"
  },
  "events": [
    {
      "id": "uuid",
      "webhook_id": "uuid",
      "event_type": "payment.succeeded",
      "payload": { ... },
      "response_status": 200,
      "response_body": "OK",
      "attempt_count": 1,
      "delivered": true,
      "delivered_at": "2025-01-08T10:05:00Z",
      "created_at": "2025-01-08T10:05:00Z"
    }
  ]
}
```

---

### 4. Update Webhook

**PATCH** `/api/webhooks/{webhookId}`

Update webhook configuration.

**Request Body:**
```json
{
  "url": "https://example.com/webhook-v2",
  "description": "Updated webhook",
  "events": ["payment.succeeded", "refund.created"],
  "is_active": false
}
```

All fields are optional. Only include fields you want to update.

**Example Request:**
```bash
curl -X PATCH "https://dashboard.deonpay.mx/api/webhooks/xxx-xxx-xxx" \
  -H "Authorization: Bearer sk_test_xxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": false
  }'
```

**Response:**
```json
{
  "webhook": {
    "id": "uuid",
    "merchant_id": "uuid",
    "url": "https://example.com/webhook",
    "description": "Production webhook",
    "events": ["payment.succeeded"],
    "is_active": false,
    "secret": "whsec_xxxxx",
    "created_at": "2025-01-08T10:00:00Z",
    "updated_at": "2025-01-08T12:00:00Z"
  }
}
```

---

### 5. Delete Webhook

**DELETE** `/api/webhooks/{webhookId}`

Permanently delete a webhook. This action cannot be undone.

**Example Request:**
```bash
curl -X DELETE "https://dashboard.deonpay.mx/api/webhooks/xxx-xxx-xxx" \
  -H "Authorization: Bearer sk_test_xxxxxxxxxxxxxx"
```

**Response:**
```json
{
  "success": true
}
```

---

## Available Events

Subscribe to one or more of these events:

### Payment Events
- `payment.succeeded` - Triggered when a payment is successfully completed
- `payment.failed` - Triggered when a payment fails or is rejected

### Refund Events
- `refund.created` - Triggered when a refund is created

### Customer Events
- `customer.created` - Triggered when a new customer is registered (manual creation or auto-creation from checkout)
- `customer.updated` - Triggered when customer information is modified
- `customer.deleted` - Triggered when a customer is deleted

---

## Webhook Payload Structure

When an event occurs, DeonPay will send a POST request to your webhook URL with the following structure:

```json
{
  "id": "evt_xxxxx",
  "type": "payment.succeeded",
  "created": 1234567890,
  "data": {
    "object": {
      // Event-specific data
    }
  }
}
```

**Important Security Headers:**

- `X-Webhook-Signature` - HMAC signature for verification (using your webhook secret)
- `X-Webhook-ID` - Unique event ID
- `Content-Type` - Always `application/json`

---

## Verifying Webhook Signatures

To verify that a webhook came from DeonPay, validate the signature:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return hash === signature;
}

// In your webhook handler:
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);

  if (!verifyWebhookSignature(payload, signature, 'whsec_xxxxx')) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook event
  console.log('Event type:', req.body.type);

  res.status(200).send('OK');
});
```

---

## Retry Logic

If your endpoint fails to respond with a 2xx status code:

1. DeonPay will retry up to **3 times**
2. Retries use **exponential backoff** (1min, 5min, 30min)
3. Events are logged in the webhook detail page
4. You can see retry attempts and responses in the dashboard

**Best Practices:**
- Respond with 2xx as quickly as possible
- Process webhook events asynchronously
- Return 200 even if processing fails (then handle internally)
- Implement idempotency using the event ID

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Missing Authorization header"
}
```

### 403 Forbidden
```json
{
  "error": "No autorizado"
}
```

### 400 Bad Request
```json
{
  "error": "URL inválida"
}
```

### 404 Not Found
```json
{
  "error": "Webhook no encontrado"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error interno del servidor"
}
```

---

## Rate Limits

- **100 requests per minute** per API key
- **1000 webhooks** per merchant account
- **100 events** retained per webhook (30 days)

---

## Testing Webhooks

Use these tools to test your webhook endpoints:

1. **webhook.site** - Generate temporary test URLs
2. **ngrok** - Expose your local server to the internet
3. **Postman** - Test API calls manually

---

## Code Examples

### Node.js / Express

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET; // whsec_xxxxx

  // Verify signature
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== signature) {
    return res.status(401).send('Invalid signature');
  }

  // Process event
  const { type, data } = req.body;

  switch (type) {
    case 'payment.succeeded':
      console.log('Payment succeeded:', data.object);
      // Update your database
      break;
    case 'payment.failed':
      console.log('Payment failed:', data.object);
      // Notify customer
      break;
  }

  res.status(200).send('OK');
});

app.listen(3000);
```

### Python / Flask

```python
import hmac
import hashlib
from flask import Flask, request

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    secret = 'whsec_xxxxx'

    # Verify signature
    payload = request.get_data()
    hash_object = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    )
    expected_signature = hash_object.hexdigest()

    if signature != expected_signature:
        return 'Invalid signature', 401

    # Process event
    event = request.json
    event_type = event['type']

    if event_type == 'payment.succeeded':
        print('Payment succeeded:', event['data'])

    return 'OK', 200

if __name__ == '__main__':
    app.run(port=3000)
```

---

## Support

For questions or issues:
- Check the dashboard logs for webhook delivery status
- Review the event history for each webhook
- Contact support with the event ID for troubleshooting
