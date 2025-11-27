require('dotenv').config();
const app = require('./app');
const { sync } = require('./models/indexModels');
const PORT = process.env.PORT || 5000;

sync().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀  Backend prêt sur le port ${PORT}`);
        console.log(`    Environnement: ${process.env.NODE_ENV || 'development'}`);
        console.log(`    Base de données: ${process.env.DB_DIALECT || 'sqlite'}`);
    });
}).catch(err => {
    console.error('❌ Erreur lors du démarrage du serveur:', err);
    process.exit(1);
});