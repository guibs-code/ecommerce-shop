/*********************************************************************************
WEB322 – Assignment 05
I declare that this assignment is my own work in accordance with Seneca Academic Policy.
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Guilherme da Silva
Student ID: 122538234
Date: November 23, 2024
Vercel Web App URL: https://web322-8c6691wat-guibs-codes-projects.vercel.app/about (data not working)
GitHub Repository URL: https://github.com/guibs-code/web322-app

********************************************************************************/
require('dotenv').config()
const Sequelize = require('sequelize')
import 'pg'

// Setting up Sequelize / Database
const sequelize = new Sequelize(
	process.env.DB_DATABASE,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: 'postgres',
		port: process.env.DB_PORT,
		dialectOptions: {
			ssl: { rejectUnauthorized: false },
		},
		query: { raw: true },
	}
)

const Item = sequelize.define('items', {
	body: Sequelize.TEXT,
	title: Sequelize.STRING,
	itemDate: Sequelize.DATE,
	featureImage: Sequelize.STRING,
	published: Sequelize.BOOLEAN,
	price: Sequelize.DOUBLE,
})

const Category = sequelize.define('categories', {
	category: Sequelize.STRING,
})

Item.belongsTo(Category, { foreignKey: 'category', as: 'Category' })

// Setting up handlebars helpers
module.exports.hbsHelpers = {
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

module.exports.initialize = function () {
	return new Promise((res, rej) => {
		sequelize
			.sync()
			.then(() => res('connection established with database'))
			.catch(() => rej('unable to sync to the database'))
	})
}

module.exports.getAllItems = function () {
	return new Promise((res, rej) => {
		Item.findAll()
			.then((data) => res(data))
			.catch(() => rej('no results returned'))
	})
}

module.exports.getPublishedItems = function () {
	return new Promise((res, rej) => {
		Item.findAll({ where: { published: true } })
			.then((data) => res(data))
			.catch(() => rej('no results returned'))
	})
}

module.exports.getCategories = function () {
	return new Promise((res, rej) => {
		Category.findAll()
			.then((data) => res(data))
			.catch(() => rej('no results returned'))
	})
}

module.exports.addItem = function (itemData) {
	return new Promise((res, rej) => {
		// treat published flag
		itemData.published = itemData.published ? true : false

		// remove empty strings
		for (const item in itemData) {
			if (item === '') itemData[item] = null
		}

		// set the current date
		itemData.itemDate = new Date()

		// add item to the database
		Item.create(itemData)
			.then(() => res('item created'))
			.catch(() => rej('unable to create item'))
	})
}

module.exports.getItemsByCategory = function (category) {
	return new Promise((res, rej) => {
		Item.findAll({ where: { category } })
			.then((data) => res(data))
			.catch(() => rej('no results returned'))
	})
}

module.exports.getItemsByMinDate = function (minDateStr) {
	return new Promise((res, rej) => {
		const { gte } = Sequelize.Op

		Item.findAll({
			where: {
				itemDate: {
					[gte]: new Date(minDateStr),
				},
			},
		})
			.then((data) => res(data))
			.catch(() => rej('no results returned'))
	})
}

module.exports.getItemById = function (id) {
	return new Promise((res, rej) => {
		Item.findAll({ where: { id } })
			.then((data) => res(data[0]))
			.catch(() => rej('no results returned'))
	})
}

module.exports.getPublishedItemsByCategory = function (category) {
	return new Promise((res, rej) => {
		Item.findAll({
			where: {
				category,
				published: true,
			},
		})
			.then((data) => res(data))
			.catch(() => rej('no results returned'))
	})
}

module.exports.addCategory = function (categoryData) {
	return new Promise((res, rej) => {
		// remove empty categories
		for (const category in categoryData) {
			if (category === '') categoryData[category] = null
		}

		// add item to the database
		Category.create(categoryData)
			.then(() => res('category created'))
			.catch(() => rej('unable to create category'))
	})
}

module.exports.deleteCategoryById = function (id) {
	return new Promise((res, rej) => {
		Category.destroy({ where: { id } })
			.then(() => res('category deleted'))
			.catch(() => rej('category deletion was rejected'))
	})
}

module.exports.deleteItemById = function (id) {
	return new Promise((res, rej) => {
		Item.destroy({ where: { id } })
			.then(() => res('item deleted'))
			.catch(() => rej('item deletion was rejected'))
	})
}
