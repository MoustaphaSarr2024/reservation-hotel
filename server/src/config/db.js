const { Sequelize } = require('sequelize');


const url = new URL(process.env.DATABASE_URL);
const sequelize = new Sequelize(url.pathname.slice(1), url.username, url.password, {
  host: url.hostname,
  port: url.port || 5432,
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }
  },
  logging: false,
});

module.exports = sequelize;