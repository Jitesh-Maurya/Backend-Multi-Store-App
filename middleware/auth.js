const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Vendor = require('../models/vendor');

//authentication middleware
// this middleware fucntion checks if the user is authenticated

const auth = async (req, res, next) => {
    try {
        //extract the token from the request header
        const token = req.header('x-auth-token');

        //if no token is provided, reutrn 401(unauthorized) response with an error message
        if (!token) {
            return res.status(401).json({ msg: 'No authentication token, authorization denied' });
        }
        //verify the jwt token using the secret key
        const verified = jwt.verify(token, "passwordKey");
        //if the token verification failed, return 401
        if (!verified) {
            return res.status(401).json({ msg: 'Token verification failed, authorization denied' });
        }
        // find the normal user or vendor in the database using the id stored in the token payload
        const user = await User.findById(verified.id) || await Vendor.findById(verified.id);
        if (!user) {
            return res.status(401).json({ msg: 'User or Vendor not found, authorization denied' });
        }
        //attach the authentication user (whether a normal user or a vendor) to the request objects
        //this makes the user's data available to any subsequent middleware or route handlers
        req.user = user;
        //also attack the token to the request object in case is needed later
        req.token = token;
        //proceed to the next middleware or route handler
        next();
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}


//vendor authentication middleware
//this midddleware ensures that the user making the request is a vendor
//it should be used fo routes that only vendors can access

const vendorAuth = async (req, res, next) => {
    try {
        //checks if the user making the request is a vendor (by checking the "role property")
        if (!req.user.role || req.user.role !== 'vendor') {
            return res.status(403).json({ msg: 'Access denied, vendor only are allowed' });
        }
        // if the user is a vendor, proceed to the next middleware or route handler
        next();
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};

module.exports = { auth, vendorAuth };