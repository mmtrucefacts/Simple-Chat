let activeUsers = {}; // This object will store usernames and their last ping timestamp

module.exports = async (req, res) => {
    const now = Date.now();

    // Cleanup: Remove users that haven't sent a ping for over 30 seconds
    for (const user in activeUsers) {
        if (now - activeUsers[user] > 30000) {
            delete activeUsers[user];
        }
    }

    if (req.method === 'POST') {
        const { username } = req.body;
        if (!username) {
            return res.status(400).send({ error: 'Username is required.' });
        }

        // Update the user's last ping timestamp
        activeUsers[username] = now;
        return res.status(200).send({ message: 'Ping received.' });

    } else if (req.method === 'GET') {
        // Return the count of active users and their usernames
        const count = Object.keys(activeUsers).length;
        const userList = Object.keys(activeUsers);
        return res.status(200).send({ count, activeUsers: userList });

    } else {
        return res.status(405).send({ error: 'Method not allowed.' }); // 405 is HTTP status for "Method Not Allowed"
    }
};
