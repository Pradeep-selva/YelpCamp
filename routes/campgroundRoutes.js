//dependencies
var express    = require('express'),
    router     = express.Router(),
    Campground = require('../models/campgrounds')

//campground routes
router.get('/', (req,res)=>{

    var curUser= req.user

    Campground.find({
        },(err,response)=>{
            if(err){
                console.log(err)
            }
            else{
                res.render('./campgrounds/campgrounds', {campgrounds: response, curUser:curUser})
            }
    })

})

router.post('/',isLoggedIn, (req,res)=>{
    var name=req.body.name
    var price = req.body.price
    var image=req.body.image
    var desc= req.body.description
    Campground.create({
        name: name,
        price: price,
        image: image,
        description: desc
    }, (err,response)=>{
        if(err){
            console.log(err)
        } else{
            console.log(req.user)
            response.author.id       = req.user.id
            response.author.username = req.user.username
            response.save()

            console.log("NEW CAMPGROUND ADDED:")
            console.log(response)
            
        }
    })
    
    req.flash('success', 'Campground added successfully!')
    res.redirect('/campgrounds')
})

router.get('/new',isLoggedIn, (req,res)=>{
    res.render('./campgrounds/addCamp')
})

router.get('/:id', (req,res)=>{

    Campground.findById(req.params.id).populate("comments").exec((err,campground)=>{
        if(err){
            console.log(err)
        } else{
            res.render('./campgrounds/show',{campground:campground})
        }
    })

})

router.get('/:id/edit', checkCampgroundOwnership, (req,res)=>{

    Campground.findById(req.params.id, (err,campground)=>{
        if(err){
            console.log(err)
            res.redirect('/campgrounds')
        } else{
            res.render('./campgrounds/edit', {campground:campground})
        }
    })

})

router.put('/:id', checkCampgroundOwnership, (req,res)=>{
    
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err,campground)=>{
        if(err){
            console.log(err)
        } else { 
            req.flash('success', campground.name+' has been updated successfully!')
            res.redirect('/campgrounds/'+ req.params.id)

        }
    })

})

router.delete('/:id',checkCampgroundOwnership, (req,res)=>{

    Campground.findByIdAndRemove(req.params.id, (err,campground)=>{
        if(err){
            console.log(err)
            res.redirect('/campgrounds')
        } else {
            console.log('CAMPGROUND REMOVED:')
            console.log(campground)
            req.flash('success', campground.name+' deleted successfully!')
            res.redirect('/campgrounds')
        }
    })

})

//middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    req.flash("error", "You are not allowed to do that!")
    res.redirect('/login')
}

function checkCampgroundOwnership(req,res,next){
    if(req.isAuthenticated()){
        console.log(req.params.id)
        Campground.findById(req.params.id, (err,campground)=>{
            if(err){
                console.log(err)
                req.flash("error", "You are not allowed to do that!")

                res.redirect('back')
            } else {
                
                if(campground.author.id.toString() === req.user.id.toString()){
                    next()
                } else{
                    req.flash("error", "You are not allowed to do that!")
                    res.redirect('back')
                }
            }
            
        })

    } else{
        req.flash("error", "You are not allowed to do that!")
        res.redirect('/login')
    }
}

//export
module.exports = router