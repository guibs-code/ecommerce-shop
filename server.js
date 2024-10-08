/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Guilherme da Silva
Student ID: 122538234
Date: October 9, 2024
Vercel Web App URL: 
GitHub Repository URL: 

********************************************************************************/

const storeServices = require('./store-service')
const express = require('express')
const path = require('path')

const app = express()
const HTTP_PORT = process.env.PORT || 8080

app.use(express.static('public'))

app.listen(HTTP_PORT, () =>
	console.log(`Express http server listening on: ${HTTP_PORT}`)
)

app.get('/', (req, res) => {
	res.redirect('/about')
})

app.get('/about', (req, res) => {
	res.sendFile(path.join(__dirname, '/views/about.html'))
})

app.get('/shop', (req, res) => {
	res.send('TODO: get all items where published == true in a JSON string')
})

app.get('/items', (req, res) => {
	res.send('TODO: get all items in the items.json file in a JSON string')
})

app.get('/categories', (req, res) => {
	res.send('TODO: get all the categories in a JSON string')
})

app.use((req, res, next) => {
	res.status(404).sendFile(path.join(__dirname, '/views/404.html'))
})
