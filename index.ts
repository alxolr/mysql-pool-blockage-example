import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { pool, PoolConnection } from './src/mysql2-pool';

/**
 * Create the express application
 */
const app = express();

/**
 * Attach middleware to get a connection from the pool and attach it to the req.app object
 */
app.use((req, _res, next) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return next(err);
    }
    req.app.set('connection', connection);

    next();
  });
});

/**
 * Attach middleware to release back to the pool the connection once the request is closed
 */
app.use((req, _res, next) => {
  req.once('close', () => {
    const connection = req.app.get('connection');
    if (connection) {
      connection.release();
    }
  });
  next();
});

app.use('/', (req, res, next) => {
  const connection: PoolConnection = req.app.get('connection');
  connection.query('SELECT 1 + 1 as two', (err, result) => {
    if (err) {
      return next(err);
    }

    res.json(result);
  });
});

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000/');
});
