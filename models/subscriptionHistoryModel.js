
const mongoose = require("mongoose")

const subscriptionHistory = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    rate:String,
    month_name:{
        type:String,
        enum:["January","February","March","April","May","June","July",
        "August","September","October","November","December"]
    },
    transaction_id:{
        type:String
    },
    transaction_status:{
        type:String,
        enum:["success","failed",]
    },
    createdAt:{
        type:Date,
        default:new Date(Date.now())
    
    }

})

module.exports = mongoose.model("subscriptionHistory" , subscriptionHistory)