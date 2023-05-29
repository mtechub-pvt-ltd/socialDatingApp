
const mongoose = require("mongoose")
const constellationModel = require("../models/constellationModel")


exports.createConstellation = async (req,res)=>{

    try{
        const name = req.body.name;
        const newConstellation = await constellationModel({
            _id:mongoose.Types.ObjectId(),
            name: name
        })

        const result = await newConstellation.save();

        if(result){
            res.json({
                message: "New constellation has been created successfully",
                result: result,
                status: 'success',
            })
        }
        else{
            res.json({
                message: "Could not create new constellation",
                status: "failed"
            })
        }
    }
    catch(err){
        res.json({
            message: "Error creating constellation",
            error:err.message
        })
    }
}



exports.getAllConstellation = async(req,res)=>{
    try{
        const result= await constellationModel.find({});
        if(result){
            res.json({
                message: "constellations fetched",
                result: result,
                status: 'success',
            })
        }
        else{
            res.json({
                message: "Could not fetch constellations",
                status: "failed"
            })
        }
        
        
    }
    catch(err){
        res.json({
            message: "Error fetching constellations",
            error:err.message
        })
    }
}

exports.getConstellationById = async(req,res)=>{
    try{
        const constellationId = req.query.constellationId;
        const result= await constellationModel.findOne({_id:constellationId});
        if(result){
            res.json({
                message: "constellation fetched",
                result: result,
                status: 'success',
            })
        }
        else{
            res.json({
                message: "Could not fetch constellation",
                status: "failed"
            })
        }
        
        
    }
    catch(err){
        res.json({
            message: "Error fetching constellation",
            error:err.message
        })
    }
}

exports.deleteConstellation = async(req,res)=>{
    try{
        const constellationId = req.params.constellationId;
        const result= await constellationModel.deleteOne({_id: constellationId})

        if(result.deletedCount>0){
            res.json({
                message: "Deleted",
                result:result
            })
        }
        else{
            res.json({
                message: "could not deleted",
                status:"failed"
            })
        }
    }
    catch(err){
        res.json({
            message: "Error",
            error:err.message
        })
    }
}

exports.updateConstellation = async (req,res)=>{

    try{
        const constellationId = req.body.constellationId;
        const name = req.body.name;

        const result = await constellationModel.findOneAndUpdate({_id: constellationId} , {name:name} , {new:true});
        if(result){
            res.json({
                message: "constellation updated successfully",
                result:result,
                status: 'success'
            })
        }
        else{
            res.json({
                message: "could not updated",
                result:null,
                status:"false"
            })
        }
    }
    catch(err){
        res.json({
            message: "error",
            error:err.message
        })
    }
}