# JWT Authentication - How It Works & Security Explained

## 🔐 What is JWT?

**JWT (JSON Web Token)** is a compact, URL-safe token format used to securely transmit information between parties. Think of it as a **digital ID card** that proves who you are without needing to check a database every time.

---

## 📦 JWT Structure

A JWT consists of three parts separated by dots (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ODk0NzIxMjM0NTY3OCIsImVtYWlsIjoiYWRtaW5Ac3RvY2tzeW5jLmNvbSIsInJvbGUiOiJhZG1pbiJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Part 1: Header
```json
{
  "alg": "HS256",  // Algorithm used (HMAC SHA256)
  "typ": "JWT"     // Type of token
}
```
**Purpose**: Tells the server how to verify the token signature.

### Part 2: Payload (Claims)
```json
{
  "id": "658947212345678",
  "email": "admin@stocksync.com",
  "role": "admin",
  "iat": 1703123456,  // Issued at (timestamp)
  "exp": 1703209856   // Expiration (timestamp)
}
```
**Purpose**: Contains the user information and metadata.

### Part 3: Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```
**Purpose**: Proves the token hasn't been tampered with.

---

## 🔄 How JWT Authentication Works in StockSync

### Step-by-Step Flow

#### 1. **User Login** 🔑
```
User → Frontend: Enters email/password
Frontend → Backend: POST /api/users/login { email, password }
```

#### 2. **Backend Validates Credentials** ✅
```
Backend:
  1. Finds user in database by email
  2. Compares password hash with bcrypt
  3. If valid → Generate JWT tokens
```

#### 3. **Token Generation** 🎫
```javascript
// Backend creates token payload
const payload = {
  id: user._id,
  email: user.email,
  role: user.role
};

// Signs token with secret key
const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
```

#### 4. **Token Storage** 💾
```
Backend → Frontend: Returns { accessToken, refreshToken, user }
Frontend: Stores tokens in localStorage
```

#### 5. **Making Authenticated Requests** 📡
```
Frontend → Backend: GET /api/warehouses
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 6. **Token Verification** 🔍
```
Backend Middleware:
  1. Extracts token from Authorization header
  2. Verifies signature using JWT_SECRET
  3. Checks expiration (exp claim)
  4. Extracts user info from payload
  5. Optionally: Verifies user still exists in database
  6. Attaches user to request object
```

#### 7. **Token Expiration & Refresh** 🔄
```
If accessToken expired (401 response):
  1. Frontend detects 401 error
  2. Automatically calls /api/users/refresh with refreshToken
  3. Backend validates refreshToken
  4. Backend issues new accessToken and refreshToken
  5. Frontend retries original request with new token
```

---

## 🛡️ How JWT Secures Your Application

### 1. **Signature Verification** ✍️

**How it works:**
- Every token is signed with a secret key (`JWT_SECRET`)
- The signature is calculated from: `header + payload + secret`
- If anyone modifies the token, the signature won't match

**Security Benefit:**
```
❌ OLD WAY: userId in header/query
   - Anyone can change userId to access other users' data
   - No way to verify the userId is legitimate

✅ JWT WAY: Signed token
   - If token is modified → signature invalid → request rejected
   - Only server with JWT_SECRET can create valid tokens
```

**Example Attack Prevention:**
```javascript
// Attacker tries to change role from "user" to "admin"
// Original token: { role: "user", ... }
// Modified token: { role: "admin", ... }

// Backend verification:
const decoded = jwt.verify(modifiedToken, JWT_SECRET);
// ❌ FAILS! Signature doesn't match → Request rejected
```

---

### 2. **Token Expiration** ⏰

**How it works:**
- Access tokens expire after 24 hours
- Refresh tokens expire after 7 days
- Expired tokens are automatically rejected

**Security Benefit:**
```
❌ OLD WAY: userId never expires
   - If token is stolen, attacker has permanent access
   - No way to revoke access without changing user ID

✅ JWT WAY: Time-limited tokens
   - Stolen token only works until expiration
   - Limits damage window
   - Refresh tokens allow seamless re-authentication
```

**Example:**
```javascript
// Token payload includes expiration
{
  "id": "123",
  "email": "user@example.com",
  "exp": 1703209856  // Expires: Jan 21, 2024 10:30 AM
}

// After expiration:
jwt.verify(token, JWT_SECRET);
// ❌ Error: "Token expired" → Request rejected
```

---

### 3. **Stateless Authentication** 🚀

**How it works:**
- Token contains all necessary user information
- Server doesn't need to store session data
- Each request is independent

**Security Benefit:**
```
❌ OLD WAY: Server-side sessions
   - Requires database lookup on every request
   - Session storage can be compromised
   - Scaling issues with session storage

✅ JWT WAY: Stateless tokens
   - No server-side storage needed
   - Can verify token without database lookup
   - Better scalability
   - Reduced attack surface
```

---

### 4. **Tamper Detection** 🔒

**How it works:**
- Signature is cryptographically linked to token content
- Any modification breaks the signature
- Server immediately detects tampering

**Security Benefit:**
```javascript
// Attacker tries to modify token
Original: { role: "user" }
Modified: { role: "admin" }

// Verification process:
const decoded = jwt.verify(modifiedToken, JWT_SECRET);
// ❌ FAILS! Signature verification fails
// Server rejects request with 401 Unauthorized
```

---

### 5. **Role-Based Access Control (RBAC)** 👥

**How it works:**
- User role is embedded in token payload
- Backend extracts role without database lookup
- Middleware enforces role-based permissions

**Security Benefit:**
```javascript
// Token payload
{
  "id": "123",
  "role": "agent de reception"  // Role in token
}

// Backend middleware
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Access denied' });
}
```

---

## 🔐 Security Comparison: Old vs New

### ❌ OLD METHOD (userId-based)

**How it worked:**
```javascript
// Frontend sends userId in header
headers: { 'X-User-ID': '658947212345678' }

