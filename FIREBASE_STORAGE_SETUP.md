# Firebase Storage Rules Setup

## Issue
When adding vehicles in the admin panel, if image upload gets stuck, it's likely due to Firebase Storage rules not being configured.

## Solution

### Option 1: Deploy Storage Rules (Recommended)
Deploy the storage rules to Firebase to enable file uploads:

```bash
cd web
firebase deploy --only storage
```

### Option 2: Use Image URLs (Quick Fix)
Instead of uploading files, you can enter image URLs directly:
1. Host your images somewhere (e.g., Imgur, your own server, or use public URLs)
2. In the vehicle form, enter the image URL in the URL input field
3. The preview will show below

### Option 3: Use Public Images
You can use images from the `/public/img` folder:
- `/img/Ford Mustang.png`
- `/img/Land Cruiser.png`
- Or add more images to the public folder

## Admin Access
Make sure you're logged in as `admin@velocity.com` or add your admin email to:
- `web/firestore.rules` (line 13)
- `web/storage.rules` (line 14)

## Troubleshooting
1. Check browser console for error messages
2. Verify you're logged in as an admin user
3. If file upload fails, use the image URL option instead
