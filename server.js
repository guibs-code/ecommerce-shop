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

require('dotenv').config()
const express = require('express')
const path = require('path')
const itemData = require('./store-service')
const authData = require('./auth-service')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const exphbs = require('express-handlebars')
const stripJs = require('strip-js')
const clientSessions = require('client-sessions')

const app = express()
const userRouter = express.Router()
const HTTP_PORT = process.env.PORT || process.env.HTTP_PORT

// Handlebars custom helpers
const hbsHelpers = {
	navLink: function (url, options) {
		return (
			'<li class="nav-item"><a' +
			(url == app.locals.activeRoute
				? ' class="nav-link active" '
				: ' class="nav-link" ') +
			'href ="' +
			url +
			'">' +
			options.fn(this) +
			'</a></li>'
		)
	},
	equal: function (lvalue, rvalue, options) {
		if (arguments.length < 3)
			throw new Error('Handlebars Helper equal needs 2 parameters')

		if (lvalue != rvalue) {
			return options.inverse(this)
		} else {
			return options.fn(this)
		}
	},
	safeHTML: function (context) {
		return stripJs(context)
	},
	formatDate: function (dateObj) {
		let year = dateObj.getFullYear()
		let month = (dateObj.getMonth() + 1).toString()
		let day = dateObj.getDate().toString()
		return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
	},
}

// Handlebars setup
app.engine(
	'.hbs',
	exphbs.engine({
		extname: '.hbs',
		helpers: hbsHelpers,
	})
)
app.set('view engine', '.hbs')

// Configure client-sessions
app.use(
	clientSessions({
		cookieName: 'session',
		secret: process.env.SESSION_SECRET,
		duration: 3 * 60 * 60 * 1000, // 3 hours
		activeDuration: 5 * 60 * 1000, // 5 minutes
	})
)

// Cloudinary setup
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_KEY,
	api_secret: process.env.CLOUD_SECRET,
	secure: true,
})

const upload = multer() // no { storage: storage } since we are not using disk storage

app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded())

// Middleware to make "session" available to all views
app.use((req, res, next) => {
	res.locals.session = req.session
	next()
})

// Helper function to check if the user is logged in
function ensureLogin(req, res, next) {
	if (!req.session.user) {
		res.redirect('/login')
	} else {
		next()
	}
}

itemData
	.initialize()
	.then(authData.initialize)
	.then(() => {
		app.listen(process.env.HTTP_PORT, () =>
			console.log(`app listening on: ${process.env.HTTP_PORT}`)
		)
	})
	.catch((err) => {
		console.log('unable to start server: ' + err)
	})

app.use(function (req, res, next) {
	let route = req.path.substring(1)

	app.locals.activeRoute =
		'/' +
		(isNaN(route.split('/')[1])
			? route.replace(/\/(?!.*)/, '')
			: route.replace(/\/(.*)/, ''))

	app.locals.viewingCategory = req.query.category

	next()
})

///////////////////////////////////////
// SIMPLE ROUTES
///////////////////////////////////////

app.get('/', (req, res) => {
	res.redirect('/shop')
})

app.get('/about', (req, res) => {
	res.render('about')
})

///////////////////////////////////////
// SHOP ROUTES
///////////////////////////////////////

app.get('/shop', async (req, res) => {
	let currentDate = new Date()
	let day = String(currentDate.getDay()).padStart(2, '0')
	let dateStr = `${currentDate.getFullYear}-${currentDate.getMonth}`

	// Declare an object to store properties for the view
	let viewData = {}

	try {
		// declare empty array to hold "item" objects
		let items = []

		// if there's a "category" query, filter the returned items by category
		if (req.query.category) {
			// Obtain the published "item" by category
			items = await itemData.getPublishedItemsByCategory(req.query.category)
		} else {
			// Obtain the published "items"
			items = await itemData.getPublishedItems()
		}

		// sort the published items by itemDate
		items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate))

		// get the latest item from the front of the list (element 0)
		let item = items[0]

		// store the "items" and "item" data in the viewData object (to be passed to the view)
		viewData.items = items
		viewData.item = item
	} catch (err) {
		viewData.message = 'no results'
	}

	try {
		// Obtain the full list of "categories"
		let categories = await itemData.getCategories()

		// store the "categories" data in the viewData object (to be passed to the view)
		viewData.categories = categories
	} catch (err) {
		viewData.categoriesMessage = 'no results'
	}

	// render the "shop" view with all of the data (viewData)
	res.render('shop', { data: viewData })
})

