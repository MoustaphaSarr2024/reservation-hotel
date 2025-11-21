require('dotenv').config();
const { sequelize, Room } = require('./models/indexModels');

const roomsData = [
    {
        name: 'Suite Royale',
        description: 'Une suite luxueuse avec vue sur l\'océan, jacuzzi privé et service de chambre 24/7.',
        capacity: 2,
        price: 250.00,
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        name: 'Chambre Deluxe',
        description: 'Spacieuse et élégante, cette chambre offre tout le confort moderne pour un séjour inoubliable.',
        capacity: 2,
        price: 150.00,
        imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        name: 'Chambre Familiale',
        description: 'Idéale pour les familles, avec deux grands lits et un espace de vie convivial.',
        capacity: 4,
        price: 200.00,
        imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        name: 'Suite Présidentielle',
        description: 'Le summum du luxe. Salon séparé, salle à manger, et vue panoramique.',
        capacity: 3,
        price: 450.00,
        imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        name: 'Chambre Standard',
        description: 'Confortable et abordable, parfaite pour les voyageurs d\'affaires ou les courts séjours.',
        capacity: 2,
        price: 90.00,
        imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        name: 'Bungalow Plage',
        description: 'Accès direct à la plage, terrasse privée et ambiance tropicale.',
        capacity: 2,
        price: 180.00,
        imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
];

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Connexion à la base de données réussie.');

        await sequelize.sync({ alter: true });

        const count = await Room.count();
        if (count > 0) {
            console.log('La base de données contient déjà des chambres. Seeding ignoré.');
        } else {
            await Room.bulkCreate(roomsData);
            console.log('Chambres ajoutées avec succès !');

            const Admin = require('./models/adminModels');
            await Admin.create({
                email: process.env.ADMIN_EMAIL || 'admin@kaaydalou.com',
                password: process.env.ADMIN_PASSWORD || 'awadiagne'
            });
            console.log('Admin créé avec succès !');
        }

        process.exit(0);
    } catch (error) {
        console.error('Erreur lors du seeding :', error);
        process.exit(1);
    }
}

seed();
