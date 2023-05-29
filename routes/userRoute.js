

const router = require("express").Router();
const upload = require("../middlewares/multer")
const controller = require("../controllers/userController");
const auth= require("../middlewares/auth")

router.get("/allUsers", controller.getAllUsers);
router.get("/specificUser/:userId", controller.getSpecificUser);
router.delete("/deleteUser/:userId", controller.deleteUser);
router.put("/updateUserPassword", controller.updatePassword);
router.put("/changeUserBlockStatus", controller.blockStatusChange);
router.put("/updateUserProfile", upload.single("profileImage"), controller.updateUserProfile);
router.post("/phOTP", controller.postEnterNumber);
router.post("/verifyOTP", controller.verifyOTP);
router.post("/usersInRadius", controller.getUsersWithinRadius);
router.put("/updateUserLocation", controller.updateLocation);
router.post("/getUserByName", controller.getUserByName);
router.post("/register", upload.single("profileImage"), controller.register);
router.post("/login" , controller.login);
router.post("/checkLogin" , auth, controller.checkLogin);
router.post("/cemetrysearch" , controller.cemetrySearch);
router.post("/advanceSearch" , controller.advanceSearch);
router.post("/oneDSearch" , controller.oneDSearch);





module.exports = router;
