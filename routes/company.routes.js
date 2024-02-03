const router = require("express").Router();
const { isAuthenticated } = require("../middleware/jwt.middleware");

const Feedback = require("../models/Feedback.model");
const Company = require("../models/Company.model");
const User = require("../models/User.model");
const crypto = require("crypto");

router.patch("/company", isAuthenticated, async (req, res) => {
    try {
        const { _id } = req.payload;
        console.log(_id)
        const user = await User.findOne({ _id }).populate('company');
        if (!user || !user.company) {
            return res.status(404).json({ message: "Not Found" })
        }
        await Company.updateOne({ _id: user.company._id, accessToken: crypto.randomBytes(20).toString('hex') });
        const company = await Company.findOne({ _id: user.company._id })
        return res.status(200).json(company)
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
})

router.get("/company", isAuthenticated, async (req, res) => {
    try {
        const { _id } = req.payload;
        const user = await User.findOne({ _id }).populate('company');
        if (!user || !user.company) {
            return res.status(404).json({ message: "Not Found" })
        }
        return res.status(200).json(user.company)
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
});

router.get("/meeting", isAuthenticated, async (req, res) => {
    try {
        const { _id } = req.payload;
        const user = await User.findById({_id})
        res.status(200).json({meeting: user.meeting})
    } catch (error) {
        console.log(error)
    }
})

router.post("/meeting", isAuthenticated, async (req, res) => {
    try {
        const { _id } = req.payload;
        const {meeting} = req.body;

        const user = await User.findOneAndUpdate({_id}, {meeting: meeting})
        res.status(200).json({message: "All good"})
    } catch (error) {
        console.log(error)
    }

});

router.delete("/meeting", isAuthenticated, async (req, res) => {
    try {
        const { _id } = req.payload;
        const user = await User.findOneAndUpdate({_id}, {$unset: {meeting: 1}})
    } catch (error) {
        console.log(error)
    }
})


module.exports = router;
