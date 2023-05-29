const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const UserOTPVerificationModel = require("../models/userOTPVerificationModel");
const cloudinary = require("../utils/cloudinary")
const swipesModel = require("../models/swipesModel");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const userLogsModel= require("../models/userLogsModels")
var ObjectId = require('mongodb').ObjectId;

const lastQueryModel = require("../models/lastQueryModel");
const { FactorContext } = require("twilio/lib/rest/verify/v2/service/entity/factor");




exports.register = async (req,res)=>{
try{
  console.log("in post");
  const { error } = registerSchema.validate(req.body);
  console.log(req.body)
  if (error) return res.status(400).send(error.details[0].message);
  //Check if the user is already in the db
  const email = await userModel.findOne({ email: req.body.email });
  console.log("email" + email);


  //hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  console.log(hashPassword)


  if(!email){
    var userPic;
    if(req.file){
           console.log(req.file)
           const c_result = await cloudinary.uploader.upload(req.file.path)
          console.log(c_result.secure_url)
          userPic= {
           userPicUrl:c_result.secure_url,
           public_id:c_result.public_id
          };
       }
       else{
           userPic= {}
       }

  

  let long = req.body.long;
  long= parseInt(long);
  let lat= req.body.lat;
  lat=parseInt(lat)

  console.log(typeof(req.body.isSmoke))
  console.log(typeof(long))
       

  
   if(long && lat){

    var location = {"coordinates":[long, lat]}
    var user = new userModel({
      _id: mongoose.Types.ObjectId(),
      email: req.body.email,
      password: hashPassword,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      profileImage: userPic,
      profession: req.body.profession,
      location: location,
      fcmToken: req.body.fcmToken,
      signupType: req.body.signupType,
      userName: req.body.userName,
      education:req.body.education,
      academic_qualification:req.body.academic_qualification,
      isSmoke: req.body.isSmoke,
      isDrink:req.body.isDrink,
      constellation_id:req.body.constellation_id,
      annual_income:req.body.annual_income,
      children: req.body.children,
      bio:req.body.bio,
      height:req.body.height,
      appreciated_text: req.body.appreciated_text,
      emotional_state: req.body.emotional_state,
      profession: req.body.profession, 
      interestIn: req.body.interestIn,
      country: req.body.country,
      city: req.body.city,
      state: req.body.state,
      graduated_university: req.body.graduated_university,
      companyName: req.body.companyName,
 
      
    });

    const savedUser= await user.save();
   const token = jwt.sign({ _id: savedUser._id }, process.env.TOKEN);
   
   if(savedUser){
     res.json({
       message: "User saved successfully",
       result:savedUser,
       jwt_token:token,
       statusCode:200
     })
   }
   else{
     res.json({
       message: "User could not be saved successfully",
       result:null,
       statusCode:404
     })
   }
   }else{
    res.json({
      message: "Please Provide long lat of current user location",
      status:false,
    })
   }
   
  }
  else{
    res.json({
      message: "This email is already in Use",
      status:"failed"
    })
  }
  
 

}
catch(err){
  res.json({
    message: "Error occurred while saving user",
    error:err.message
  })
}
}


