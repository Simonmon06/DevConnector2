const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const config = require('config');

// @route   GET api/users
// @desc    Register route
// @access  Public no need token
router.post('/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please entera password with 6 or more characters'
    ).isLength({ min: 6 }),
  ]
  , async (req,res) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // get our custom message
    }
    const { name, email, password } = req.body;
    try{
      let user = await User.findOne({ email });
      //See if user exists
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      //Get users gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mp',
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      //everything return a promise put a await in front of it.
      // Encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);
      await user.save();

      //Return jsonwebToken
      const payload = {
        user: {
          id: user.id,
        },
      };

      //sign the payload
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 }, //change 36000 later
        (error, token) => {
          if (error) throw error;
          res.json({ token });
        }
      );
    } catch(err){
      console.error(err.message);
      res.status(500).send('Server error');
    }
    console.log(req.body)
})

module.exports = router;
