// Server entry point
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Add this line to include order routes
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// Add this line where you define your API routes
const customerRoutes = require('./routes/customerRoutes');
app.use('/api/customers', customerRoutes);

// Add this line for provider routes
const providerRoutes = require('./routes/providerRoutes');
app.use('/api/providers', providerRoutes);

// Import password routes
const passwordRoutes = require('./routes/passwordRoutes');
app.use('/api/password', passwordRoutes);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});