exports.login= async(req,res)=>{
  const logSavedResponse = {};
  try{
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

     console.log(req.body.email);

    if (req.body.email) {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Email or password is wrong");
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send("Email or password is wrong");

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN);


    const result = await userModel.aggregate([
      { $match: { _id: user._id } },
      {
        $lookup:
        {
            from: "posts",
            localField: "_id",
            foreignField: "userId",
            as: "userPosts"
        }
    },
    {
      $lookup:{
        from:"subscriptionhistories",
        localField: "_id",
        foreignField:"userId",
        as:"subscription_details"
        
      }
    },
    { "$addFields": {
      "subscription_details": {
          "$arrayElemAt": [ "$subscription_details", 0 ]
      }
  }},
    {
      $addFields:{
        subscription_remaining_days:{$dateDiff: {
          startDate:"$subscription_details.createdAt",
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

    console.log(result)
    //saving user logs
    const userLog= new userLogsModel({
      _id:mongoose.Types.ObjectId(),
      user_id:user._id,
      ip:req.body.ip,
      country:req.body.country,
      logType:"login"
    })

    if(result){
      const userLogSaved = await userLog.save();
      if(userLogSaved){
        logSavedResponse.message="User login log saved successfully"
      }

      res.json({
        message: "Logged in successfully",
        result:result,
        jwt_token:token,
        logSavedResponse,
      });

    }
    else{
      res.json({
        message: "Logged in failed",
        status:"failed",
      })
    }
    
    
}
  }
  catch(err){
    res.json({
      message: "Error Occurred while logging in",
      error:err.message,
    })
  }
}

exports.checkLogin = (req,res)=>{

}

exports.getAllUsers = (req, res) => {
  userModel.find({}, function (err, foundResult) {
    try {
      res.json(foundResult);
    } catch (err) {
      n;
      res.json(err);
    }
  });
};

exports.getSpecificUser = (req, res) => {
  const userId = req.params.userId;
  userModel.find({ _id: userId }, function (err, foundResult) {
    try {
      res.json(foundResult);
    } catch (err) {
      res.json(err);
    }
  });
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.userId;

  try{
    const result= await userModel.findOne({_id: userId});
    if(result){
        await cloudinary.uploader.destroy(result.profileImage.public_id)
    }else{
        console.log("not found this user ")
    }
  }
  catch(err){console.log(err)}



  userModel.deleteOne({ _id: userId }, function (err, foundResult) {
    try {
      res.json(foundResult);
    } catch (err) {
      res.json(err);
    }
  });
};

exports.updatePassword = async (req, res) => {
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber;
  const newPassword = req.body.newPassword;
  const userId = req.body.userId;

  if (
    email &&
    newPassword &&
    userId !== null &&
    typeof email &&
    typeof newPassword &&
    typeof userId !== "undefined"
  ) {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    userModel.findOneAndUpdate(
      {
        email: email,
        _id: userId,
      },
      {
        password: hashPassword,
      },
      {
        new: true,
      },
      function (err, result) {
        if (result) {
          console.log("password updated successfully");
          res.json({
            message: "password updated successfully",
            success: true,
            result: result,
          });
        } else {
          res.json({
            message: "could'nt update user password",
            success: false,
            error: err,
            data: result,
          });
        }
      }
    );
  } else if (phoneNumber && newPassword && userId) {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    userModel.findOneAndUpdate(
      {
        phoneNumber: phoneNumber,
        _id: userId,
      },
      {
        password: hashPassword,
      },
      {
        new: true,
      },
      function (err, result) {
        if (result) {
          console.log("password updated successfully");
          res.json({
            message: "password updated successfully",
            success: true,
            result: result,
          });
        } else {
          res.json({
            message: "could'nt update user password",
            success: false,
            error: err,
            data: result,
          });
        }
      }
    );
  }
};

exports.blockStatusChange = (req, res) => {
  const status = req.body.status;
  const userId = req.body.userId;
  userModel.findOneAndUpdate(
    { _id: userId },
    { blockStatus: status },
    { new: true },
    function (err, result) {
      if (result) {
        if (!err) {
          res.json({
            message: "Block status changed to " + status,
            updatedResult: result,
          });
        } else {
          res.json({
            message: "Error occurred while changing status",
            Error: err.message,
          });
        }
      } else {
        res.send("result found null");
      }
    }
  );
};

exports.updateUserProfile =  async (req, res) => {
  const userId = req.body.userId;
 

  console.log(req.body)
  let long = req.body.long;
  long= parseInt(long);
  let lat= req.body.lat;
  lat=parseInt(lat)
  

  try{
    const result= await userModel.findOne({_id: userId});
    if(result){
      console.log(result.profileImage.public_id)
        await cloudinary.uploader.destroy(result.profileImage.public_id)
    }else{
        console.log("not found this user ")
    }
}
catch(err){}
//----------------------------------------------

// uploading new picture in to cloudinary
var userPic;
try{

    if(lat & long){ // This condition will check for lat and long 
      if(req.file){
        console.log(req.file)
        const c_result = await cloudinary.uploader.upload(req.file.path)
       console.log(c_result.secure_url)
       userPic= {
        userPicUrl:c_result.secure_url,
        public_id:c_result.public_id
       };


       // if image is reveived
       if (userId !== null && typeof userId !== "undefined") {
        userModel.findByIdAndUpdate(
          userId,
          {
            gender: req.body.gender,
            dateOfBirth: req.body.dateOfBirth,
            profileImage: userPic,
            profession: req.body.profession,
            fcmToken: req.body.fcmToken,
            userName: req.body.userName,
            userEmailAddress: req.body.userEmailAddress,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            signupType: req.body.signupType,
            $set: {
              "location.coordinates": [long,lat],
            },
            country:req.body.country,
            state:req.body.state,
            city:req.body.city,
            graduated_university: req.body.graduated_university,
            companyName: req.body.companyName,
            interestIn:req.body.interestIn,
            academic_qualification: req.body.academic_qualification,
            isSmoke: req.body.isSmoke,
            isDrink: req.body.isDrink,
            constellationId: req.body.constellationId,
            annual_income: req.body.annual_income,
            children: req.body.children,
            bio: req.body.bio,
            appreciated_text: req.body.appreciated_text,
            height: req.body.height,
          },
          {
            new: true,
          },
          function (err, result) {
            if (!err) {
              if (result !== null && typeof result !== "undefined") {
                res.json({
                  message: "Updated successfully",
                  updatedResult: result,
                });
              } else {
                res.json({
                  message:
                    "couldn't update , Record with this userId  may be not found",
                });
              }
            } else {
              res.json({
                message: "Error updating",
                Error: err.message,
              });
            }
          }
        );
      } else {
        res.json("userId be null or undefined");
      }
        }
    else{
      userModel.findByIdAndUpdate(
        userId,
        {
          gender: req.body.gender,
          dateOfBirth: req.body.dateOfBirth,
          profession: req.body.profession,
          fcmToken: req.body.fcmToken,
          userName: req.body.userName,
          userEmailAddress: req.body.userEmailAddress,
          phoneNumber: req.body.phoneNumber,
          email: req.body.email,
          signupType: req.body.signupType,
          $set: {
            "location.coordinates": [req.body.long, req.body.lat],
          },
          country:req.body.country,
            state:req.body.state,
            city:req.body.city,
            graduated_university: req.body.graduated_university,
            companyName: req.body.companyName,
            interestIn:req.body.interestIn,
            academic_qualification: req.body.academic_qualification,
            isSmoke: req.body.isSmoke,
            isDrink: req.body.isDrink,
            constellationId: req.body.constellationId,
            annual_income: req.body.annual_income,
            children: req.body.children,
            bio: req.body.bio,
            appreciated_text: req.body.appreciated_text,
            height: req.body.height,

        },
        {
          new: true,
        },
        function (err, result) {
          if (!err) {
            if (result !== null && typeof result !== "undefined") {
              res.json({
                message: "Updated successfully",
                updatedResult: result,
              });
            } else {
              res.json({
                message:
                  "couldn't update , Record with this userId  may be not found",
              });
            }
          } else {
            res.json({
              message: "Error updating",
              Error: err.message,
            });
          }
        }
      );
    }
    }
  else{ //......................................................................................................
    // this is the case if no user is with long and lat
    if(req.file){
      console.log(req.file)
      const c_result = await cloudinary.uploader.upload(req.file.path)
     console.log(c_result.secure_url)
     userPic= {
      userPicUrl:c_result.secure_url,
      public_id:c_result.public_id
     };


     // if image is reveived
     if (userId !== null && typeof userId !== "undefined") {
      userModel.findByIdAndUpdate(
        userId,
        {
          gender: req.body.gender,
          dateOfBirth: req.body.dateOfBirth,
          profileImage: userPic,
          profession: req.body.profession,
          fcmToken: req.body.fcmToken,
          userName: req.body.userName,
          userEmailAddress: req.body.userEmailAddress,
          phoneNumber: req.body.phoneNumber,
          email: req.body.email,
          signupType: req.body.signupType,
          country:req.body.country,
            state:req.body.state,
            city:req.body.city,
            graduated_university: req.body.graduated_university,
            companyName: req.body.companyName,
            interestIn:req.body.interestIn,
            academic_qualification: req.body.academic_qualification,
            isSmoke: req.body.isSmoke,
            isDrink: req.body.isDrink,
            constellationId: req.body.constellationId,
            annual_income: req.body.annual_income,
            children: req.body.children,
            bio: req.body.bio,
            appreciated_text: req.body.appreciated_text,
            height: req.body.height,

         
        },
        {
          new: true,
        },
        function (err, result) {
          if (!err) {
            if (result !== null && typeof result !== "undefined") {
              res.json({
                message: "Updated successfully",
                updatedResult: result,
              });
            } else {
              res.json({
                message:
                  "couldn't update , Record with this userId  may be not found",
              });
            }
          } else {
            res.json({
              message: "Error updating",
              Error: err.message,
            });
          }
        }
      );
    } else {
      res.json("userId be null or undefined");
    }
      }
  else{
    userModel.findByIdAndUpdate(
      userId,
      {
        gender: req.body.gender,
        dateOfBirth: req.body.dateOfBirth,
        profession: req.body.profession,
        fcmToken: req.body.fcmToken,
        userName: req.body.userName,
        userEmailAddress: req.body.userEmailAddress,
        phoneNumber: req.body.phoneNumber,
        email: req.body.email,
        signupType: req.body.signupType,
        country:req.body.country,
            state:req.body.state,
            city:req.body.city,
            graduated_university: req.body.graduated_university,
            companyName: req.body.companyName,
            interestIn:req.body.interestIn,
            academic_qualification: req.body.academic_qualification,
            isSmoke: req.body.isSmoke,
            isDrink: req.body.isDrink,
            constellationId: req.body.constellationId,
            annual_income: req.body.annual_income,
            children: req.body.children,
            bio: req.body.bio,
            appreciated_text: req.body.appreciated_text,
            height: req.body.height,

      },
      {
        new: true,
      },
      function (err, result) {
        if (!err) {
          if (result !== null && typeof result !== "undefined") {
            res.json({
              message: "Updated successfully",
              updatedResult: result,
            });
          } else {
            res.json({
              message:
                "couldn't update , Record with this userId  may be not found",
            });
          }
        } else {
          res.json({
            message: "Error updating",
            Error: err.message,
          });
        }
      }
    );
  }
  }

    
    
}catch(err)
{console.log(err)}

 
};

exports.postEnterNumber = (req, res) => {

  const phoneNumber = req.body.phoneNumber;

  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

  var obj = {};

  userModel.findOne({ phoneNumber: phoneNumber }, async (err, data) => {
    console.log(data)
    if (!data) {
      obj.status = "user with this phone Number not exist";
      res.json(obj);
    } else {
      const result = await userPhoneOTPVerificationModel.findOne({
        phoneNumber: phoneNumber,
      });
      if (!result) {
        const newOtp = new userPhoneOTPVerificationModel({
          _id: mongoose.Types.ObjectId(),
          phoneNumber: phoneNumber,
          otp: otp,
        });
        newOtp.save();
      } else {
        userPhoneOTPVerificationModel.findOneAndUpdate(
          { phoneNumber: phoneNumber },
          { otp: otp },
          { new: true },
          function (err, result) {
            if (result) {
              console.log("otp saved , updated previous record");
            } else if (err) {
              console.log(err);
            }
          }
        );
      }
    }

    client.messages
      .create({
        body: "your lovibear verification code is " + otp,
        to: phoneNumber,
        from: process.env.phoneNumber,
      })
      .then((message) => {
        res.json(message);
      })
      // here you can implement your fallback code
      .catch((error) => {
        res.json(error);
      });
  });
};

exports.verifyOTP = (req, res) => {
  const { userEnteredOtp, phoneNumber } = req.body;

  userPhoneOTPVerificationModel.findOne(
    { phoneNumber: phoneNumber, otp: userEnteredOtp },
    (err, foundResult) => {
      if (foundResult) {
        console.log("record found for password updation");
        console.log(foundResult);
        res.json({
          message: "user found , OTP successfully matched",
          status: true,
          data: foundResult,
        });
      } else {
        res.json({
          message:
            "no such record found with the following OTP =" + userEnteredOtp,
          status: false,
        });
      }
    }
  );
};

exports.getUsersWithinRadius = async (req, res) => {
  const long = req.body.long;
  const lat = req.body.lat;
  let radiusInKm = req.body.radiusInKm;
  const page = req.query.page - 1;
  const limit = req.query.limit;
  const byPosts = req.query.byPosts;
  const gender = req.query.gender;
  console.log(byPosts)
  const min_age=req.query.min_age;
  const max_age=req.query.max_age;
  const userId=req.body.userId;



  const error={

  }


  

  // var query = {'location' : {$geoWithin: { $centerSphere:  [getUserLocation(long,lat), kmToRadian(radiusInKm)]}}}

  try{
    const aggregate = [];
  
  if(isNaN(radiusInKm)==false){
    if(long,lat,radiusInKm) {
      radiusInKm= parseInt(radiusInKm)
      aggregate.push(
        {
      $geoNear: {
         near: { type: "Point", coordinates: [ long , lat ] },
         distanceField: "dist.distance_km",
          maxDistance:radiusInKm*1000 ,
          distanceMultiplier :0.001,
          includeLocs: "dist.location",
          spherical: true
      }
    },
    { $skip: parseInt(page) * parseInt(limit)},
    { $limit: parseInt(limit)}
    )
    }
  }
  else{
    error.errorMessage= "Radius must be a Number"
  }
  
  if (Boolean(byPosts)===true){
    aggregate.push(
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          pipeline: [
            {
              $project: {
                _id: 0,
              },
            },
          ],
          as: "posts",
        },
      },
      {
        $set: {
          postCount: { $size: "$posts" },
        },
      },
      {
        $unset: "posts",
      },
      {
        $sort: { postCount: -1 },
      }
    );
  }

  if (gender) {
    aggregate.push({
      $match: {
        gender: gender,
      },
    });
  }

  if (min_age && !max_age) {

    aggregate.push({
        $set: {
          age: { $subtract: [new Date(), "$dateOfBirth"]}
          },
      },
      {
        $project: {
          date: "$dateOfBirth",
          Age: {
            $divide: [
              "$age",
              365 * 24 * 60 * 60 * 1000,
            ],
          },
          document: "$$ROOT"
        },
      },
      {
        $match:{
          Age:{
            $gte:parseInt(min_age)
          }
        }
      }
      );
  }
  else if (max_age && !min_age) {
    aggregate.push({
        $set: {
          age: { $subtract: [new Date(), "$dateOfBirth"]}
          },
      },
      {
        $project: {
          date: "$dateOfBirth",
          Age: {
            $divide: [
              "$age",
              365 * 24 * 60 * 60 * 1000,
            ],
          },
          document: "$$ROOT"
        },
      },
      {
        $match:{
          Age:{
            $lte:parseInt(max_age)
          }
        }
      }
      );
  }
  else if(max_age && min_age){
    aggregate.push({
      $set: {
        age: { $subtract: [new Date(), "$dateOfBirth"]}
        },
    },
    {
      $project: {
        date: "$dateOfBirth",
        Age: {
          $divide: [
            "$age",
            365 * 24 * 60 * 60 * 1000,
          ],
        },
        document: "$$ROOT"
      },
    },
    {
      $match:{
        Age:{
          $lte:parseInt(max_age) , $gte:parseInt(min_age),
        }
      }
    }
    );

  }



  console.log(aggregate)
  const result = await userModel.aggregate(aggregate);

  
  var userRightSwiped= await swipesModel.find({swipedBy:userId , swipedStatus:"right"});

  if(userRightSwiped){
    console.log(userRightSwiped)
    
    const filterByReference = async (result, userRightSwiped) => {
      let res = [];
      res = result.filter(el => {7
         return !userRightSwiped.find(element => {
            return element.swipedUser.toString() === el._id.toString();
         });
      });
      return res;
   }

   let array=await filterByReference(result, userRightSwiped)

  var filtered = array.filter(function(el) { return el._id.toString() !== userId}); 
  console.log(filtered)



  if (result.length > 0) {
    res.status(200).json({
      message: "Users fetched with the passed query",
      users: filtered,
    });
  } else {
    res.status(404).json({
      message: "No user found with this query",
      users: filtered,
    });
  }
}else{

  if (result.length > 0) {
    res.status(200).json({
      message: "Users fetched with the passed query",
      users: result,
    });
  } else {
    res.status(404).json({
      message: "No user found with this query",
      users: result,
    });
  }

}
}
  catch(err){
    res.json({
      message: "Error occurred while executing query",
      Error:error,
      errorMessage:err.message
    })
  }

}
  
exports.cemetrySearch= async (req,res)=>{
  try{

  const long = req.body.long;
  const lat = req.body.lat;
  let distanceInKm = req.body.distanceInKm;
  const page = req.query.page - 1;
  const limit = req.query.limit;
  const gender = req.query.gender;
  const byTimeOfAppearance = req.query.byTimeOfAppearance;
  const userId= req.body.userId;

  const aggregate =[];

  console.log(distanceInKm)
  console.log(long,lat)
  console.log(page , limit)
  console.log(byTimeOfAppearance)

    if(long,lat,distanceInKm) {
      distanceInKm= parseInt(distanceInKm)
      aggregate.push(
        {
        $geoNear: {
         near: { type: "Point", coordinates: [ long , lat ] },
          distanceField: "dist.distance_km",
          maxDistance:distanceInKm*1000 ,
          distanceMultiplier :0.001,
          includeLocs: "dist.location",
          spherical: true
      }
    },  
    { $skip: parseInt(page) * parseInt(limit)},
    { $limit: parseInt(limit)}
    )
    }


  if(Boolean(byTimeOfAppearance)===true){
    aggregate.push({
      $sort: { createdAt: -1 }
    })
  }

  if (gender) {
    aggregate.push({
      $match: {
        gender: gender,
      },
    });
  }


  console.log(aggregate + "this is aggregate")
  
  const result = await userModel.aggregate(aggregate);


  var userRightSwiped= await swipesModel.find({swipedBy:userId , swipedStatus:"right"});

  if(userRightSwiped){
    console.log(userRightSwiped)
    
    const filterByReference = async (result, userRightSwiped) => {
      let res = [];
      res = result.filter(el => {7
         return !userRightSwiped.find(element => {
            return element.swipedUser.toString() === el._id.toString();
         });
      });
      return res;
   }

   let array=await filterByReference(result, userRightSwiped)

  var filtered = array.filter(function(el) { return el._id.toString() !== userId}); 
  console.log(filtered)



  if (result.length > 0) {
    res.status(200).json({
      message: "Users fetched with the passed query",
      users: filtered,
    });
  } else {
    res.status(404).json({
      message: "No user found with this query",
      users: filtered,
    });
  }
}else{

  if (result.length > 0) {
    res.status(200).json({
      message: "Users fetched with the passed query",
      users: result,
    });
  } else {
    res.status(404).json({
      message: "No user found with this query",
      users: result,
    });
  }
  
  res.json(result)
  }

  }
  catch(err){
    res.json(err)
  }
}
exports.advanceSearch = async (req,res)=>{

  try{
    let hours = req.query.hours;
    
    const lastTimeLoggedIn=  req.query.lastTimeLoggedIn;
    const user_id = req.query.user_id;
    let sameCountry = req.query.sameCountry;
    let sameCity = req.query.sameCity;
    const annual_income = req.query.annual_income;
    const occupation = req.query.occupation;
    const academic_qualification = req.query.academic_qualification;
    const graduated_university = req.query.graduated_university;
    let constellationId = req.query.constellationId;
    const emotional_state = req.query.emotional_state;
    let children = req.query.children;
    let isSmoke = req.query.isSmoke;
    let isDrink = req.query.isDrink;
    const companyName = req.query.companyName;
    const interestIn = req.query.interestIn;
    let long = req.query.long;
    let lat = req.query.lat;
    let page= req.query.page;
    let limit = req.query.limit;
    let distanceInKm = req.query.distanceInKm;

    


   
    

    console.log(long ,lat ,distanceInKm)

    const aggregate =[];
    console.log(req.body)
    console.log(req.query)


    if(long && lat && distanceInKm) {

      long=parseFloat(long);
      lat=parseFloat(lat);
      distanceInKm= parseInt(distanceInKm)
      aggregate.push(
        {
        $geoNear: {
         near: { type: "Point", coordinates: [ long , lat ] },
          distanceField: "dist.distance_km",
          maxDistance:distanceInKm*1000 ,
          distanceMultiplier :0.001,
          includeLocs: "dist.location",
          spherical: true
      }
    },  
    { $skip: (parseInt(page-1) * parseInt(limit))},
    { $limit: parseInt(limit)}
    )
    }


    if(Boolean(lastTimeLoggedIn)=== true && hours){
      hours= parseInt(hours);
        aggregate.push({
          $lookup:{
            from : "user-logs",
            pipeline:[
              {
                $match:{
                  logType:"login"
                }
              }
            ],
            localField:"_id",
            foreignField:"user_id",
            as : "user_last_login_detail"
          }
          
        }
        ,
        {
          "$addFields": {
            "user_last_login_detail": { "$slice": ["$user_last_login_detail", -1] }
          }
        },
        { "$addFields": {
          "user_last_login_detail": {
              "$arrayElemAt": [ "$user_last_login_detail", 0 ]
          }
      }},
        {
          "$match": {
            "user_last_login_detail.createdAt":{$gt:new Date(Date.now() - hours*60*60 * 1000)}
          }
        },
       
        )
    }

    if(sameCountry && user_id){
      sameCountry = sameCountry.toLowerCase() == 'true' ? true : false; 
      if(sameCountry== true){
        const result = await userModel.findOne({_id:user_id})
        aggregate.push({
        $match:{
          city:result.city
        }
      })
      }
    }

    if(sameCity && user_id){
      sameCity = sameCity.toLowerCase() == 'true' ? true : false; 
      if(sameCity== true){
        const result = await userModel.findOne({_id:user_id})
        aggregate.push({
        $match:{
          city:result.city
        }
      })
      }
      
    }

    if(occupation){
      aggregate.push({
        $match:{
          profession: {$regex:occupation , $options:"i"}
        }
      })
    }

    if(annual_income){
      aggregate.push({
        $match: {
          annual_income:{$gte: annual_income}
        }
      })
    }

    if(academic_qualification){
      aggregate.push({
        $match:{
          academic_qualification:{$regex:academic_qualification , $options: "i" }
        }
      })
    }

    if(graduated_university){
      aggregate.push({
        $match:{
          graduated_university:{$regex:graduated_university , $options: "i" }
        }
      })
    }

    if(constellationId){
      constellationId= new ObjectId(constellationId);
      aggregate.push({
        $match:{
          constellation_id:constellationId
        }
      })
    }    

    if(emotional_state){
      aggregate.push({
        $match:{
          emotional_state:emotional_state
        }
      })
    }  

    if(children){
      children=parseInt(children);
      aggregate.push({
        $match:{
          children:children
        }
      })
    } 

    if(isSmoke){
      isSmoke = isSmoke.toLowerCase() == 'true' ? true : false; 
      console.log(isSmoke)
        aggregate.push({
        $match:{
          isSmoke:isSmoke
        }
      })
    }

    if(isDrink){
      isDrink = isDrink.toLowerCase() == 'true' ? true : false; 
      console.log(isDrink)

      aggregate.push({
        $match:{
          isDrink:isDrink
        }
      })
    }

    if(companyName){
      aggregate.push({
        $match:{
          companyName:{$regex:companyName , $options: "i"}
        }
      })
    }

    if(interestIn){
      aggregate.push({
        $match:{
          interestIn:interestIn
        }
      })
    }

    




    console.log(aggregate)
    

    const result =  await userModel.aggregate(aggregate);
    
    
    var userRightSwiped= await swipesModel.find({swipedBy:user_id , swipedStatus:"right"});

    if(userRightSwiped.length>0){
    console.log(userRightSwiped)
    
    const filterByReference = async (result, userRightSwiped) => {
      let res = [];
      res = result.filter(el => {
         return !userRightSwiped.find(element => {
            return element.swipedUser.toString() === el._id.toString();
         });
      });
      return res;
   }

   let array=await filterByReference(result, userRightSwiped)

  var filtered = array.filter(function(el) { return el._id.toString() !== user_id}); 
  console.log(filtered)

  if(result){
    const isSaved= await storeLastQuery(hours , lastTimeLoggedIn , user_id , sameCountry , sameCity , annual_income , occupation , academic_qualification , graduated_university , constellationId 
    , emotional_state , children , isSmoke ,isDrink , companyName , interestIn , long , lat ,page , limit ,distanceInKm)
    console.log(isSaved)
}

  if (result.length > 0) {
    res.status(200).json({
      message: "Users fetched with the passed query",
      users: filtered,
    });
  } else {
    res.status(404).json({
      message: "No user found with this query",
      users: filtered,
    });
  }
}
else{

  var filtered = result.filter(function(el) { return el._id.toString() !== user_id}); 
  console.log(filtered)
  if (result.length > 0) {
    res.status(200).json({
      message: "Users fetched with the passed query",
      users: filtered,
    });
  } else {
    res.status(404).json({
      message: "No user found with this query",
      users: filtered,
    });
  }

  }

}
catch(err){
  res.json({
    message: "Error Occurred while processing",
    error:err.message,
  })
}

}

exports.updateLocation =async  (req,res)=>{
  
  const userId= req.body.userId; 
  const long=req.body.long;
  const lat= req.body.lat;

  try{
     userModel.findOneAndUpdate({_id:userId}
      ,
      {
        $set: {
          "location.coordinates": [req.body.long, req.body.lat],
        },
      },
      {
        new:true,
      },
      function(err,result){
        if(result){
          res.json({
            message:"location has updated successfully",
            result: result,
            statusCode:201

          })
        }
        else{
          res.json({
            message:"location could not be updated , May be this user Id not exist",
            statusCode:404
          })
        }
      }
      )
 
}
catch(error){
  res.json({
    message:"Error occurred while updating location",
    Error:error,
    errorMessage:error.message
    
  })
}
}

exports.getUserByName = async (req,res)=>{
  const name = req.query.name;
  const radiusInKm= req.query.radiusInKm
  const long= req.body.long;
  const lat= req.body.lat;
  const userId= req.body.userId;
  
  try{
     

    const result = await userModel.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [ long, lat ] },
          distanceField: "dist.distance_km",
           maxDistance:radiusInKm*1000 ,
           distanceMultiplier :0.001,
           includeLocs: "dist.location",
           spherical: true
       }
      },
      {
        $match: {
          userName: { $regex: name, $options: "i" }
        },
      },
      {
        $set: {
          age: { $subtract: [new Date(), "$dateOfBirth"]}
          },
      },
      {
        $project: {
          date: "$dateOfBirth",
          Age: {
            $divide: [
              "$age",
              365 * 24 * 60 * 60 * 1000,
            ],
          },
          document: "$$ROOT"
        },
      },
      
     
    ])


    console.log(result)

  var userRightSwiped= await swipesModel.find({swipedBy:userId , swipedStatus:"right"});
  console.log(userRightSwiped);

  var filtered = result.filter(function(el) { return el._id.toString() !== userId}); 

  function getArray(filtered,userRightSwiped){
    for(let element of filtered) {
      for(let el of userRightSwiped) {
        if(el.swipedUser.toString() === element._id.toString()){
          element.swipedStatus = "true";
        }
   }
  }
    return filtered
  }

  const newfiltered= getArray(filtered , userRightSwiped)
  console.log(newfiltered)
  

    if (result){
      res.json({
        message: "Successfully fetched records",
        users: newfiltered,
        statusCode:200
      })
    }
    else{
      res.json({
        message: "Could not find records"
      })
    }
   
  //   const result = await  userModel.find( { userName: { $regex: name, $options: "i" } })
  //   if(result){
  //     res.json({
  //       message: "Result fetched",
  //       result: result,
  //       statusCode: 200
  //     })
  //   }
  //   else{
  //     res.json({
  //       message:"Result is null",
  //     })
  //   }
  }
  catch(err){
    res.json({
      message:"Error occurred while fetching result",
      statusCode:404,
      Error:err.message
    })
  }
 

}

