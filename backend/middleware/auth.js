const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided!' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized!' });
    }
};

module.exports = auth; 