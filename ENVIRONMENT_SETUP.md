# 🔧 Environment Variables Setup

## 🚨 Current Issues & Solutions

### AdSense 400 Errors ✅ FIXED
The AdSense errors are now handled gracefully. To enable ads:

1. **Get AdSense Account**:
   ```
   Visit: https://adsense.google.com
   Apply and get approved
   Get your client ID: ca-pub-xxxxxxxxx
   ```

2. **Add to Vercel**:
   ```bash
   npx vercel env add VITE_ADSENSE_CLIENT_ID
   # Enter your client ID: ca-pub-xxxxxxxxx
   
   npx vercel env add VITE_ADSENSE_ENABLED  
   # Enter: true
   ```

### FFmpeg Loading ✅ IMPROVED
Now uses more reliable loading with fallbacks. Errors are expected and handled.

## 📋 Required Environment Variables

### 1. For AI Enhancement (Required)
```bash
npx vercel env add VITE_REPLICATE_API_TOKEN
# Get token from: https://replicate.com/account/api-tokens
# Format: r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. For AdSense (Optional)
```bash
npx vercel env add VITE_ADSENSE_CLIENT_ID
# Format: ca-pub-xxxxxxxxxxxxxxxxx

npx vercel env add VITE_ADSENSE_ENABLED
# Value: true (or false to disable)
```

## 🎯 Quick Fix Commands

### Option 1: Disable AdSense (Recommended for now)
```bash
npx vercel env add VITE_ADSENSE_ENABLED
# Enter: false
npx vercel --prod
```

### Option 2: Enable AdSense (if you have account)
```bash
npx vercel env add VITE_ADSENSE_CLIENT_ID
# Enter: ca-pub-your-actual-client-id

npx vercel env add VITE_ADSENSE_ENABLED  
# Enter: true

npx vercel --prod
```

## ✅ Expected Behavior After Fix

- ❌ No more AdSense 400 errors
- ✅ FFmpeg errors are handled gracefully  
- ✅ AI enhancement works (with API token)
- ✅ Fallback processing works (without API token)
- ✅ AdSense shows placeholders when disabled

## 🔄 Deploy After Configuration

After setting environment variables:
```bash
npx vercel --prod
```

Your app will be updated with the fixes! 🚀 