// Backend trusts userId
const user = await User.findById(userId);
```

**Security Issues:**
1. **No Verification**: Anyone can send any userId
2. **No Expiration**: Access never expires
3. **Easy to Spoof**: Attacker can change userId in browser DevTools
4. **No Integrity Check**: Can't verify userId hasn't been modified
5. **Database Dependency**: Must check database on every request

**Attack Example:**
```javascript
// Attacker in browser console:
localStorage.setItem('user', JSON.stringify({ id: 'admin_user_id' }));

// Next request uses admin userId → Full access! ❌
```

---

### ✅ NEW METHOD (JWT-based)

**How it works:**
```javascript
// Frontend sends signed token
headers: { 'Authorization': 'Bearer eyJhbGci...' }

// Backend verifies signature
const decoded = jwt.verify(token, JWT_SECRET);
```

**Security Benefits:**
1. **Signature Verification**: Can't create valid token without secret
2. **Automatic Expiration**: Tokens expire after 24h
3. **Tamper-Proof**: Any modification invalidates token
4. **Stateless**: No database lookup needed for verification
5. **Role Embedded**: Role in token, can't be changed

**Attack Prevention:**
```javascript
// Attacker tries to modify token in browser:
// Token: { role: "user" } → { role: "admin" }

// Backend verification:
jwt.verify(modifiedToken, JWT_SECRET);
// ❌ FAILS! Signature doesn't match
// Request rejected with 401 Unauthorized ✅
```

---

## 🎯 Security Layers in StockSync

### Layer 1: Password Security
```
User Password → bcrypt Hash → Stored in Database
```
- Passwords never stored in plain text
- bcrypt hashing with salt
- Even if database is compromised, passwords are safe

### Layer 2: Token Generation
```
Valid Credentials → JWT Token (signed with secret)
```
- Only valid login creates tokens
- Secret key known only to server
- Tokens contain user identity and role

### Layer 3: Token Transmission
```
Frontend → HTTPS → Backend
```
- Tokens sent over encrypted connection
- Authorization header (not visible in URL)
- Automatic token refresh for seamless UX

### Layer 4: Token Verification
```
Request → Middleware → Verify Signature → Check Expiration → Extract User
```
- Every request verified
- Expired tokens rejected
- Invalid tokens rejected
- User info extracted from token

### Layer 5: Role-Based Authorization
```
Authenticated User → Check Role → Allow/Deny Access
```
- Role embedded in token
- Backend enforces permissions
- Unauthorized access blocked

---

## 🔒 Security Best Practices Implemented

### ✅ What We've Implemented

1. **Strong Secret Key**
   ```env
   JWT_SECRET=your_strong_random_secret_key_here
   ```
   - Should be long, random, and kept secret
   - Never commit to version control

2. **Token Expiration**
   - Access tokens: 24 hours
   - Refresh tokens: 7 days
   - Limits damage if token is stolen

3. **Automatic Token Refresh**
   - Seamless user experience
   - No need to re-login frequently
   - Refresh tokens rotated on use

4. **HTTPS Required** (in production)
   - Tokens transmitted over encrypted connection
   - Prevents man-in-the-middle attacks

5. **Token Storage**
   - Stored in localStorage (client-side)
   - Cleared on logout
   - Not accessible to other domains

---

## ⚠️ Security Considerations

### Current Implementation (Good for Development)

**localStorage Storage:**
- ✅ Simple to implement
- ✅ Works across browser tabs
- ⚠️ Vulnerable to XSS attacks
- ⚠️ Accessible to JavaScript

### Production Recommendations

1. **HttpOnly Cookies** (Better for Production)
   ```javascript
   // Set token in httpOnly cookie
   res.cookie('accessToken', token, {
     httpOnly: true,  // Not accessible to JavaScript
     secure: true,    // Only over HTTPS
     sameSite: 'strict'
   });
   ```
   - Not accessible to JavaScript (XSS protection)
   - Automatically sent with requests
   - More secure than localStorage

2. **Token Blacklisting**
   - Store invalidated tokens in Redis
   - Check blacklist on each request
   - Allows immediate logout/revocation

3. **Rate Limiting**
   - Limit login attempts (prevent brute force)
   - Limit token refresh requests
   - Protect against DoS attacks

4. **Token Rotation**
   - Issue new refresh token on each refresh
   - Invalidate old refresh token
   - Limits damage if refresh token is stolen

---

## 🧪 Security Testing Examples

### Test 1: Token Tampering
```javascript
// Try to modify token
const token = localStorage.getItem('accessToken');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
payload.role = 'admin';  // Try to change role
parts[1] = btoa(JSON.stringify(payload));
const modifiedToken = parts.join('.');

