
const mongoose = require("mongoose")
const subscriptionHistoryModel = require("../models/subscriptionHistoryModel")
const ObjectId = require("mongodb").ObjectId


exports.createSubscriptionHistory = async(req,res)=>{
    try{
        const month_name = req.body.month_name;
        const transaction_id= req.body.transaction_id;
        const transaction_status= req.body.transaction_status;
        const userId = req.body.userId;
        const rate= req.body.rate;
        


        const foundResult = await subscriptionHistoryModel.findOne({userId:userId})

        if(!foundResult){
            const subscriptionHistory = new subscriptionHistoryModel({
                _id:mongoose.Types.ObjectId(),
                rate:rate,
                month_name:month_name,
                transaction_id:transaction_id,
                transaction_status:transaction_status,
                userId:userId,
            })
    
            var result= await subscriptionHistory.save();
        }
        else{
            console.log("in updation")
            var result= await subscriptionHistoryModel.findOneAndUpdate({userId:userId} , 
                {
                rate:rate,
                month_name:month_name,
                transaction_id:transaction_id,
                transaction_status:transaction_status,
                userId:userId,
                },
                {
                    new:true
                }
                )
        }
        
        
        if(result){
            res.json({
                message: "Subscription history saved successfully",
                result:result,
                statusCode:201
            })
        }
        else{
            res.json({
                message: "could not save subscription history",
                result:result,
                statusCode:400
            })
        }

        

    }
    catch(err){
        res.json({
            message: "Error occurred while saving subscription history",
            error:err.message
        })
    }
}



exports.getAllSubscriptionsHistories = async (req,res)=>{
    try{
        const result=await subscriptionHistoryModel.find({});

        if(result){
            res.json({
                message: "result",
                result:result,
                statusCode:200
            })
        }
        else{
            res.json({
                message: "could not find result",
                result:result,
                statusCode:404
            })
        }
    }
    catch(err){
        res.json({
            message: "Error occurred while fetching",
            error:err.message,
            statusCode:500
        })
    }
}

exports.getSubscriptionHistoryById = async (req,res)=>{
    try{
        let subscriptionHistoryId= req.params.subscriptionHistoryId;
        subscriptionHistoryId = new ObjectId(subscriptionHistoryId);

        
        const result = await subscriptionHistoryModel.aggregate([
            { $match: { _id:subscriptionHistoryId} },
            

          {
            $addFields:{
              subscription_remaining_days:{$dateDiff: {
                startDate:"$createdAt",
                endDate: new Date(Date.now()),
                unit:"day"
             }
            }}
         },
         {
            $addFields:{
              subscription_remaining_days: {$subtract:[ 30 , ("$subscription_remaining_days")]}
            }
      
         }
          ]);

        if(result){
            res.json({
                message: "result",
                result:result,
                statusCode:200
            })
        }
        else{
            res.json({
                message: "could not find result  with this id",
                result:result,
                statusCode:404
            })
        }
    }
    catch(err){
        res.json({
            message: "Error occurred while fetching",
            error:err.message,
            statusCode:500
        })
    }
}

exports.getSubscriptionHistoryByUserId = async (req,res)=>{
    try{
        let userId= req.params.userId;
        userId = new ObjectId(userId);

        
        const result = await subscriptionHistoryModel.aggregate([
            { $match: { userId:userId} },
            

          {
            $addFields:{
              subscription_remaining_days:{$dateDiff: {
                startDate:"$createdAt",
                endDate: new Date(Date.now()),
                unit:"day"
             }
            }}
         },
         {
            $addFields:{
              subscription_remaining_days: {$subtract:[ 30 , ("$subscription_remaining_days")]}
            }
      
         }
          ]);

        if(result){
            res.json({
                message: "result",
                result:result,
                statusCode:200
            })
        }
        else{
            res.json({
                message: "could not find result  with this id",
                result:result,
                statusCode:404
            })
        }
    }
    catch(err){
        res.json({
            message: "Error occurred while fetching",
            error:err.message,
            statusCode:500
        })
    }
}

exports.deleteSubscriptionHistory = async(req,res)=>{

    try{
        const subscriptionHistoryId= req.params.subscriptionHistoryId;
        const result= await subscriptionHistoryModel.deleteOne({_id:subscriptionHistoryId})

        if(result.deletedCount>0){
            res.json({
                message: "record deleted",
                result:result,
                statusCode:200
            })
        }
        else{
            res.json({
                message: "could not delete result with this id",
                result:result,
                statusCode:404
            })
        }
    }
    catch(err){
        res.json({
            message: "Error occurred while deleting",
            error:err.message,
            statusCode:500
        })
    }
       
}

exports.updateSubscriptionHistory = async(req,res)=>{

    try{
    const subscriptionHistoryId= req.body.subscriptionHistoryId;
    const rate  = req.body.rate;
    const month_name = req.body.month_name;
    const transaction_id= req.body.transaction_id;
    const transaction_status= req.body.transaction_status;
    const userId = req.body.userId;

    const result = await subscriptionHistoryModel.findOneAndUpdate({_id:subscriptionHistoryId}
        ,{
            rate:rate,
            month_name,
            transaction_id,
            transaction_status,
            userId:userId
        } ,
        {
            new:true,
        }  
        )

        
        if(result){
            res.json({
                message: "record updated successfully",
                result:result,
                statusCode:200
            })
        }
        else{
            res.json({
                message: "could not update record",
                result:result,
                statusCode:404
            })
        }

    }
    catch(err){
        res.json(err)
    }
    

}
 

