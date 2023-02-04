const whatsAppClient = require('@green-api/whatsapp-api-client');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASS_NODEMAILER,
	},
});

(async () => {
	let restAPI = whatsAppClient.restAPI({
		idInstance: process.env.GREEN_API_INSTANCE,
		apiTokenInstance: process.env.GREEN_API_TOKEN,
	});

	try {
		// Receive WhatsApp notifications.
		console.log('Waiting incoming notifications...');
		await restAPI.webhookService.startReceivingNotifications();

		restAPI.webhookService.onReceivingMessageDocument(({ messageData }) => {
			const { downloadUrl } = messageData.fileMessageData;
			const { fileName } = messageData.fileMessageData;

			const mailOptions = {
				from: process.env.EMAIL,
				to: process.env.TO_EMAIL,
				html: `<div dir="auto"></div>`,
				attachments: [
					{
						filename: fileName,
						path: downloadUrl,
					},
				],
			};

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.log(error);
				} else {
					console.log('Email sent: ' + info.response);
				}
			});
		});
	} catch (ex) {
		console.error(ex.toString());
	}
})();
