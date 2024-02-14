const app = require('./app');
require('dotenv').config();
const bunyan = require('bunyan');

const logger = bunyan.createLogger({ name: 'gr-shop-api' });

let PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  logger.info('Server started on', PORT);
});
