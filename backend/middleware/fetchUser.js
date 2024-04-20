var jwt = require('jsonwebtoken');
const JWT_SECERT = 'Deepuisthebest$justkeepworking^hard';

const fetchUser = (req, res, next) => {
    // Get the user from the jwt token and add it to req object
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({ error: "Please authenticate using a valid token"});
    }
    try{
        const data = jwt.verify(token, JWT_SECERT);
        req.user = data.user;
        next();
    }
    catch (e) {
        res.status(401).send({ error: "Please authenticate using a valid token2"});
    }
}

module.exports = fetchUser;