let mongoose = require("mongoose");
const userModel = require("../models/userModel");
const jwt = require('jsonwebtoken');
const verificationModel = require("../models/verificationModel");
const nodemailer = require('nodemailer');
const crypto = require("crypto");
const linkTreeModel = require("../models/linkTreeModel");


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
        const foundUserName = await userModel.findOne({ userName: userName });
        if (foundUserName) return res.status(400).send({ status: false, message: `username already in use` });

        const foundEmail = await userModel.findOne({ email: email });
        if (foundEmail) return res.status(400).send({ status: false, message: `email already in use` });
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

const signIn = async function (req, res) {
    try {
        console.log("some", req.body);
        let data = req.body;
        let { email, password } = data;
        
        if (email === "") return res.status(400).send({ status: false, message: `empty email not possible buddy` });
        if (password === "") return res.status(400).send({ status: false, message: `empty password not possible buddy` });
        let foundUserName = await userModel.findOne({ email: email });
        if (!foundUserName) return res.status(400).send({ status: false, message: `${email} isn't available !!!` });
        console.log(foundUserName, password)
        if(foundUserName.password != password) return res.status(400).send({ status: false, message: `password is not valid` });
        
        let token = jwt.sign(
            { userId: foundUserName._id, exp: Math.floor(Date.now() / 1000) + 86400 },
            "projectlinktree"
          );
      
          let tokenInfo = { userId: foundUserName._id, token: token };
      
          res.setHeader('x-api-key', token)
        return res.status(201).send({ status: true, data: foundUserName, tokenData:tokenInfo });
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
  

const sendMailToUser = (email, token, otp)=>{
    const mailOptions = {
        from:"anmolkadam369@gmail.com",
        to:email,
        subject:"Your link Client",
        text:`this is your OTP : ${otp}-${token}`
    };
    console.log(`this is your OTP : ${otp}-${token} `);

    transporter.sendMail(mailOptions, (error, info)=>{
        if(error) console.log('Error sending email:', error);
        else {
            console.log('Email sent:', info.response);
            const comingInfo= info.response;
            return comingInfo;
        }
    })
}

function generateOTP() {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let otp = '';
  
    // Generate an 8-character alphanumeric OTP
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters.charAt(randomIndex);
    }
  
    return otp;
  }
const emailVerification = async (req,res)=>{
    try{
        let data = req.body;
        console.log("email", data);
        let { email,resetToken,resetTokenExpires ,otp}=data;
        let foundUser = userModel.findOne({email:email});
        if (!foundUser) return res.status(404).json({ message: 'user not found' });

        resetToken = crypto.randomBytes(20).toString('hex');
        console.log("token", resetToken);

        resetTokenExpires = data.resetTokenExpires = Date.now() + 6000000;
        console.log("resetTokenExpires:",resetTokenExpires)
        
        email = data.email = email;
        resetToken = data.resetToken = resetToken;
        resetTokenExpires = data.resetTokenExpires = resetTokenExpires;
        otp = data.otp = generateOTP()
        console.log(email, resetToken, resetTokenExpires, otp)

        let createdVerification = await verificationModel.create(data);
        req.token = resetToken;
        const some = sendMailToUser(email, resetToken,otp);
        console.log(some)
        return res.status(200).send({status:true, message:"email Sent", data: createdVerification})
    }
    catch (error) {
        return res.status(500).send({ status: false, message: `error ${error.message}` })
    }
}

const verifyOTP = async (req, res) => {
    try {
        console.log("some")
       let data = req.body;
       let {email, otp}=data;
       console.log(otp);
       otp = otp.trim();
       let otpArray = otp.split('-');
       let realOTP = otpArray[0];
       let token = otpArray[1];
        const user = await verificationModel.findOne({ resetToken: token , otp : realOTP});
        console.log(user)
        // if (!user) return res.status(400).send({status:false, message: 'Invalid token' });
        if (user.resetTokenExpires < Date.now()) return res.status(400).send({ status: false, message: 'Token expired' ,email:user.email});
        if(user.otp != realOTP) return res.status(400).send({ status: false, message: 'INCORRECT OTP' ,email:user.email});
        return res.status(200).send({ status: true, message: "You are valid person", email:user.email  });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: `error ${error.message}` })
    }
}

const createdLinkTree = async (req,res)=>{
    try {
        let data = req.body;
        console.log(data)
        let {header, wholeAddedLinks}=data;
        if(wholeAddedLinks.length==0) return res.status(400).send({status:false, message:"atleast one link should be there"});
        const linkTreeCreated = await linkTreeModel.create(data);
        return res.status(200).send({ status: true, data: linkTreeCreated});

    } catch (error) {
        return res.status(500).send({ status: false, message: `error ${error.message}` })
    }
}


module.exports={userNameCheck,createUserName, signup, signIn, includeName, emailVerification, verifyOTP, createdLinkTree};