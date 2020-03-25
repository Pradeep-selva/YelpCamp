//dependencies
var express          = require('express'),
      bodyParser     = require('body-parser'),
      mongoose       = require('mongoose'),
      flash          = require('connect-flash')
      partials       = require('express-partials'),
      passport       = require('passport'),
      localStrategy  = require('passport-local'),
      Campground     = require('./models/campgrounds'),
      Comment        = require('./models/comments'),
      User           = require('./models/users'),
      methodOverride = require('method-override')

//routes
var campgroundRoutes = require('./routes/campgroundRoutes'),
    commentRoutes    = require('./routes/commentRoutes'),
    indexRoutes      = require('./routes/indexRoutes')

//app config
var app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:true}))
app.use(partials())
app.use('/', express.static(__dirname+'/public'))
app.use(methodOverride("_method"))
app.use(flash())

//passport config
app.use(require('express-session')({
    secret:"Thiz is secret key for yelp camp!",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//middleware for auth
app.use((req,res,next)=>{
    res.locals.curUser= req.user
    res.locals.error  = req.flash("error")
    res.locals.success= req.flash("success")
    next()
})

//mongoose
var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelpCamp"

mongoose.connect( url ,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}). then(()=>{
    console.log('Connected to DB')
}).catch(err => {
    console.log("ERROR: "+err)
})

//app routes
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/comments',commentRoutes)
app.use(indexRoutes)

//listening on port
app.listen(process.env.PORT||5000,'0.0.0.0', ()=>{
    console.log(process.env.DATABASEURL)
    console.log('The Yelp camp server is Running!')
})