'use strict'

var encode = window.encodeURIComponent
var decode = window.decodeURIComponent
var reUppercase = /[A-Z]/
var errors = {
	COOKIE_TOO_LARGE: 'ctl',
	COOOKIE_LIMIT_REACHED: 'clr'
}

function error(s) {
	throw new Error(s)
}

/**
 * Gets a cookie (native)
 *
 * @param  {String} name The cookie key to get it by
 * @return {String}      Value of the cookie if it exists. Undefined otherwise.
 */
function getCookie(name) {
	var match = document.cookie.match(new RegExp('(?:^|;)\\s?' + name + '=(.*?)(?:;|$)', 'i'))
	return match && decode(match[1])
}

/**
 * Sets a cookie (native)
 *
 * @param {String} name     Cookie key
 * @param {String} value    Value of the cookie
 * @param {String} [domain] Optional domain to set the cookie for
 */
function setCookie(name, value, domain) {
	name = encode(name)
	value = encode(value)
	var c = name + '=' + value + '; '
	if (domain) c += 'domain=' + domain + '; '

	c += 'expires=Sun, 26 Jul 2116 11:47:19 GMT; path=/'

	document.cookie = c
}



/**
 * Converts a character to a number between 0 - 63.
 *
 * @param  {String} s A character between 0 - 9, a - z, A - Z, _ and -
 * @return {Number}   An integer between 0 - 63
 */
function charToNumber(s) {
	var n = reUppercase.test(s) * 26 + parseInt(s, 36)

	if (s === '_') n = 62
	if (s === '-') n = 63

	return n
}

/**
 * Converts a number between 0 - 63 into a character.
 *
 * @param  {Number} n An integer between 0 - 63
 * @return {String}   A character between 0 - 9, a - z, A - Z, _ and -
 */
function numberToChar(n) {
	var s = n.toString(36)

	if (n >= 36) s = String.fromCharCode(n + 29)
	if (n === 62) s = '_'
	if (n === 63) s = '-'

	return s
}

/**
 * Encodes a number into a set of base 64 characters.
 *
 * @param  {Number} n    The number to encode
 * @param  {Number} padl Number of digits the output should be
 *                       (0 padding will be added if it isn't).
 * @return {String}      A string representation of the number.
 */
function encodeNumber(n, padl) {
	var n2 = ''
	while (n) {
		n2 = numberToChar(n % 64) + n2
		n = Math.floor(n / 64)
	}
	n = n2 || (n + '')
	if (n.length < padl) n = '0' + n
	return n
}

/**
 * Decodes a number from base 64 to decimal.
 *
 * @param  {String} n A base 64 representation of the number.
 * @return {Number}   The integer in decoded form.
 */
function decodeNumber(n) {
	var n2 = 0, j = 0
	while (n) {
		n2 += charToNumber(n.slice(-1)) * Math.pow(64, j++)
		n = n.slice(0, -1)
	}
	return n2
}

/**
 * Encodes a cookie into a single string representing its key, value, expiry
 * and additional information.
 *
 * @param  {String} key     Cookie key
 * @param  {String} value   Cookie value
 * @param  {Number} expiry  Expiry of cookie in days (min - 0.01, max - 2047)
 * @return {String}         Cookie in encoded form
 */
function encodeCookie(key, value, expiry) {
	expiry = expiry || 0
	if (key.length >= 16 || value.length >= 256 || expiry >= 2048 || expiry < 0) error(errors.COOKIE_TOO_LARGE)
	var microcookie = key.length < 8 && value.length < 8
	var smallExpiry = expiry < 1
	expiry = Math.floor(expiry * (smallExpiry ? 100 : 1))
	return (microcookie ? '' : '!') +
		encodeNumber((key.length << 0) + (value.length << (microcookie ? 3 : 4)), !microcookie + 1) +
		encodeNumber((smallExpiry << 0) + (expiry << 1), 2) +
		key + value
}

/**
 * Decodes a cookie from encoded cookie string
 * @param  {String} cookie Cookie encoded string
 * @param  {Number} rel    A timestamp (in ms) to consider the relative expiry from.
 * @return {Array}         Returns an array containing 4 items
 *                         0 - cookie key
 *                         1 - cookie value
 *                         2 - cookie expiry timestamp (in ms)
 *                         3 - cookie length (in encoded form)
 */
