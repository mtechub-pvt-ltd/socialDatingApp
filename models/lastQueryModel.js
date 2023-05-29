const mongoose = require("mongoose");

const lastQueryModel = new mongoose.Schema({
_id:mongoose.Schema.Types.ObjectId,
  user_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  },
  hours:String,
  lastTimeLoggedIn:String,
  sameCountry:String,
  sameCity:String,
  annual_income:String,
  occupation:String,
  academic_qualification:String,
  graduated_university:String,
  constellationId:String,
  emotional_state:String,
  children:String,
  isSmoke:String,
  isDrink:String,
  companyName:String,
  interestIn:String,
  long:String,
  lat:String,
  page:String,
  limit:String,
  distanceInKm:String



} ,
{
  timestamps: true,
}
);

module.exports = mongoose.model("lastUserQuery", lastQueryModel);