const express = require('express');
const router = express.Router();
const userController = require("../controller/userController");
const auth = require('../middelware/auth')

router.post("/userNameCheck", userController.userNameCheck);
router.post("/createUserName", userController.createUserName);
router.post("/signup", userController.signup);
router.post('/signIn', userController.signIn);
router.put("/includeName/:userId",auth.authentication,auth.authorization, userController.includeName);
router.post("/verification/:userId", auth.authentication,auth.authorization,userController.emailVerification);
router.post("/verification2", userController.emailVerification);
router.get("/validation/:token", userController.validation)
router.post("/createdLinkTree",userController.createdLinkTree);


router.all("/*", function(req,res){
    res.status(400).send({status:false, message:"invalid http request"});
})

module.exports = router;