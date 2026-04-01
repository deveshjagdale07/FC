# Troubleshooting Guide

Quick reference for common issues and solutions.

---

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Database Issues](#database-issues)
3. [Backend Issues](#backend-issues)
4. [Frontend Issues](#frontend-issues)
5. [API Issues](#api-issues)
6. [Authentication Issues](#authentication-issues)
7. [File Upload Issues](#file-upload-issues)
8. [Deployment Issues](#deployment-issues)

---

## Installation Issues

### Issue: npm install fails

**Symptoms:**
```
npm ERR! code E404
npm ERR! 404 Not Found - GET https://registry.npmjs.org/...
```

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Check internet connection:**
   ```bash
   ping registry.npmjs.org
   ```

3. **Try with different registry:**
   ```bash
   npm install --registry https://registry.npmjs.org/
   ```

4. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### Issue: Node version incompatibility

**Symptoms:**
```
npm ERR! The engine "node" is incompatible with this package expected version ">=14.0.0"
```

**Solutions:**

1. **Check current Node version:**
   ```bash
   node --version
   ```

2. **Install NVM (Node Version Manager):**
   ```bash
   # macOS/Linux
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Use it
   nvm install 18
   nvm use 18
   ```

3. **Windows - Use fnm or directly download Node 18:**
   ```powershell
   # Download from nodejs.org or
   winget install OpenJS.NodeJS.LTS
   ```

---

## Database Issues

### Issue: MySQL connection refused

**Symptoms:**
```
error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions:**

1. **Check MySQL is running:**
   ```bash
   # macOS
   brew services list
   
   # Windows
   services.msc (look for MySQL)
   
   # Linux
   sudo systemctl status mysql
   ```

2. **Start MySQL:**
   ```bash
   # macOS
   brew services start mysql
   
   # Windows (in CMD as admin)
   net start MySQL80
   
   # Linux
   sudo systemctl start mysql
   ```

3. **Verify connection details in .env:**
   ```
   DATABASE_URL=mysql://root:password@localhost:3306/farmersDB
   ```

---

### Issue: Database doesn't exist

**Symptoms:**
```
Error: Unknown database 'farmersDB'
```

**Solutions:**

1. **Create database:**
   ```bash
   mysql -u root -p -e "CREATE DATABASE farmersDB;"
   ```

2. **Check if database exists:**
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

3. **Check DATABASE_URL format:**
   - ✅ Correct: `mysql://user:password@localhost:3306/farmersDB`
   - ❌ Wrong: `mysql://user:password@localhost/farmersDB`

---

### Issue: Authentication failed

**Symptoms:**
```
Error: Access denied for user 'root'@'localhost'
```

**Solutions:**

1. **Verify MySQL credentials:**
   ```bash
   mysql -u root -p
   # Enter password when prompted
   ```

2. **Reset root password (macOS/Linux):**
   ```bash
   sudo mysql -u root
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
   FLUSH PRIVILEGES;
   ```

3. **Update .env file:**
   ```
   DATABASE_URL=mysql://root:newpassword@localhost:3306/farmersDB
   ```

---

### Issue: Prisma migration fails

**Symptoms:**
```
Error: The database already contains fields that cannot be null
```

**Solutions:**

1. **Reset database (development only):**
   ```bash
   npx prisma migrate reset
   ```

2. **Resolve conflicts manually:**
   ```bash
   # Check current schema
   mysql -u root -p farmersDB
   SHOW TABLES;
   DESCRIBE users;
   ```

3. **View migration status:**
   ```bash
   npx prisma migrate status
   ```

---

## Backend Issues

### Issue: Backend won't start (npm run dev fails)

**Symptoms:**
```
Error: listen EADDRINUSE :::5000
```

**Solutions:**

1. **Port already in use:**
   ```bash
   # Find process using port 5000
   lsof -i :5000  (macOS/Linux)
   netstat -ano | findstr :5000  (Windows)
   
   # Kill process
   kill -9 <PID>
   # Or use different port in .env
   PORT=5001
   ```

2. **Server not starting:**
   ```bash
   # Delete node_modules and reinstall
   rm -rf node_modules
   npm install
   npm run dev
   ```

---

### Issue: Environment variables not loading

**Symptoms:**
```
TypeError: Cannot read property 'JWT_SECRET' of undefined
```

**Solutions:**

1. **Verify .env file exists:**
   ```bash
   ls -la .env
   ```

2. **Check .env format:**
   ```
   # Correct format
   JWT_SECRET=mysecretkey
   DATABASE_URL=mysql://...
   
   # Wrong format
   JWT_SECRET = mysecretkey  (spaces around =)
   "JWT_SECRET"=mysecretkey  (quotes)
   ```

3. **Restart backend:**
   ```bash
   npm run dev
   ```

4. **Verify loading in code:**
   ```javascript
   console.log(process.env.JWT_SECRET) // Should not be undefined
   ```

---

### Issue: CORS errors

**Symptoms:**
```
Access to XMLHttpRequest at 'http://localhost:5000...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solutions:**

1. **Check CORS configuration:**
   ```javascript
   // backend/src/server.js
   app.use(cors({
     origin: 'http://localhost:3000',  // Should match your frontend URL
     credentials: true
   }));
   ```

2. **Update .env:**
   ```
   FRONTEND_URL=http://localhost:3000
   ```

3. **For production:**
   ```
   FRONTEND_URL=https://your-frontend-domain.com
   ```

4. **Restart backend:**
   ```bash
   npm run dev
   ```

---

## Frontend Issues

### Issue: Frontend won't start (npm start fails)

**Symptoms:**
```
npm ERR! code ENOENT
npm ERR! enoent ENOENT: no such file or directory
```

**Solutions:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Clear cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node version (needs 14+):**
   ```bash
   node --version
   ```

---

### Issue: Unable to reach backend API

**Symptoms:**
```
Error: Network Error / Cannot connect to localhost:5000
```

**Solutions:**

1. **Check backend is running:**
   ```bash
   curl http://localhost:5000/api/products
   ```

2. **Check API_URL in .env:**
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

3. **Reload frontend:**
   ```bash
   # Press Ctrl+C in frontend terminal
   npm start
   ```

---

### Issue: Blank page / App not rendering

**Symptoms:**
- White screen
- No console errors visible

**Solutions:**

1. **Check browser console:**
   - Press F12
   - Look for red errors in Console tab

2. **Check React DevTools:**
   - Install React DevTools browser extension
   - Inspect component tree

3. **Clear browser cache:**
   ```bash
   # Press Ctrl+Shift+Delete (Windows)
   # Cmd+Shift+Delete (macOS)
   ```

4. **Check localhost:3000:**
   - Verify frontend is accessible
   - Check for 404 errors

---

### Issue: Styles not applying (Tailwind CSS)

**Symptoms:**
- No colors/spacing/styling visible
- Plain unstyled components

**Solutions:**

1. **Check Tailwind config:**
   ```javascript
   // frontend/tailwind.config.js
   content: [
     "./src/**/*.{js,jsx,ts,tsx}",
   ]
   ```

2. **Check index.css imports:**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. **Rebuild Tailwind:**
   ```bash
   npm run build
   # Then npm start
   ```

---

## API Issues

### Issue: 404 Not Found errors

**Symptoms:**
```
GET /api/products 404 Not Found
```

**Solutions:**

1. **Check API route is defined:**
   - Backend: `src/routes/productRoutes.js`
   - Verify GET `/api/products` exists

2. **Check routes are registered in server.js:**
   ```javascript
   app.use('/api/products', productRoutes);
   ```

3. **Check correct URL:**
   - ✅ Correct: `/api/products`
   - ❌ Wrong: `/products` or `/api/v1/products`

4. **Restart backend:**
   ```bash
   npm run dev
   ```

---

### Issue: 500 Internal Server Error

**Symptoms:**
```
Error: Internal Server Error
```

**Solutions:**

1. **Check backend logs:**
   ```bash
   # Terminal running npm run dev shows error details
   ```

2. **Common causes:**
   - Database not connected
   - Missing environment variable
   - Syntax error in controller

3. **Debug specific endpoint:**
   ```bash
   curl -X GET http://localhost:5000/api/products
   # Look at backend terminal for error
   ```

4. **Check database connection:**
   ```bash
   npx prisma db execute --stdin < /dev/null
   ```

---

### Issue: 401 Unauthorized

**Symptoms:**
```
Error: 401 Unauthorized
```

**Solutions:**

1. **Token not sent:**
   ```javascript
   // Check API service includes token
   const token = localStorage.getItem('token');
   headers.Authorization = `Bearer ${token}`;
   ```

2. **Invalid token:**
   ```bash
   # Logout and login again
   localStorage.removeItem('token');
   # Restart frontend
   ```

3. **Expired token:**
   - Default expiry: 7 days
   - Update in .env: `JWT_EXPIRE=7d`

---

### Issue: 403 Forbidden

**Symptoms:**
```
Error: 403 Forbidden / Access Denied
```

**Solutions:**

1. **Check user role:**
   - Farmer-only route: Logged in as CUSTOMER
   - Admin-only route: Logged in as CUSTOMER/FARMER

2. **Valid roles:**
   - CUSTOMER: Cart, Orders, Reviews, Dashboard
   - FARMER: Products, Farmer Dashboard, Orders
   - ADMIN: Admin Dashboard, User Management

3. **Login with correct role:**
   - Use test account with proper role
   - See TESTING_GUIDE.md for test credentials

---

## Authentication Issues

### Issue: Login fails

**Symptoms:**
```
Error: Invalid email or password
```

**Solutions:**

1. **Check credentials:**
   - Verify email/password in database
   - Use test account: `customer1@example.com` / `Customer@123`

2. **Verify user exists:**
   ```bash
   mysql -u root -p farmersDB
   SELECT email, role FROM users;
   ```

3. **Check password reset:**
   - Feature not yet implemented
   - Create new account to test

---

### Issue: Token not persisting (Logout on refresh)

**Symptoms:**
- Logged in, but logout on page refresh
- AuthContext loses user data

**Solutions:**

1. **Check localStorage:**
   ```javascript
   // Open DevTools Console
   localStorage.getItem('token')
   localStorage.getItem('user')
   ```

2. **Verify AuthContext initialization:**
   ```javascript
   // src/context/AuthContext.js
   // Should read from localStorage on mount
   useEffect(() => {
     const token = localStorage.getItem('token');
     if (token) {
       // Restore user
     }
   }, []);
   ```

3. **Clear and re-login:**
   ```javascript
   localStorage.clear();
   // Reload page and login again
   ```

---

## File Upload Issues

### Issue: Image upload fails

**Symptoms:**
```
Error: File upload failed
```

**Solutions:**

1. **Check file size:**
   - Max: 5MB (configured in .env)
   - Check: `MAX_FILE_SIZE=5242880`

2. **Check file type:**
   - Allowed: `.jpg`, `.jpeg`, `.png`, `.gif`
   - Not allowed: `.pdf`, `.doc`, etc.

3. **Check upload directory permissions:**
   ```bash
   ls -la uploads/
   chmod 755 uploads/
   ```

4. **Check disk space:**
   ```bash
   df -h
   # Ensure free space available
   ```

---

### Issue: Images not displaying

**Symptoms:**
- Image upload succeeds but image shows broken

**Solutions:**

1. **Check image path:**
   ```bash
   ls -la uploads/
   # Should contain uploaded images
   ```

2. **Check backend serves static files:**
   ```javascript
   // server.js
   app.use('/uploads', express.static('uploads'));
   ```

3. **Check full image URL:**
   - Should be: `http://localhost:5000/uploads/filename.jpg`
   - Not: `uploads/filename.jpg`

4. **Verify API response includes full path:**
   ```javascript
   // Product response
   "images": ["http://localhost:5000/uploads/image.jpg"]
   ```

---

## Deployment Issues

### Issue: App crashes after deployment

**Symptoms:**
- Works locally, crashes on server

**Solutions:**

1. **Check logs:**
   ```bash
   # Heroku
   heroku logs --tail
   
   # PM2
   pm2 logs application-name
   ```

2. **Verify environment variables:**
   ```bash
   # Heroku
   heroku config
   
   # Server
   cat .env
   ```

3. **Database connection on production:**
   ```bash
   # Test connection
   mysql -h production-host -u user -p dbname -e "SELECT 1;"
   ```

---

### Issue: HTTPS certificate errors

**Symptoms:**
```
SSL_ERROR_BAD_CERT_DOMAIN
```

**Solutions:**

1. **Verify certificate domain matches:**
   ```bash
   openssl s_client -connect yourdomain.com:443
   ```

2. **Renew certificate:**
   ```bash
   sudo certbot renew
   ```

3. **Check DNS:**
   - Ensure domain points to server IP
   - Wait 24-48 hours for propagation

---

### Issue: Database migrations fail on production

**Symptoms:**
```
Error: Migration failed
```

**Solutions:**

1. **Run migrations manually:**
   ```bash
   # Heroku
   heroku run npx prisma migrate deploy
   
   # Server
   ssh into server
   npx prisma migrate deploy
   ```

2. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```

3. **Backup first:**
   ```bash
   mysqldump -h host -u user -p dbname > backup.sql
   ```

---

## Getting Help

### Debugging Steps (Always do these first)

1. **Restart everything:**
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2
   npm start
   ```

2. **Clear caches:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check logs:**
   - Backend: Terminal running `npm run dev`
   - Frontend: Browser DevTools Console (F12)
   - Database: Check MySQL error logs

4. **Verify configuration:**
   - .env file exists and correct
   - Database connection working
   - All required packages installed

### Additional Resources

- **API Documentation:** See API_DOCUMENTATION.md
- **Database Schema:** See DATABASE_SCHEMA.md
- **Setup Guide:** See SETUP_GUIDE.md
- **Testing Guide:** See TESTING_GUIDE.md
- **Deployment Guide:** See DEPLOYMENT_GUIDE.md

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| ECONNREFUSED | MySQL not running | Start MySQL service |
| EADDRINUSE | Port in use | Kill process or change port |
| ENOENT | File not found | Install dependencies |
| Access denied | Wrong credentials | Update .env |
| Unknown database | Database missing | Create database |
| 404 Not Found | Route not defined | Check routes are registered |
| 401 Unauthorized | No/invalid token | Login again |
| 403 Forbidden | Insufficient permissions | Use correct role |
| CORS blocked | Frontend URL mismatch | Update FRONTEND_URL in .env |

---

End of Troubleshooting Guide

If issue persists after following these steps:
1. Check all documentation files
2. Review error logs in detail
3. Verify configuration step-by-step
4. Try on fresh installation