function decodeCookie(cookie, rel) {
	var microcookie = cookie.charAt(0) !== '!'
	var t = decodeNumber(cookie.substr(+!microcookie, !microcookie + 1))
	var keyLength, valueLength, cookieLength = !microcookie * 2 + 1
	cookie = cookie.substr(!microcookie * 2 + 1)
	if (microcookie) {
		keyLength = t >> 0 & 7
		valueLength = t >> 3 & 7
	} else {
		keyLength = t >> 0 & 15
		valueLength = t >> 4 & 255
	}
	var expiry = decodeNumber(cookie.substr(0, 2))
	var smallExpiry = expiry >> 0 & 1
	expiry = (expiry >> 1 & 2047) / (smallExpiry ? 100 : 1)
	cookieLength += 2 + keyLength + valueLength
	return [
		cookie.substr(2, keyLength), // key
		cookie.substr(2 + keyLength, valueLength), // value
		expiry ? rel + expiry * 864e5 : 0, // expiry
		cookieLength // length
	]
}

/**
 * Checks whether a cookie is expired
 *
 * @param  {Array}   cookie Cookie array object containing its key, value,
 *                          expiry timestamp and encoded length.
 * @return {Boolean}        Boolean indicating whether its expired or not.
 */
function isCookieExpired(cookie) {
	return !cookie || cookie[2] && Date.now() > cookie[2]
}

// @private
function convertExpiry(expiry, rel) {
	return Math.floor(expiry + (Date.now() - rel) / 864e5)
}

var jars = {}

/**
 * Creates a cookie jar object.
 *
 * @param {String} jarName  Name of cookie jar cookie name.
 * @param {String} [domain] Optional domain name to set the jar cookie on.
 */
function CookieJar(jarName, domain) {
	function cookieForEach(cookies, fn) {
		var cookie
		var l = cookies.length, i = 0
		while (i < l) {
			cookie = decodeCookie(cookies, rel)
			if (fn(cookie, i)) { return }
			i += cookie[3] // length
			cookies = cookies.substr(cookie[3])
		}
	}

	// expires a cookie by removing it from the jar.
	function expireCookie(cookie, i) {
		cookieString = cookieString.substr(0, i) + cookieString.substr(i + cookie[3] /* length */)
		sync()
		return true
	}

	/// gets a cookie in the jar by a key
	function get(key) {
		var val
		cookieForEach(cookieString, function (cookie, i) {
			if (key !== cookie[0]) return
			if (isCookieExpired(cookie)) expireCookie(cookie, i)
			val = cookie[1]
			return true
		})
		return val
	}

	/// sets a cookie in the jar with an expiry
	function set(key, value, expiry) {
		var oldCookieString = cookieString, newCookieString
		unset(key)
		cookieString += encodeCookie(key, value, convertExpiry(expiry, rel))
		newCookieString = cookieString
		sync()
		if (cookieString !== newCookieString) {
			cookieString = oldCookieString
			sync()
			error(errors.COOOKIE_LIMIT_REACHED)
		}
		return value
	}

	/// unsets a cookie by name by removing it from the jar
	function unset(key) {
		cookieForEach(cookieString, function (cookie, i) {
			if (key === cookie[0]) expireCookie(cookie, i)
		})
	}

	/// syncs the jar cookies with document.cookie
	function sync() {
		setCookie(jarName, cookieString, domain)
		cookieString = getCookie(jarName)
	}

	/**
	 *  gets all the cookies in the jar
	 *
	 * @return {Object} A key-value pair where key is the cookie key
	 *                  and value is an array of two items where
	 *                  0 - cookie value
	 *                  1 - cookie expiry timestamp (in ms)
	 */
	function getAll() {
		var cookies = {}
		cookieForEach(cookieString, function (cookie, i) {
			if (isCookieExpired(cookie)) expireCookie(cookie, i)
			cookies[cookie[0]] = [cookie[1], cookie[2] && new Date(cookie[2])]
		})
		return cookies
	}

	if (jars[jarName]) return jars[jarName]

	var cookieString = getCookie(jarName) || ''
	var rel = get('_')
	if (!rel) rel = set('_', encodeNumber(Date.now()))

	rel = decodeNumber(rel)

	var obj = {
		get: get,
		set: set,
		unset: unset,
		getAll: getAll
	}

	jars[jarName] = obj

	return obj
}

if (typeof exports !== 'undefined') exports = CookieJar