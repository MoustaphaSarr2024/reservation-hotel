require('dotenv').config();
const app = require('./app');
const { sync } = require('./models/indexModels');
const PORT = process.env.PORT || 3000;

sync().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀  Back-end ready http://localhost:${PORT}`);
    });
});