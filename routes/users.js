var express = require("express");
var router = express.Router();
var { mongodb, MongoClient, dbUrl } = require("../dbConfig");
var {hashPassword, hashCompare,createToken,verifyToken} = require("../Auth");

// Post method for signup
router.post("/signup", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("Rent");
    let user = await db.collection("users").find({ email: req.body.email });
    if (user.length > 0) {
      res.json({
        statusCode: 400,
        message: "User Already Exists",
      });
    } else {
      let hashedPassword = await hashPassword(req.body.password,req.body.cpassword);
      req.body.password= hashedPassword;
      req.body.cpassword = hashedPassword;

      let user = await db.collection("users").insertOne(req.body);
      res.json({
        statusCode: 200,
        message: "User SignUp Successfull",
      }); 
    }
  } catch (error) {
    console.log(error);
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  } finally {
    client.close();
  }
});

// Post methof for login
router.post("/login", async (req, res) => {
  const client = await MongoClient.connect(dbUrl);
  try {
    let db = await client.db("Rent");
    let user = await db.collection("users").findOne({ email: req.body.email });
    if (user) {
      let compare = await hashCompare(req.body.password, user.password);
      if (compare) {
        let token  = await createToken(user.email,user.firstName,user.role  )
        res.json({
          statusCode: 200,
          role:user.role, 
          email: user.email,
          firstName: user.firstName,  
          token
        });
      } else {
        res.json({
          statusCode: 400,
          message: "Invalid Password",
        });
      }
    } else {
      res.json({
        statusCode: 404,
        message: "User Not Found",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  } finally {
    client.close();
  }
});

// Post method for orderdetails
router.post('/orderdetails',async(req,res)=>{
  const client = await MongoClient.connect(dbUrl);
  try{
    let db = await client.db("Rent");
    let order = await db.collection("OrderDetails").find({mobile:req.body.mobile});
    if(order.length>0){
      res.json({
        statusCode:400,
        message:"Order Already Exists"
      });
    }
    else
    {
      const crypto = require('crypto')
      const id = crypto.randomBytes(16).toString("hex");
      req.body['small_id'] = id;
      let order = await db.collection("OrderDetails").insertOne(req.body);
      res.json({
        statusCode:200,
        message:"Order Successfully1",
        small_id:req.body['small_id']
     });
    }
  }
  catch{
    console.log(error)
    res.json({
      statusCode:500,
      messgae:"Internal Server Error"
    })
  }

})

// Post method for authentiction
router.post("/auth",verifyToken,async(req,res)=>{
  res.json({
    statusCode:200,
    message:req.body.purpose
  })
})



module.exports = router;