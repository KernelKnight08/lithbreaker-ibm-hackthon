const { connectToBillingDB } = require('./database');
const { logInfo } = require('../../utils/logger');

function processPayment(userId, amount) {
    const db = connectToBillingDB();
    logInfo('Billing', Processing {amount} for user  via );
    return { status: 'success', transactionId: Math.random().toString(36).substring(7) };
}
module.exports = { processPayment };
