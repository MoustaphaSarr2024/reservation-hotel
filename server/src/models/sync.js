require('dotenv').config();
const sequelize = require('../config/db');
const Room = require('./roomsModels');

async function sync() {
  try {
    await sequelize.authenticate();
    console.log('Connection OK');

    await sequelize.sync({ force: false }); 
    console.log('Table rooms synchronisée');

    const count = await Room.count();
    if (count === 0) {
      await Room.bulkCreate([
        { name: 'Baobab', description: 'Vue jardin, RDC', capacity: 2, price: 90 },
        { name: 'Savane', description: 'Vue mer, balcon', capacity: 2, price: 110 },
        { name: 'Sahel', description: 'Clim, lit king', capacity: 2, price: 120 },
        { name: 'Saloum', description: 'Suite familiale', capacity: 4, price: 180 },
        { name: 'Sine', description: 'Chambre pour un couple', capacity: 2, price: 85 },
        { name: 'Casamance', description: 'Duplex, terrasse', capacity: 3, price: 140 },
        { name: 'Diambogne', description: 'Accessible PMR', capacity: 2, price: 95 },
        { name: 'Cap-Vert', description: 'Étage avec un balcon et vue sur la piscine', capacity: 2, price: 130 },
      ]);
      console.log('8 chambres insérées');
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

sync();