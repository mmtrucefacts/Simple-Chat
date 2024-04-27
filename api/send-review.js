const https = require('https');

module.exports = (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).end(); // Method Not Allowed
    }

    const { username, review } = req.body;

    const webhookURL = new URL('https://discord.com/api/webhooks/1153789158356168846/InLfDgPG5flEuk4tiNdAGloHAMT_fQBalwj1-jAt-idis1qwb9XHY266Q6r-raixq5f8'); // dont spam ty

    const payload = JSON.stringify({
        username: 'Review-Boi',
        content: `New Review by ${username}\n${review}`
    });

    const options = {
        hostname: webhookURL.hostname,
        path: webhookURL.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length
        }
    };

    const webhookReq = https.request(options, webhookRes => {
        if (webhookRes.statusCode !== 204) {
            console.error('Error status code:', webhookRes.statusCode);
            return res.status(500).json({ message: 'Failed to send review' });
        }
        res.status(200).json({ message: 'Review sent successfully!' });
    });

    webhookReq.on('error', error => {
        console.error(error);
        res.status(500).json({ message: 'Failed to send review' });
    });

    webhookReq.write(payload);
    webhookReq.end();
};
