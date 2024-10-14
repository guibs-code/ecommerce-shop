/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Guilherme da Silva
Student ID: 122538234
Date: October 13, 2024
Vercel Web App URL: 
GitHub Repository URL: https://github.com/guibs-code/web322-app

********************************************************************************/

const storeServices = require('./store-service')
const express = require('express')
const path = require('path')

const app = express()
const HTTP_PORT = process.env.PORT || 8080

app.set('views', __dirname + '/views')

app.use(express.static(__dirname + '/public'))

storeServices
	.initialize()
	.then(() => {
		app.listen(HTTP_PORT, () =>
			console.log(`Express http server listening on: ${HTTP_PORT}`)
		)
	})
	.catch((err) => {
		console.log(err)
	})

app.get('/', (req, res) => {
	res.redirect('/about')
})

app.get('/about', (req, res) => {
	res.sendFile(path.join(__dirname, '/views/about.html'))
})

app.get('/shop', (req, res) => {
	storeServices
		.getPublishedItems()
		.then((data) => res.send(data))
		.catch((err) => res.send({ message: err }))
})

app.get('/items', (req, res) => {
	storeServices
		.getAllItems()
		.then((data) => res.send(data))
		.catch((err) => res.send({ message: err }))
})

app.get('/categories', (req, res) => {
	storeServices
		.getCategories()
		.then((data) => res.send(data))
		.catch((err) => res.send({ message: err }))
})

app.use((req, res, next) => {
	res.status(404).sendFile(path.join(__dirname, '/views/404.html'))
})

module.exports = app
