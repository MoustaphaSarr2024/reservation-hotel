const Admin = require('../models/adminModels');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }

        console.log('Login attempt:', { email, password });
        const admin = await Admin.findOne({ where: { email } });
        console.log('Admin found:', admin ? 'Yes' : 'No');
        if (admin) console.log('DB Password:', admin.password);

        if (!admin || admin.password !== password) {
            console.log('Password match:', admin && admin.password === password);
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        res.json({ message: 'Connexion réussie', admin: { email: admin.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
