/*********************************************************************************
WEB322 – Assignment 06
I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Guilherme da Silva
Student ID: 122538234
Date: December 7, 2024
Vercel Web App URL: https://web322-8c6691wat-guibs-codes-projects.vercel.app/about
GitHub Repository URL: https://github.com/guibs-code/web322-app

********************************************************************************/

const mongoose = require('mongoose')

const Schema = mongoose.Schema

let userSchema = new Schema({
	userName: {
		type: String,
		unique: true,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	loginHistory: [{ dateTime: Date, userAgent: String }],
})

let User // to be defined on new connection (see initialize)

module.exports.initialize() = function () {
    return new Promise((res, rej) => {
        let db = mongoose.createConnection(process.env.MONGO_URI)

        db.on('error', (err) => {
            rej(err)
        })

        db.once('open', () => {
            User = db.model('users', userSchema)
            res()
        })
    })
}

module.exports.registerUser = function (userData) {
    return new Promise((res, rej) => {
        if (userData.password !== userData.password2) {
            rej('Passwords do not match')
        } else {
            let newUser = new User(userData)
            newUser.save((err) => {
                if (err) {
                    if (err.code == 11000) {
                        rej('User Name already taken')
                    } else {
                        rej('There was an error creating the user: ' + err)
                    }
                } else {
                    res()
                }
            })
        }
    })
}

module.exports.checkUser = function (userData) {
    return new Promise((res, rej) => {
        User.find({ userName: userData.userName })
            .exec()
            .then((users) => {
                if (users.length == 0) {
                    rej('Unable to find user: ' + userData.userName)
                } else {
                    if (users[0].password !== userData.password) {
                        rej('Incorrect Password for user: ' + userData.userName)
                    } else {
                        users[0].loginHistory.push({
                            dateTime: new Date().toString(),
                            userAgent: userData.userAgent,
                        })

                        User.update(
                            { userName: users[0].userName },
                            { $set: { loginHistory: users[0].loginHistory } }
                        )
                            .exec()
                            .then(() => {
                                res(users[0])
                            })
                            .catch((err) => {
                                rej('There was an error verifying the user: ' + err)
                            })
                    }
                }
            })
            .catch((err) => {
                rej('Unable to find user: ' + userData.userName)
            })
    })
}