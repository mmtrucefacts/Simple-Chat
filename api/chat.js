const { parse } = require('querystring');

let messages = [];

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const parsedBody = parse(body);
            const { username, content, image } = parsedBody;
            const newMessage = { username, content, timestamp: Date.now() };

            if (image) {
                newMessage.imageURL = 'data:image/png;base64,' + image;
            }

            messages.push(newMessage);
            res.status(200).send({ status: "Message added" });
        });
    } else if (req.method === 'GET') {
        res.status(200).json(messages);
    } else {
        res.status(405).send({ error: 'Method not allowed' });
    }
};
