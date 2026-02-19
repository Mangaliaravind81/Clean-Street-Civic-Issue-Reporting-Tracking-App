const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/cleanstreet")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

const UserSchema = new mongoose.Schema({
  email:String,
  password:String,
  role:String
});

const User = mongoose.model("User",UserSchema);

// REGISTER
app.post("/register", async(req,res)=>{
  const {email,password,role}=req.body;

  const user = await User.findOne({email});
  if(user) return res.json({message:"User already exists"});

  const hashed = await bcrypt.hash(password,10);

  await User.create({email,password:hashed,role});

  res.json({message:"Registered"});
});

// LOGIN
app.post("/login", async(req,res)=>{
  const {email,password,role}=req.body;

  const user = await User.findOne({email,role});
  if(!user) return res.json({success:false});

  const match = await bcrypt.compare(password,user.password);
  if(!match) return res.json({success:false});

  const token = jwt.sign({id:user._id}, "secret123");

  res.json({success:true,token});
});

app.listen(5000,()=>console.log("Server running on 5000"));