app.get('/shop/:id', async (req, res) => {
	// Declare an object to store properties for the view
	let viewData = {}

	try {
		// declare empty array to hold "item" objects
		let items = []

		// if there's a "category" query, filter the returned items by category
		if (req.query.category) {
			// Obtain the published "items" by category
			items = await itemData.getPublishedItemsByCategory(req.query.category)
		} else {
			// Obtain the published "items"
			items = await itemData.getPublishedItems()
		}

		// sort the published items by itemDate
		items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate))

		// store the "items" and "item" data in the viewData object (to be passed to the view)
		viewData.items = items
	} catch (err) {
		viewData.message = 'no results'
	}

	try {
		// Obtain the item by "id"
		viewData.item = await itemData.getItemById(req.params.id)
	} catch (err) {
		viewData.message = 'no results'
	}

	try {
		// Obtain the full list of "categories"
		let categories = await itemData.getCategories()

		// store the "categories" data in the viewData object (to be passed to the view)
		viewData.categories = categories
	} catch (err) {
		viewData.categoriesMessage = 'no results'
	}

	// render the "shop" view with all of the data (viewData)
	res.render('shop', { data: viewData })
})

///////////////////////////////////////
// ITEMS ROUTES
///////////////////////////////////////

app.get('/items', ensureLogin, (req, res) => {
	if (req.query.category) {
		itemData
			.getItemsByCategory(req.query.category)
			.then((data) =>
				data.length > 0
					? res.render('items', { items: data })
					: res.render('items', { message: 'no results' })
			)
			.catch((err) => res.render('items', { message: 'no results' }))
	} else if (req.query.minDate) {
		itemData
			.getItemsByMinDate(req.query.minDate)
			.then((data) =>
				data.length > 0
					? res.render('items', { items: data })
					: res.render('items', { message: 'no results' })
			)
			.catch((err) => res.render('items', { message: 'no results' }))
	} else {
		itemData
			.getAllItems()
			.then((data) =>
				data.length > 0
					? res.render('items', { items: data })
					: res.render('items', { message: 'no results' })
			)
			.catch((err) => res.render('items', { message: 'no results' }))
	}
})

app.get('/items/add', ensureLogin, (req, res) => {
	itemData
		.getCategories()
		.then((data) => res.render('addItem', { categories: data }))
		.catch(() => res.render('addItem', { categories: [] }))
})

app.get('/item/:id', ensureLogin, (req, res) => {
	itemData
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
		itemData.addItem(req.body)
	}

	res.redirect('/items')
})

app.get('/items/delete/:id', ensureLogin, (req, res) => {
	itemData
		.deleteItemById(req.params.id)
		.then(() => res.redirect('/items'))
		.catch(() => res.status(500).send('Unable to Remove Item / Item not found'))
})

///////////////////////////////////////
// CATEGORIES ROUTES
///////////////////////////////////////

app.get('/categories', ensureLogin, (req, res) => {
	itemData
		.getCategories()
		.then((data) =>
			data.length > 0
				? res.render('categories', { categories: data })
				: res.render('categories', { message: 'no results' })
		)
		.catch((err) => res.render('categories', { message: 'no results' }))
})

app.get('/categories/add', ensureLogin, (req, res) => {
	res.render('addCategory')
})

app.post('/categories/add', ensureLogin, (req, res) => {
	itemData.addCategory(req.body).then(() => res.redirect('/categories'))
})

app.get('/categories/delete/:id', ensureLogin, (req, res) => {
	console.log(req.params.id)

	itemData
		.deleteCategoryById(req.params.id)
		.then(() => res.redirect('/categories'))
		.catch(() =>
			res.status(500).send('Unable to Remove Category / Category not found')
		)
})

///////////////////////////////////////
// USER LOGIN/REGISTER ROUTES
///////////////////////////////////////

app.get('/login', (req, res) => {
	res.render('login')
})

app.get('/register', (req, res) => {
	res.render('register')
})

app.post('/register', (req, res) => {
	authData
		.registerUser(req.body)
		.then(() => res.render('register', { successMessage: 'User created' }))
		.catch((err) =>
			res.render('register', { errorMessage: err, userName: req.body.userName })
		)
})

app.post('/login', (req, res) => {
	req.body.userAgent = req.get('User-Agent')

	authData
		.checkUser(req.body)
		.then((user) => {
			req.session.user = {
				userName: user.userName,
				email: user.email,
				loginHistory: user.loginHistory,
			}

			res.redirect('/items')
		})
		.catch((err) => res.render('login', { errorMessage: err }))
})

///////////////////////////////////////
// 404 ROUTE
///////////////////////////////////////

app.use((req, res, next) => {
	res.status(404).render('404')
})

module.exports = app
