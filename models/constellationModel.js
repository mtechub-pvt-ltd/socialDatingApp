const mongoose = require("mongoose")

const constellationSchema = new mongoose.Schema ({
    _id:mongoose.Schema.Types.ObjectId,
    name:String,
})

module.exports = mongoose.model("constellation" , constellationSchema)