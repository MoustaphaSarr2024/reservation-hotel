const nodemailer = require('nodemailer');

let transporter;

async function createTransporter() {
    if (transporter) return transporter;

    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
            user: testAccount.user, 
            pass: testAccount.pass,
        },
    });

    return transporter;
}

exports.sendConfirmationEmail = async (to, reservationDetails) => {
    try {
        const mailTransporter = await createTransporter();

        const managementLink = `http://localhost:5173/reservations/${reservationDetails.id}/edit`;

        const info = await mailTransporter.sendMail({
            from: '"Hôtel Kaay dalou" <reservations@kaaydalou.com>', 
            to: to, 
            subject: "Confirmation de votre réservation - Hôtel Kaay dalou", 
            text: `Bonjour ${reservationDetails.guestName},\n\nVotre réservation a été confirmée avec succès.\n\nDétails de la réservation:\nChambre: ${reservationDetails.roomName}\nArrivée: ${reservationDetails.dateFrom}\nDépart: ${reservationDetails.dateTo}\n\nVous pouvez gérer votre réservation ici : ${managementLink}\n\nMerci de votre confiance.\n\nCordialement,\nL'équipe Hôtel Kaay dalou`, // plain text body
            html: `
                <h1>Confirmation de Réservation</h1>
                <p>Bonjour <strong>${reservationDetails.guestName}</strong>,</p>
                <p>Votre réservation a été confirmée avec succès.</p>
                <h3>Détails de la réservation:</h3>
                <ul>
                    <li><strong>Chambre:</strong> ${reservationDetails.roomName}</li>
                    <li><strong>Arrivée:</strong> ${reservationDetails.dateFrom}</li>
                    <li><strong>Départ:</strong> ${reservationDetails.dateTo}</li>
                </ul>
                <p><a href="${managementLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Gérer ma réservation</a></p>
                <p>Merci de votre confiance.</p>
                <p>Cordialement,<br>L'équipe Hôtel Kaay dalou</p>
            `,
        });

        console.log("Message sent: %s", info.messageId);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("Preview URL: %s", previewUrl);

        return { messageId: info.messageId, previewUrl };
    } catch (error) {
        console.error("Error sending email:", error);
        return null;
    }
};
