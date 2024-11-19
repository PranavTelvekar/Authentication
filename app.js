const express=require("express")
const app=express()
app.use(express.urlencoded({extended:true}));

let port = 8080

const User=require("./models/user");

// getting-started.js
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://Pranav:123@cluster0.sym7s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}


const ExpressError=require("./utils/ExpressError")
const wrapAsync=require("./utils/wrapAsync")

const path=require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
const ejsMate=require("ejs-mate")
app.engine("ejs",ejsMate);

app.listen(port,()=>{
    console.log(`Server Is Start On Port ${port}`);
})


const session=require("express-session");
const sessionOption={
    secret:"mysupersecret",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
};
app.use(session(sessionOption));

const flash=require("connect-flash");
app.use(flash())


const passport=require("passport")
const localStrategy=require("passport-local");

app.use(passport.initialize())
app.use(passport.session())

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    res.locals.currentUser=req.user
    next()
})



app.get("/",(req,res)=>{
    res.render("home.ejs")
})



app.get("/signup",(req,res)=>{
    res.render("signup.ejs")
})

app.post("/signup",wrapAsync(async(req,res)=>{
    try {
        let {username,email,password}=req.body;
        const newUser=new User({email,username});
        const registeredUser=await User.register(newUser,password);
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome");
            res.redirect("/")
        });
        
    } catch (e) {
        req.flash("error",e.message)
    }
}))


app.get("/login",(req,res)=>{
    res.render("login.ejs");
})

app.post("/login",passport.authenticate("local", { failureRedirect: "login",failureFlash:true }),wrapAsync(async(req,res)=>{
    res.locals.currentUser=req.user;
    req.flash("success","You Are Logged In Successfuly");
    res.redirect("/");
}))



app.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You Are Logged out");
        res.redirect("/");
    })
})



app.use("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Exists"));
})
app.use((err,req,res,next)=>{
    let {statusCode,message}=err;
    res.render("ErrorHandling/error.ejs",{message});
})
