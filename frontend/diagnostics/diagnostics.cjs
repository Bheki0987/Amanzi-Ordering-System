const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.development') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileIntegrity() {
  log('\n📁 FRONTEND FILE INTEGRITY CHECK', 'cyan');
  log('='.repeat(50), 'cyan');

  const baseDir = path.join(__dirname, '..');
  const requiredFiles = [
    'index.html',
    'src/index.jsx',
    'src/App.jsx',
    'src/services/api.js',
    'src/services/authService.js',
    'src/services/orderService.js',
    'src/services/paymentService.js',
    'src/components/Auth/Login.jsx',
    'src/components/Auth/Register.jsx',
    'src/components/Dashboard/CustomerDashboard.jsx',
    'src/components/Dashboard/ProviderDashboard.jsx',
    'package.json',
    'vite.config.js'
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

function checkEnvironmentFiles() {
  log('\n🔐 ENVIRONMENT FILES CHECK', 'cyan');
  log('='.repeat(50), 'cyan');

  const baseDir = path.join(__dirname, '..');
  const envFiles = ['.env.development', '.env.production'];
  let hasEnvFile = false;

  envFiles.forEach(file => {
    const filePath = path.join(baseDir, file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file}`, 'green');
      hasEnvFile = true;
    } else {
      log(`⚠️  ${file} - NOT FOUND`, 'yellow');
    }
  });

  return hasEnvFile;
}

async function testBackendConnection() {
  log('\n🔗 BACKEND CONNECTION TEST', 'cyan');
  log('='.repeat(50), 'cyan');

  const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000/api';

  try {
    const response = await axios.get(`${apiUrl.replace('/api', '')}/`, { timeout: 5000 });
    log(`✅ Backend reachable at ${apiUrl}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Backend not reachable: ${error.message}`, 'red');
    log(`   Make sure backend is running on ${apiUrl}`, 'yellow');
    return false;
  }
}

function checkDependencies() {
  log('\n📦 DEPENDENCIES CHECK', 'cyan');
  log('='.repeat(50), 'cyan');

  const packageJson = require('../package.json');
  const requiredDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    'axios',
    '@stripe/stripe-js',
    '@stripe/react-stripe-js'
  ];

  let allDepsInstalled = true;

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      log(`✅ ${dep} - v${packageJson.dependencies[dep]}`, 'green');
    } else {
      log(`❌ ${dep} - NOT IN package.json`, 'red');
      allDepsInstalled = false;
    }
  });

  return allDepsInstalled;
}

async function runDiagnostics() {
  log('\n' + '='.repeat(50), 'cyan');
  log('🔍 AMANZI ORDERING SYSTEM - FRONTEND DIAGNOSTICS', 'cyan');
  log('='.repeat(50) + '\n', 'cyan');

  const results = {
    fileIntegrity: checkFileIntegrity(),
    envFiles: checkEnvironmentFiles(),
    dependencies: checkDependencies(),
    backend: await testBackendConnection()
  };

  log('\n' + '='.repeat(50), 'cyan');
  log('📊 DIAGNOSTIC SUMMARY', 'cyan');
  log('='.repeat(50), 'cyan');

  Object.entries(results).forEach(([name, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    const color = passed ? 'green' : 'red';
    log(`${status} - ${name}`, color);
  });

  const allPassed = Object.values(results).every(r => r === true);
  log(allPassed ? '\n🎉 ALL CHECKS PASSED!' : '\n⚠️  SOME CHECKS FAILED', allPassed ? 'green' : 'yellow');
}

runDiagnostics();