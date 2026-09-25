const { processPayment } = require('../billing/index');
const { logInfo } = require('../../utils/logger');

function checkout(userId, cartTotal) {
    logInfo('Cart', Starting checkout for user );
    const result = processPayment(userId, cartTotal);
    if (result.status === 'success') {
        logInfo('Cart', Checkout complete! Receipt: );
    } else {
        logInfo('Cart', Checkout failed.);
    }
}
module.exports = { checkout };
