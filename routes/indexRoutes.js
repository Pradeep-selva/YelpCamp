//dependencies
var express    = require('express'),
    router     = express.Router(),
    User       = require('../models/users'),
    passport   = require('passport')

//index route
router.get('/', (req,res)=>{
    res.render("./index/index")
    
})


//authentication routes
router.get('/register', (req,res)=>{
    res.render('./index/register')
})

router.post('/register', (req,res)=>{

    var newUser = new User({username: req.body.username})
    User.register(newUser, req.body.password, (err,user)=>{
        if(err){
            console.log(err)
            return res.render("register")
        } 
        passport.authenticate("local")(req, res, ()=>{
            req.flash('success','Registered successfully! Welcome '+req.user.username)
            res.redirect('/campgrounds')
        })
    })

})

router.get('/login', (req,res)=>{
    res.render('./index/login')
})

router.post('/login',passport.authenticate("local",{

    successRedirect: '/campgrounds',
    failureRedirect: '/login'

}),(req,res)=>{
    req.flash('success', 'Logged you in successfully!')
})

router.get('/logout',(req,res)=>{
    req.logout()
    req.flash('success', 'Logged out successfully!')
    res.redirect('/campgrounds')
})

//middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

//exports
module.exports = router