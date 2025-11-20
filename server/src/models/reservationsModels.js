const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reservation = sequelize.define('Reservation', {
  guestName:  { type: DataTypes.STRING,  allowNull: false },
  guestEmail: { type: DataTypes.STRING,  allowNull: false },
  dateFrom:   { type: DataTypes.DATEONLY, allowNull: false },
  dateTo:     { type: DataTypes.DATEONLY, allowNull: false },
  status:     { type: DataTypes.STRING,  defaultValue: 'confirmed' },
}, {
  tableName: 'reservations',
  timestamps: false,
});

module.exports = Reservation;