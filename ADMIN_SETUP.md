# Velocity Admin Setup Guide

## Firebase Security Configuration

### 1. Create Admin Account

**Important:** Before setting up Firestore rules, create your admin account first.

1. Go to Firebase Console → Authentication
2. Click "Add user" button
3. Enter admin email: `admin@velocity.com` (or your preferred email)
4. Set a strong password
5. Click "Add user"

**Save your credentials:**
- Email: admin@velocity.com
- Password: [Your chosen password]

---

### 2. Update Firestore Security Rules

1. Go to Firebase Console → Firestore Database
2. Click on the "Rules" tab
3. Copy the rules from `web/firestore.rules` file
4. **IMPORTANT:** Update the admin email in the rules to match your admin account:
   ```javascript
   function isAdmin() {
     return isAuthenticated() && 
            request.auth.token.email in [
              'admin@velocity.com'  // ← Change this to your admin email
            ];
   }
   ```
5. Click "Publish" to activate the rules

---

### 3. Security Rules Explanation

**Public Access:**
- ✅ Anyone can view vehicles (for public rental page)

**Admin Only:**
- ✅ Create new vehicles
- ✅ Update existing vehicles  
- ✅ Delete vehicles

**Authentication Required:**
- ✅ View bookings (users see their own, admins see all)
- ✅ Create bookings (authenticated users only)

---

### 4. Admin Panel Access

**Login URL:** `http://localhost:5173/admin/login`

**Features:**
- 📊 Dashboard with vehicle statistics
- 🚗 Full CRUD operations for vehicles
- 📈 View available vs rented vehicles
- 💰 Average price tracking

---

### 5. Testing the Admin Panel

1. Navigate to: `http://localhost:5173/admin/login`
2. Login with your admin credentials
3. You should see the dashboard with statistics
4. Click "Manage Vehicles" to:
   - Add new vehicles
   - Edit existing vehicles
   - Delete vehicles
   - Toggle availability status

---

### 6. Security Features Implemented

✅ **Firebase Authentication** - Email/password login  
✅ **Protected Routes** - Unauthorized users redirected to login  
✅ **Firestore Rules** - Database-level security  
✅ **Admin-only Operations** - CRUD restricted to admin email  
✅ **Session Management** - Logout functionality  
✅ **Form Validation** - Input sanitization  

---

### 7. Adding More Admins

To add additional admin accounts:

1. Create user in Firebase Authentication
2. Update firestore.rules:
   ```javascript
   function isAdmin() {
     return isAuthenticated() && 
            request.auth.token.email in [
              'admin@velocity.com',
              'admin2@velocity.com',  // Add more emails here
              'manager@velocity.com'
            ];
   }
   ```
3. Publish the updated rules

---

### 8. Production Deployment

When deploying to production:

1. Change admin email to production email
2. Use Firebase CLI to deploy rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. Enable email verification for added security
4. Consider implementing 2FA
5. Monitor Authentication logs regularly

---

## Troubleshooting

**Can't login?**
- Verify admin email matches exactly in Firestore rules
- Check Firebase Authentication console for user existence
- Clear browser cache and try again

**Permission denied errors?**
- Ensure Firestore rules are published
- Verify you're logged in as admin
- Check browser console for specific error messages

**Changes not saving?**
- Check network tab for 403 errors
- Verify Firestore rules allow admin operations
- Ensure Firebase config is correct in firebase.ts

---

## Next Steps

1. Create your admin account in Firebase Authentication
2. Update and publish Firestore rules with your admin email
3. Login at `/admin/login`
4. Start managing your vehicle fleet!
