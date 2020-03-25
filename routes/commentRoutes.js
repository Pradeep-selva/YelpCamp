//dependencies
var express    = require('express'),
    router     = express.Router({mergeParams:true}),
    Campground = require('../models/campgrounds'),
    Comment    = require('../models/comments')

//comment routes
router.get('/new', isLoggedIn, (req,res)=>{

    Campground.findById(req.params.id, (err, campground)=>{
        if(err){
            console.log(err)
        } else{
            res.render('./comments/addComment', {campground: campground})
        }
    })

})

router.post('/',isLoggedIn, (req,res)=>{

    Campground.findById(req.params.id, (err,campground)=>{
        if(err){
            console.log(err)
        } else {
            Comment.create(req.body.comment, (err,comment)=>{
                if(err){
                    console.log(err)
                } else {
                    comment.author.id       = req.user.id
                    comment.author.username = req.user.username
                    comment.save()
                    
                    campground.comments.push(comment)
                    campground.save()
                    req.flash('success','Comment added successfully!')
                    res.redirect('/campgrounds/'+campground.id)
                }
            })
        }
    })

})

router.get('/:comment_id/edit',checkCommentOwnership, (req,res)=>{

    Comment.findById(req.params.comment_id, (err,comment)=>{
        if(err){
            console.log(err)
            res.redirect('back')
        } else {
            res.render('./comments/edit', {comments: comment, campground_id: req.params.id})
        }
    })

})

router.put('/:comment_id',checkCommentOwnership, (req,res)=>{

    Comment.findByIdAndUpdate(req.params.comment_id, {
        $set:{
            body: req.body.content
        }
    }, (err,comment)=>{
        if(err){
            console.log(err)
        } else {
            req.flash('success','Comment updated successfully!')
            res.redirect('/campgrounds/'+req.params.id)
        }
    })

})

router.delete('/:comment_id', checkCommentOwnership, (req,res)=>{

    Comment.findByIdAndRemove(req.params.comment_id, (err, comment)=>{
        if(err){
            console.log(err)
        } else {
            console.log('COMMENT DELETED: ')
            console.log(comment)
            req.flash('success', 'Comment deleted successfully!')
            res.redirect('/campgrounds/'+req.params.id)
        }
    })

})

//middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    req.flash('error', 'You are not allowed to do that!')
    res.redirect('/login')
}

function checkCommentOwnership(req,res,next){

    if(req.isAuthenticated()){

        Comment.findById(req.params.comment_id, (err, comment)=>{
            if(err){
                console.log(err)
                req.flash('error', 'You are not allowed to do that!')
                res.redirect('back')
            } else {

                if(comment.author.id.toString() === req.user.id.toString()){
                    next()
                } else {
                    req.flash('error', 'You are not allowed to do that!')
                    res.redirect('back')
                }

            }
        })

    } else{
        req.flash('error', 'You are not allowed to do that!')
        res.redirect('back')
    }

}

//exports
module.exports= router