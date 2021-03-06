const {Image, User, ImageUser} = require('../models');
class Controller {
    static goToLogInPage (req, res){
        res.render('login');
    }
    static logIn(req, res){
        User.findAll(
            {where: {
                username: req.body.username,
                password: req.body.password
            }
        }).then((user)=>{
            res.redirect('/gallery?userid='+ user[0].id)
        }).catch((err)=>{
            res.render('login', {err : err});
        });
    }
    static goToSignUpPage (req, res){
        res.render('signup');
    }
    static signUp(req, res){
        console.log('test')
        let newUser = req.body;
        console.log(newUser)
        User.create(newUser).then(()=>{
            User.findAll({where: {username: newUser.username}}).then((user)=>{
                //automatically redirects to libary after sign-up
                res.redirect('/gallery?userid=' + user[0].id)
            })
        }).catch((err)=>{
            throw err;
        });
    }
    //after login/sign-up
    static showGallery(req, res){
        console.log('test1')
        let id = Number(req.query.userid);
        User.findByPk(id).then((user)=>{
            Image.findAll({order: [['score', 'DESC']] }).then((images)=>{
                res.render('gallery', {
                    user : user,
                    images : images
                });
            });
        }).catch((err)=>{
            res.send(err);
        });
    }
    //when url is submited on gallery
    static addImage(req, res){
        console.log('test');
        let newImage = {
            url: req.body.url,
            score: 0
        }
        let id = Number(req.query.userid);
        Image.create(newImage).then(()=>{
            User.findByPk(id).then((user)=>{
                res.redirect('/gallery?userid=' + user.id);
            });
        }).catch((err)=>{
            res.send(err);
        });
    }
    //when the image is cliked
    static showImage(req, res){
        console.log('a')
        let imageId = Number(req.params.id);
        let userId = Number(req.query.userid);
        Image.findByPk(imageId).then((image)=>{
            User.findByPk(userId).then(user =>{
                res.render('image', {
                    user : user,
                    image: image
                });
            });
        }).catch(err => {
            res.send(err);
        });
    }
    //after like/dislike button selected
    static rateImage(req, res){
        let vote = req.body.vote;
        let imageId = Number(req.params.id);
        let userId = Number(req.query.userid);
        //find the image that was disliked/liked
        Image.findByPk(imageId).then(image =>{
            //find the vote that relate to the user and image
            ImageUser.findAll({where: {ImageId : imageId}}, {UserId : userId})
            .then(imageusers => {
                //if the vote already exist, update the vote, else, make a new vote
                return imageusers[0] ? ImageUser.update({ImageId : imageId, UserId : userId, Vote : vote}, {where: {ImageId : imageId}}, {UserId : userId}) : ImageUser.create({ImageId : imageId, UserId : userId, Vote : req.body.vote});
            }).then(()=>{
                //count the number of total likes of the image
                return ImageUser.count({
                    where: {
                        ImageId : imageId,
                        Vote: 'TRUE'
                    }
                });
            }).then(score =>{
                //update the score of the image
                return Image.update({score : score}, {where : {id : imageId}})
            }).then(()=>{
                //go back to gallery view
                res.redirect('/gallery?userid=' + userId);
            }).catch(err =>{
                throw err;
            });
        }).catch(err=>{
            throw err;
        })
    }
}
module.exports = Controller;