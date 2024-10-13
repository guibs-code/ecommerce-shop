const fs = require('fs')

let items = []
let categories = []

function initialize() {
	return new Promise(async (res, rej) => {
		fs.readFile('./data/items.json', 'utf8', async (err, data) => {
			if (err) {
				return rej('unable to read items file')
			}

			try {
				items = await JSON.parse(data)

				fs.readFile('./data/categories.json', 'utf8', async (err, data) => {
					if (err) {
						return rej('unable to read categories file')
					}

					try {
						categories = await JSON.parse(data)
						res('data fetched')
					} catch (err) {
						return rej('unable to parse categories.json')
					}
				})
			} catch (err) {
				return rej('unable to parse items file')
			}
		})
	})
}

function getAllItems() {
	return new Promise((res, rej) => {
		if (items.length > 0) {
			res(items)
		} else {
			rej('no results returned')
		}
	})
}

function getPublishedItems() {
	return new Promise((res, rej) => {
		const publishedItems = items.filter((item) => item.published === true)

		if (publishedItems.length > 0) {
			res(publishedItems)
		} else {
			rej('no results returned')
		}
	})
}

function getCategories() {
	return new Promise((res, rej) => {
		if (categories.length > 0) {
			res(categories)
		} else {
			rej('no results returned')
		}
	})
}

module.exports = {
	items,
	categories,
	initialize,
	getAllItems,
	getPublishedItems,
	getCategories,
}
