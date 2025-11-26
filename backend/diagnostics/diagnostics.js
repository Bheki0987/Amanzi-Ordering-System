const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if required files exist
function checkFileIntegrity() {
  log('\n📁 FILE INTEGRITY CHECK', 'cyan');
  log('='.repeat(50), 'cyan');
  
  const baseDir = path.join(__dirname, '..');
  const requiredFiles = [
    'src/server.js',
    'src/app.js',
    'src/config/db.js',
    'src/config/stripe.js',
    'src/models/User.js',
    'src/models/Order.js',
    'src/controllers/authController.js',
    'src/controllers/orderController.js',
    'src/controllers/paymentController.js',
    'src/routes/authRoutes.js',
    'src/routes/orderRoutes.js',
    'src/routes/paymentRoutes.js',
    'src/middleware/authMiddleware.js',
    '.env',
    'package.json'
  ];

  let allFilesExist = true;

  requiredFiles.forEach(file => {
    const filePath = path.join(baseDir, file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file} - NOT FOUND`, 'red');
      allFilesExist = false;
    }
  });

  return allFilesExist;
}

// Check environment variables
function checkEnvironmentVariables() {
  log('\n🔐 ENVIRONMENT VARIABLES CHECK', 'cyan');
  log('='.repeat(50), 'cyan');

  const requiredEnvVars = [
    'MONGODB_URI',
    'PORT',
    'JWT_SECRET',
    'JWT_EXPIRE',
    'STRIPE_SECRET_KEY',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'FRONTEND_URL'
  ];

  let allEnvVarsSet = true;

  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      const value = envVar.includes('SECRET') || envVar.includes('PASSWORD') 
        ? '***HIDDEN***' 
        : process.env[envVar];
      log(`✅ ${envVar}: ${value}`, 'green');
    } else {
      log(`❌ ${envVar} - NOT SET`, 'red');
      allEnvVarsSet = false;
    }
  });

  return allEnvVarsSet;
}

// Test MongoDB connection
async function testDatabaseConnection() {
  log('\n🗄️  DATABASE CONNECTION TEST', 'cyan');
  log('='.repeat(50), 'cyan');

  try {
    log('Attempting to connect to MongoDB...', 'yellow');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000
    });

    log(`✅ MongoDB Connected: ${mongoose.connection.host}`, 'green');
    log(`✅ Database: ${mongoose.connection.name}`, 'green');
    
    // Test a simple query
    const User = require('../src/models/User');
    const userCount = await User.countDocuments();
    log(`✅ Users in database: ${userCount}`, 'green');
    
    await mongoose.connection.close();
    return true;
  } catch (error) {
    log(`❌ MongoDB Connection Failed: ${error.message}`, 'red');
    return false;
  }
}

// Test Stripe configuration
async function testStripeConnection() {
  log('\n💳 STRIPE CONFIGURATION TEST', 'cyan');
  log('='.repeat(50), 'cyan');

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Test retrieving account info
    const account = await stripe.accounts.retrieve();
    log(`✅ Stripe Connected: ${account.email || 'N/A'}`, 'green');
    log(`✅ Account ID: ${account.id}`, 'green');
    
    return true;
  } catch (error) {
    log(`❌ Stripe Connection Failed: ${error.message}`, 'red');
    return false;
  }
}

// Test email configuration
async function testEmailConnection() {
  log('\n📧 EMAIL CONFIGURATION TEST', 'cyan');
  log('='.repeat(50), 'cyan');

  try {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.verify();
    log('✅ Email server connection successful', 'green');
    return true;
  } catch (error) {
    log(`❌ Email Connection Failed: ${error.message}`, 'red');
    return false;
  }
}

// Check dependencies
function checkDependencies() {
  log('\n📦 DEPENDENCIES CHECK', 'cyan');
  log('='.repeat(50), 'cyan');

  const packageJson = require('../package.json');
  const requiredDeps = [
    'express',
    'mongoose',
    'bcryptjs',
    'jsonwebtoken',
    'cors',
    'dotenv',
    'stripe',
    'nodemailer'
  ];

  let allDepsInstalled = true;

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      try {
        require(dep);
        log(`✅ ${dep} - v${packageJson.dependencies[dep]}`, 'green');
      } catch (error) {
        log(`❌ ${dep} - NOT INSTALLED`, 'red');
        allDepsInstalled = false;
      }
    } else {
      log(`❌ ${dep} - NOT IN package.json`, 'red');
      allDepsInstalled = false;
    }
  });

  return allDepsInstalled;
}

// Run all diagnostics
async function runDiagnostics() {
  log('\n' + '='.repeat(50), 'blue');
  log('🔍 AMANZI ORDERING SYSTEM - BACKEND DIAGNOSTICS', 'blue');
  log('='.repeat(50) + '\n', 'blue');

  const results = {
    fileIntegrity: false,
    envVars: false,
    dependencies: false,
    database: false,
    stripe: false,
    email: false
  };

  // Run all checks
  results.fileIntegrity = checkFileIntegrity();
  results.envVars = checkEnvironmentVariables();
  results.dependencies = checkDependencies();
  results.database = await testDatabaseConnection();
  results.stripe = await testStripeConnection();
  results.email = await testEmailConnection();

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  log('📊 DIAGNOSTIC SUMMARY', 'blue');
  log('='.repeat(50), 'blue');

  const checks = [
    ['File Integrity', results.fileIntegrity],
    ['Environment Variables', results.envVars],
    ['Dependencies', results.dependencies],
    ['Database Connection', results.database],
    ['Stripe Configuration', results.stripe],
    ['Email Configuration', results.email]
  ];

  checks.forEach(([name, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    const color = passed ? 'green' : 'red';
    log(`${status} - ${name}`, color);
  });

  const allPassed = Object.values(results).every(r => r === true);
  
  log('\n' + '='.repeat(50), 'blue');
  if (allPassed) {
    log('🎉 ALL CHECKS PASSED! System is ready.', 'green');
  } else {
    log('⚠️  SOME CHECKS FAILED. Please review errors above.', 'yellow');
  }
  log('='.repeat(50) + '\n', 'blue');

  process.exit(allPassed ? 0 : 1);
}

// Run diagnostics
runDiagnostics().catch(error => {
  log(`\n❌ Diagnostic script error: ${error.message}`, 'red');
  process.exit(1);
});