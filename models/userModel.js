const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
_id:mongoose.Schema.Types.ObjectId,
  userName: String,
  signupType:{
    type:String,
    enum:['google', 'facebook', 'email' ,'phoneNumber'],
  },
  email: {
    type: String,
    min: 6,
    max: 255,
  },
  gender:{
    type: String,
    enum: ['male', 'female' , 'preferNotToSay' , "transMen" , "transWomen"],
  },

  dateOfBirth:{
    type:Date
  },

  profileImage:{
    type:Object,
  },

  profession:{
    type:String,
  },

  location: {
    type: { 
     type: String,
     default: "Point"
   },
    coordinates: {
      type: [Number], 
     required: [true, "Coordinates are required"] 
   } 
 },
 
  password: {
    type: String,
    required: true,
    max: 2048,
    min: 6,
  },
  blockStatus:{
    type:Boolean,
    default: false,
  },
  fcmToken:{
    type:String,
    required:false,
 },

 education:{
  type:String
 },
 academic_qualification:{
  type:String
 },
 isSmoke:Boolean,
 isDrink:Boolean,
 constellation_id: {
  type:mongoose.Schema.Types.ObjectId,
  ref:"constellation"
 },
 annual_income:String,
 children:Number,
 bio:String,
 height:Number,
 appreciated_text:String,
 emotional_state:{
  type:String,
  enum:["happy" , "heart_broken" , "in_love" , "feeling_alone" , "sad"]
 },
 profession:String,
 interestIn:{
  type:String,
  enum:["male" , "female" ,'preferNotToSay', "transWomen" , "transMen"]
 },
 createdAt:{
  type:Date,
  default:Date.now()
 },
 country:String,
 city:String,
 state:String,
 graduated_university:String,
 companyName: String

} ,
{
  timestamps: true,
}
);
userSchema.index( { location : "2dsphere" } );
module.exports = mongoose.model("user", userSchema);