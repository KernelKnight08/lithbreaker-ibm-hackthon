const { checkout } = require('./modules/cart/index');
const { logInfo } = require('./utils/logger');

logInfo('Main', 'Initializing Monolith E-Commerce Engine v9.2.1...');
checkout('USER_992', 150.00);
