require('dotenv').config();
const { sequelize } = require('./src/models/indexModels');
const Admin = require('./src/models/adminModels');

async function checkAdmin() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const admins = await Admin.findAll();
        console.log('Admins found:', admins.length);

        if (admins.length === 0) {
            console.log('No admin found. Creating default admin...');
            await Admin.create({
                email: 'admin@kaaydalou.com',
                password: 'awadiagne'
            });
            console.log('Admin created: admin@kaaydalou.com / awadiagne');
        } else {
            admins.forEach(a => console.log(`Admin exists: ${a.email}`));
        }
    } catch (e) {
        console.error(e);
    }
}

checkAdmin();
