const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateRegisterInputDoc = require("../../validation/registerDoc");
const validateLoginInput = require("../../validation/login");
// Load User model
const User = require("../../models/user");

// Load Doctor model
const Doc = require("../../models/doc");

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        city: req.body.city,
      });
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;
  // Find user by email
  User.findOne({ email }).then((user) => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }
    // Check password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
        };
        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

// @route POST api/users/registerDoc
// @desc Register Doc
// @access Public
router.post("/registerDoc", (req, res) => {
  // Form validation
  const { errors, isValid } = validateRegisterInputDoc(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Doc.findOne({ email: req.body.email }).then((doc) => {
    if (doc) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const newDoc = new Doc({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        special: req.body.special,
        bio: req.body.bio,
        city: req.body.city,
        state: req.body.state,
      });
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newDoc.password, salt, (err, hash) => {
          if (err) throw err;
          newDoc.password = hash;
          newDoc
            .save()
            .then((doc) => res.json(doc))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/loginDoc", (req, res) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;
  // Find user by email
  Doc.findOne({ email }).then((doc) => {
    // Check if user exists
    if (!doc) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }
    // Check password
    bcrypt.compare(password, doc.password).then((isMatch) => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: doc.id,
          name: doc.name,
        };
        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

// Patient Contacting Doctor
router.post("/contactDoctor", (req, res) => {
  let { name, email, description } = req.body;
  let doctorId = "5fb81a60edc0683468c63ccb";
  let patientId = "5fb81a49edc0683468c63cca";
  let newMessage = {
    doctorId: doctorId,
    patientId: patientId,
    name: name,
    email: email,
    description: description,
    date: new Date(),
  };
  User.findByIdAndUpdate(
    patientId,
    { $push: { yourMessages: newMessage } },
    function (err, doc) {
      if (err) {
        console.error(err);
      } else {
        console.log("Message saved in database");
      }
    }
  );

  Doc.findByIdAndUpdate(
    doctorId,
    { $push: { patientMessages: newMessage } },
    function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("Message sent to the doctor");
        // res.json({ message: "Send" });
      }
    }
  );
});

// Doctor Replying Back To Patient
router.post("/contactPatient", (req, res) => {
  let { replyMessage } = req.body;
  let doctorId = "5fb81a60edc0683468c63ccb";
  let patientId = "5fb81a49edc0683468c63cca";
  let newMessage = {
    doctorId: doctorId,
    reply: replyMessage,
    date: new Date(),
  };
  User.findByIdAndUpdate(
    patientId,
    { $push: { doctorMessages: newMessage } },
    function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log("Message sent to the patient");
        // res.json({ message: "Send" });
      }
    }
  );
});

// Fetch All Doctors
router.get("/allDoctors", (req, res) => {
  Doc.find({}, (err, doctors) => {
    if (err) {
      console.log(err);
    } else {
      res.json(doctors);
    }
  });
});
// Get doctors based on the location
router.post("/getDoctorsAtLocation", (req, res) => {
  Doc.find({ city: req.body.city }, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      res.json(doc);
    }
  });
});

module.exports = router;