// Try to use modified token
fetch('/api/warehouses', {
  headers: { 'Authorization': `Bearer ${modifiedToken}` }
});
// ❌ Result: 401 Unauthorized (signature invalid)
```

### Test 2: Expired Token
```javascript
// Wait 24+ hours or manually expire token
// Make request with expired token
fetch('/api/warehouses', {
  headers: { 'Authorization': `Bearer ${expiredToken}` }
});
// ❌ Result: 401 Unauthorized (token expired)
// ✅ Frontend automatically refreshes token
```

### Test 3: Invalid Token
```javascript
// Try to use random string as token
fetch('/api/warehouses', {
  headers: { 'Authorization': 'Bearer invalid_token_123' }
});
// ❌ Result: 401 Unauthorized (invalid token)
```

---

## 📊 Security Comparison Table

| Feature | Old Method (userId) | New Method (JWT) |
|---------|-------------------|------------------|
| **Verification** | ❌ None | ✅ Cryptographic signature |
| **Expiration** | ❌ Never | ✅ 24h access, 7d refresh |
| **Tamper-Proof** | ❌ No | ✅ Yes (signature) |
| **Stateless** | ⚠️ Partial | ✅ Fully stateless |
| **Role Security** | ❌ Can be spoofed | ✅ Embedded & verified |
| **Database Lookup** | ✅ Required | ⚠️ Optional (for user existence) |
| **Scalability** | ⚠️ Limited | ✅ Excellent |
| **Revocation** | ⚠️ Difficult | ⚠️ Requires blacklist |

---

## 🎓 Summary

### Why JWT is More Secure:

1. **Cryptographic Signature**: Can't forge tokens without secret key
2. **Time-Limited**: Tokens expire automatically
3. **Tamper-Proof**: Any modification invalidates token
4. **Stateless**: No server-side session storage needed
5. **Role Embedded**: User role in token, verified on each request

### Key Security Principles:

- **Never trust client input** → Verify everything
- **Defense in depth** → Multiple security layers
- **Least privilege** → Users only get necessary access
- **Time-limited access** → Tokens expire
- **Secure transmission** → HTTPS in production

---

*Your StockSync application now uses industry-standard JWT authentication with multiple security layers protecting user data and system access.*

