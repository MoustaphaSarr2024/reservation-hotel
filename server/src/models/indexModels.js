const sequelize = require('../config/db');
const Room = require('./roomsModels');
const Reservation = require('./reservationsModels');
const Admin = require('./adminModels');

Room.hasMany(Reservation, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Reservation.belongsTo(Room, { foreignKey: 'roomId' });

async function sync() {
  await sequelize.authenticate();

  const isPostgres = sequelize.getDialect() === 'postgres';

  if (isPostgres) {
    try {
      await sequelize.query('CREATE EXTENSION IF NOT EXISTS btree_gist;');
    } catch (err) {
      console.warn('Warning: Could not enable btree_gist extension. Exclusion constraint might fail.', err.message);
    }
  }

  await sequelize.sync({ force: false });

  if (isPostgres) {
    try {
      await sequelize.query(`
        ALTER TABLE reservations
        ADD CONSTRAINT no_overlap
        EXCLUDE USING gist (
          "roomId" WITH =,
          daterange("dateFrom", "dateTo", '[]') WITH &&
        )
        WHERE (status = 'confirmed');
      `);
      console.log('Constraint no_overlap added successfully.');
    } catch (err) {
      if (err.original && err.original.code === '42710') {
        console.log('Constraint no_overlap already exists.');
      } else {
        console.error('Error adding constraint:', err);
      }
    }
  }
}
module.exports = { sequelize, Room, Reservation, sync };