exports.oneDSearch = async (req, res) => {

  try{
    let user_id=req.body.user_id;
    user_id= new ObjectId(user_id);
   let foundResult  = await lastQueryModel.aggregate([
    {
      $match:{user_id:user_id}
    },
    {
      "$match": {
        "createdAt":{$gt:new Date(Date.now() - 24*60*60 * 1000)}
      }
    }

   ]);

   if(foundResult.length > 0){
    
    foundResult= foundResult[0];

    let isSmoke = foundResult.isSmoke;
    let hours = foundResult.hours;
    let lastTimeLoggedIn = foundResult.lastTimeLoggedIn;
    let user_id = foundResult.user_id;
    let sameCountry = foundResult.sameCountry;
    let sameCity = foundResult.sameCity;
    let annual_income = foundResult.annual_income;
    let occupation = foundResult.occupation;
    let academic_qualification = foundResult.academic_qualification;
    let graduated_university = foundResult.graduated_university;
    let emotional_state = foundResult.emotional_state;
    let constellationId = foundResult.constellationId;
    let children =foundResult.children;
    let isDrink = foundResult.isDrink;
    let companyName=foundResult.companyName;
    let interestIn = foundResult.interestIn;
    let long = foundResult.long;
    let lat = foundResult.lat;
    let page = foundResult.page;
    let limit = foundResult.limit;
    let distanceInKm = foundResult.distanceInKm;

    console.log(long ,lat ,distanceInKm)

    const aggregate =[];
    console.log(req.body)
    console.log(req.query)


    if(long && lat && distanceInKm) {

      long=parseFloat(long);
      lat=parseFloat(lat);
      distanceInKm= parseInt(distanceInKm)
      aggregate.push(
        {
        $geoNear: {
         near: { type: "Point", coordinates: [ long , lat ] },
          distanceField: "dist.distance_km",
          maxDistance:distanceInKm*1000 ,
          distanceMultiplier :0.001,
          includeLocs: "dist.location",
          spherical: true
      }
    },  
    { $skip: (parseInt(page-1) * parseInt(limit))},
    { $limit: parseInt(limit)}
    )
    }


    if(Boolean(lastTimeLoggedIn)=== true && hours){
      hours= parseInt(hours);
        aggregate.push({
          $lookup:{
            from : "user-logs",
            pipeline:[
              {
                $match:{
                  logType:"login"
                }
              }
            ],
            localField:"_id",
            foreignField:"user_id",
            as : "user_last_login_detail"
          }
          
        }
        ,
        {
          "$addFields": {
            "user_last_login_detail": { "$slice": ["$user_last_login_detail", -1] }
          }
        },
        { "$addFields": {
          "user_last_login_detail": {
              "$arrayElemAt": [ "$user_last_login_detail", 0 ]
          }
      }},
        {
          "$match": {
            "user_last_login_detail.createdAt":{$gt:new Date(Date.now() - hours*60*60 * 1000)}
          }
        },
       
        )
    }

    if(sameCountry && user_id){
      sameCountry = sameCountry.toLowerCase() == 'true' ? true : false; 
      if(sameCountry== true){
        const result = await userModel.findOne({_id:user_id})
        aggregate.push({
        $match:{
          city:result.city
        }
      })
      }
    }

    if(sameCity && user_id){
      sameCity = sameCity.toLowerCase() == 'true' ? true : false; 
      if(sameCity== true){
        const result = await userModel.findOne({_id:user_id})
        aggregate.push({
        $match:{
          city:result.city
        }
      })
      }
      
    }

    if(occupation){
      aggregate.push({
        $match:{
          profession: {$regex:occupation , $options:"i"}
        }
      })
    }

    if(annual_income){
      aggregate.push({
        $match: {
          annual_income:{$gte: annual_income}
        }
      })
    }

    if(academic_qualification){
      aggregate.push({
        $match:{
          academic_qualification:{$regex:academic_qualification , $options: "i" }
        }
      })
    }

    if(graduated_university){
      aggregate.push({
        $match:{
          graduated_university:{$regex:graduated_university , $options: "i" }
        }
      })
    }

    if(constellationId){
      constellationId= new ObjectId(constellationId);
      aggregate.push({
        $match:{
          constellation_id:constellationId
        }
      })
    }    

    if(emotional_state){
      aggregate.push({
        $match:{
          emotional_state:emotional_state
        }
      })
    }  

    if(children){
      children=parseInt(children);
      aggregate.push({
        $match:{
          children:children
        }
      })
    } 

    if(isSmoke){
      isSmoke = isSmoke.toLowerCase() == 'true' ? true : false; 
      console.log(isSmoke)
        aggregate.push({
        $match:{
          isSmoke:isSmoke
        }
      })
    }

    if(isDrink){
      isDrink = isDrink.toLowerCase() == 'true' ? true : false; 
      console.log(isDrink)

      aggregate.push({
        $match:{
          isDrink:isDrink
        }
      })
    }

    if(companyName){
      aggregate.push({
        $match:{
          companyName:{$regex:companyName , $options: "i"}
        }
      })
    }

    if(interestIn){
      aggregate.push({
        $match:{
          interestIn:interestIn
        }
      })
    }

    




    console.log(aggregate)
    

    const result =  await userModel.aggregate(aggregate);
    
    
    var userRightSwiped= await swipesModel.find({swipedBy:user_id , swipedStatus:"right"});

    if(userRightSwiped.length>0){
    console.log(userRightSwiped)
    
    const filterByReference = async (result, userRightSwiped) => {
      let res = [];
      res = result.filter(el => {
         return !userRightSwiped.find(element => {
            return element.swipedUser.toString() === el._id.toString();
         });
      });
      return res;
   }

   let array=await filterByReference(result, userRightSwiped)

  var filtered = array.filter(function(el) { return el._id.toString() !== user_id}); 
  console.log(filtered)

  if(result){
    const isSaved= await storeLastQuery(hours , lastTimeLoggedIn , user_id , sameCountry , sameCity , annual_income , occupation , academic_qualification , graduated_university , constellationId 
    , emotional_state , children , isSmoke ,isDrink , companyName , interestIn , long , lat ,page , limit ,distanceInKm)
    console.log(isSaved)
}

  if (result.length > 0) {
    res.status(200).json({
      message: "Users fetched with the passed query",
      users: filtered,
    });
  } else {
    res.status(404).json({
      message: "No user found with this query",
      users: filtered,
    });
  }
}
else{

  var filtered = result.filter(function(el) { return el._id.toString() !== user_id}); 
  console.log(filtered)
  if (result.length > 0) {
    res.status(200).json({
      message: "last Query within 24 hours found",
      message2: "Users fetched with the passed query",
      users: filtered,
    });
  } else {
    res.status(404).json({
      message: "No user found with this query",
      users: filtered,
    });
  }

  }

   }
   else{
    res.json({
      message: "last query within 24 hours not found for this user",
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

const registerSchema = Joi.object({
  email: Joi.string().min(6).email(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string(),
  signupType: Joi.string(),
  gender: Joi.string(),
  dateOfBirth: Joi.string(),
  profession: Joi.string(),
  userName: Joi.string(),
  fcmToken: Joi.string(),
  userEmailAddress: Joi.string(),
  education: Joi.string(),
  appreciated_text: Joi.string(),
  bio: Joi.string(),
  height: Joi.number(),
  academic_qualification:Joi.string(),
  isSmoke:Joi.boolean(),
  isDrink:Joi.boolean(),
  constellation_id:Joi.string(),
  annual_income: Joi.string(),
  children:Joi.number(),
  emotional_state:Joi.string(),
  profession:Joi.string(),
  country:Joi.string(),
  city:Joi.string(),
  state:Joi.string(),
  graduated_university:Joi.string(),
  companyName: Joi.string(),
  interestIn:Joi.string(),
  long:Joi.string(),
  lat:Joi.string(),
});

const loginSchema = Joi.object({
  email: Joi.string().min(6).email(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string(),
  ip:Joi.string(),
  country: Joi.string(),
  logType: Joi.string()
});

async function  storeLastQuery(hours , lastTimeLoggedIn , user_id , sameCountry , sameCity , annual_income , occupation , academic_qualification , graduated_university , constellationId 
  , emotional_state , children , isSmoke ,isDrink , companyName , interestIn , long , lat ,page , limit ,distanceInKm)

  {
    try{
      const foundResult =await lastQueryModel.findOne({user_id:user_id});

      if(!foundResult){
        const saveQuery = new lastQueryModel({
          _id: mongoose.Types.ObjectId(),
          user_id:user_id,
          hours: hours,
          lastTimeLoggedIn: lastTimeLoggedIn,
          sameCity: sameCity,
          sameCountry: sameCountry,
          annual_income:annual_income,
          occupation: occupation,
          academic_qualification:academic_qualification,
          graduated_university: graduated_university,
          constellation_id:constellationId,
          emotional_state:emotional_state,
          children:children,
          isSmoke:isSmoke,
          isDrink:isDrink,
          companyName:companyName,
          interestIn:interestIn,
          long:long,
          lat:lat,
          page:page,
          limit:limit,
          distanceInKm:distanceInKm
        })
  
        var result = await saveQuery.save();
      }
      else{
        var result = await lastQueryModel.findOneAndUpdate({user_id:user_id} ,
          {
            user_id:user_id,
            hours: hours,
            lastTimeLoggedIn: lastTimeLoggedIn,
            sameCity: sameCity,
            sameCountry: sameCountry,
            annual_income:annual_income,
            occupation: occupation,
            academic_qualification:academic_qualification,
            graduated_university:graduated_university,
            constellation_id:constellationId,
            emotional_state:emotional_state,
            children:children,
            isSmoke:isSmoke,
            isDrink:isDrink,
            companyName:companyName,
            interestIn:interestIn,
            long:long,
            lat:lat,
            page:page,
            limit:limit,
            distanceInKm:distanceInKm
            
          } ,{ new:true})
      }

      

      if(result){
        console.log("result saved successfully");
        console.log(result)
        return true
      }
      else{
        console.log("query does not save")
        return false
      }
    }
    catch(err){
      console.log(err)
    }

      
  }