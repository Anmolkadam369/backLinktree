let mongoose = require("mongoose");
const userModel = require("../models/userModel");
const jwt = require('jsonwebtoken');
const verificationModel = require("../models/verificationModel");
const nodemailer = require('nodemailer');
const crypto = require("crypto")


// Create a new book
const userNameCheck = async function (req, res) {
    try{
        let data = req.body;
        const {userName} = data;
        console.log(userName)
        if(userName=="")  return res.status(400).send({status:false, message:`empty name not possible buddy`});
        let foundUserName = await userModel.findOne({userName : userName});
        if(foundUserName) return res.status(400).send({status:false, message:`${userName} is already used`});
        if(!foundUserName) return res.status(200).send({status:true, message:`${userName} `});
    }
    catch(error){
        return res.status(500).send({status:false, message:`error ${error.message}`})
    }
};

const createUserName = async function (req,res){
    try {
        let data = req.body;
        let {userName} = data;
        console.log(userName)
        if(userName=="")  return res.status(400).send({status:false, message:`empty name not possible buddy`});
        userName = data.userName = data.userName.trim();
        if(userName=="")  return res.status(400).send({status:false, message:`empty name not possible buddy`});
        let foundUserName = await userModel.findOne({userName : userName});
        if(foundUserName) return res.status(400).send({status:false, message:`${userName} is already used`});
        else {
        return res.status(200).send({status:true, message:userName});
    }

    } catch (error) {
        return res.status(500).send({status:false, message:`error ${error.message}`})
    }
}

const signup = async function (req, res) {
    try {
        console.log("some", req.body);
        let data = req.body;
        let { userName, email, password } = data;
        // Trim and other validations if needed
        // ...
        if (email === "") return res.status(400).send({ status: false, message: `empty email not possible buddy` });
        if (password === "") return res.status(400).send({ status: false, message: `empty password not possible buddy` });
        let foundUserName = await userModel.findOne({ userName: userName });
        if (foundUserName) return res.status(400).send({ status: false, message: `${userName} is already used` });
        let createdData = await userModel.create(data);
        let token = jwt.sign(
            { userId: createdData._id, exp: Math.floor(Date.now() / 1000) + 86400 },
            "projectlinktree"
          );
      
          let tokenInfo = { userId: createdData._id, token: token };
      
          res.setHeader('x-api-key', token)
        return res.status(201).send({ status: true, data: createdData, tokenData:tokenInfo });
    } catch (error) {
        return res.status(500).send({ status: false, message: `error ${error.message}` })
    }
}

const includeName = async function(req,res) {
    try {
        console.log("includeName", req.body)
       let userId = req.userId;
       let data = req.body;
       let {name, selectedValue, selectedValueSubCat}= data;
        if (name === "") return res.status(400).send({ status: false, message: `empty name not possible buddy` });
        let updateData = await userModel.findOneAndUpdate({_id:userId}, {$set:{name:name, category:selectedValue, subCategory:selectedValueSubCat}}, {new :true});
       console.log(updateData)
        return res.status(200).send({ status: true, data: updateData });
    } catch (error) {
        return res.status(500).send({ status: false, message: `error ${error.message}` })
    }
}

const transporter = nodemailer.createTransport({
    service: 'Gmail', // e.g., 'Gmail'
    auth: {
      user: "anmolkadam369@gmail.com",
      pass: "jiejkeefowuvorav"
    }
  });
  

const sendMailToUser = (email, token)=>{
    const mailOptions = {
        from:"anmolkadam369@gmail.com",
        to:email,
        subject:"Your link Client",
        text:`You have only one hour click on this link : http://localhost:5173/checkValid/${token}`
    };

    transporter.sendMail(mailOptions, (error, info)=>{
        if(error) console.log('Error sending email:', error);
        else {
            console.log('Email sent:', info.response);
            const comingInfo= info.response;
            return comingInfo;
        }
    })
}
const emailVerification = async (req,res)=>{
    try{
        let data = req.body;
        console.log("email", data);
        let { email,resetToken,resetTokenExpires }=data;
        let foundUser = userModel.findOne({email:email});
        if (!foundUser) return res.status(404).json({ message: 'user not found' });

        resetToken = crypto.randomBytes(20).toString('hex');
        console.log("token", resetToken);

        resetTokenExpires = data.resetTokenExpires = Date.now() + 6000000;
        console.log("resetTokenExpires:",resetTokenExpires)
        
        email = data.email = email;
        resetToken = data.resetToken = resetToken;
        resetTokenExpires = data.resetTokenExpires = resetTokenExpires;

        console.log(email, resetToken, resetTokenExpires)

        let createdVerification = await verificationModel.create(data);
        req.token = resetToken;
        const some = sendMailToUser(email, resetToken);
        console.log(some)
        return res.status(200).send({status:true, message:"email Sent", data: createdVerification})
    }
    catch (error) {
        return res.status(500).send({ status: false, message: `error ${error.message}` })
    }
}

const validation = async (req, res) => {
    try {
        console.log("some")
        let token = req.params.token;
        console.log(token)
        const user = await verificationModel.findOne({ resetToken: token });
        console.log(user)
        // if (!user) return res.status(400).send({status:false, message: 'Invalid token' });
        if (user.resetTokenExpires < Date.now()) return res.status(400).send({ status: false, message: 'Token expired' ,email:user.email});
        return res.status(200).send({ status: true, message: "You are valid person",email:user.email  });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: `error ${error.message}` })
    }
}
module.exports={userNameCheck,createUserName, signup, includeName, emailVerification, validation};