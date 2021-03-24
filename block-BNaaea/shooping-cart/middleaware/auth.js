let Users = require('../models/Users')
module.exports = {
    loggedInUser:(req, res, next)=> {
        if(req.session && req.session.userId) {
            next()
        }else{
            console.log("auth")
            res.redirect('/users/login')
        }
    },
    userInfo: (req, res, next)=> {
        var userId = req.session && req.session.userId;
        if(userId) {
            Users.findById(userId ,"name email isAdmin" ,  (err , user)=> {
                if(err) next(err)
                req.user = user;
                res.locals.user = user;
                next();
            })
        }else{
            req.user = null;
            res.locals.user = null;
            next();
        }
    },
    adminUser: (req, res, next)=>{
        var admin  = req.session && req.user.isAdmin;
        if(admin) {
            next()
        }else{
            res.redirect('/users/login');
        }
    }
}

