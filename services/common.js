const passport = require('passport'); 

//Helper function
exports.isAuth = (req, res, done) => {
    return passport.authenticate('jwt');
}

exports.sanitizeUser = (user) => {
    return {id: user.id, role:user.role};
}

exports.cookieExtractor = function(req) {
    let token = null;
    if (req && req.cookies)
    {
        token = req.cookies['jwt'];
    }

    // this is temp
    // token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0OWQyZTljMzdkODljMDZmMWRhNzI4OSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjg4MTExOTYwfQ.FWi45Jyd8UEf4IGwW0eXcFXjH5v9pY6CGUIDvnWFeDM";
    return token;
};