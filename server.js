/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Guilherme da Silva
Student ID: 122538234
Date: October 13, 2024
Vercel Web App URL: https://web322-8c6691wat-guibs-codes-projects.vercel.app/about (data not working)
GitHub Repository URL: https://github.com/guibs-code/web322-app

********************************************************************************/

const express = require('express')
const path = require('path')
const storeServices = require('./store-service')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({
	cloud_name: 'dnojmvf5a',
	api_key: '965828582314866',
	api_secret: '5y3ZXBWsbyzZhBfmn_RE2O6tNdU',
	secure: true,
})

const upload = multer() // no { storage: storage } since we are not using disk storage

const app = express()
const userRouter = express.Router()

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
	if (req.query.category) {
		storeServices
			.getItemsByCategory(req.query.category)
			.then((data) => res.send(data))
			.catch((err) => res.send({ message: err }))
	} else if (req.query.minDate) {
		storeServices
			.getItemsByMinDate(req.query.minDate)
			.then((data) => res.send(data))
			.catch((err) => res.send({ message: err }))
	} else {
		storeServices
			.getAllItems()
			.then((data) => res.send(data))
			.catch((err) => res.send({ message: err }))
	}
})

app.get('/categories', (req, res) => {
	storeServices
		.getCategories()
		.then((data) => res.send(data))
		.catch((err) => res.send({ message: err }))
})

app.get('/items/add', (req, res) => {
	res.sendFile(path.join(__dirname, '/views/addItem.html'))
})

app.get('/item/:id', (req, res) => {
	storeServices
		.getItemById(req.params.id)
		.then((data) => res.send(data))
		.catch((err) => res.send({ message: err }))
})

app.post('/items/add', upload.single('featureImage'), (req, res) => {
	if (req.file) {
		let streamUpload = (req) => {
			return new Promise((resolve, reject) => {
				let stream = cloudinary.uploader.upload_stream((error, result) => {
					if (result) {
						resolve(result)
					} else {
						reject(error)
					}
				})

				streamifier.createReadStream(req.file.buffer).pipe(stream)
			})
		}

		async function upload(req) {
			let result = await streamUpload(req)
			return result
		}

		upload(req).then((uploaded) => {
			processItem(uploaded.url)
		})
	} else {
		processItem('')
	}

	function processItem(imageUrl) {
		req.body.featureImage = imageUrl
		storeServices.addItem(req.body)
	}

	res.redirect('/items')
})

app.use((req, res, next) => {
	res.status(404).sendFile(path.join(__dirname, '/views/404.html'))
})

module.exports = app
