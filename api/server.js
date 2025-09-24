const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
prisma.$connect().catch(() => process.exit(1));

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'segredo-super-seguro',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(express.static(path.join(__dirname, '../web')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

const routes = require('./src/routes');
app.use('/api', routes);

app.listen(3000, () => {
  console.log('API respondendo em http://localhost:3000');
});