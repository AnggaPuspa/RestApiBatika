# Batika API Testing Guide

## Import Collection & Environment

1. **Import Environment:**
   - Open Postman
   - Click "Import" → "Upload Files"
   - Select `postman_environment.json`
   - Set as active environment

2. **Import Collection:**
   - Click "Import" → "Upload Files"  
   - Select `postman_collection.json`

## Running Tests

### Manual Testing
1. Set environment variable `baseUrl` to your API URL (default: `http://localhost:3001`)
2. Run requests in order:
   - Health Check → Supabase Connection
   - Authentication → Register → Login
   - Use returned tokens for protected endpoints

### Automated Testing with Newman

```bash
# Install Newman globally
npm install -g newman

# Run collection with environment
newman run postman_collection.json -e postman_environment.json --reporters cli,html

# Run with specific environment values
newman run postman_collection.json -e postman_environment.json --env-var "baseUrl=http://localhost:3001" --reporters cli,html
```

## Authentication Flow

1. **Register** → Get user ID
2. **Login** → Get access token & refresh token
3. **Create Penjual** → Get penjual ID (for product operations)
4. **Use tokens** for protected endpoints

## Environment Variables

- `baseUrl`: API base URL (default: http://localhost:3001)
- `token`: Access token from login
- `refreshToken`: Refresh token from login  
- `userId`: User ID from register/login
- `penjualId`: Penjual ID from create penjual
- `produkId`: Produk ID from create produk

## Test Coverage

- ✅ All 23 endpoints covered
- ✅ Happy path scenarios
- ✅ Error scenarios (401, 403, 404, 400)
- ✅ Authentication flows
- ✅ CRUD operations
- ✅ Search & filtering
