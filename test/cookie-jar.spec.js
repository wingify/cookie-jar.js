var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-'

describe('method: charToNumber', function () {
	it('converts a character [0-9a-zA-Z_-] to a number between 0 - 63', function () {
		for (var i = 0; i < chars.length; i++) {
			expect(charToNumber(chars.charAt(i))).toBe(i)
		}
	})
})

describe('method: numberToChar', function () {
	it('converts a number between 0 - 63 to a character [0-9a-zA-Z_-]', function () {
		for (var i = 0; i < chars.length; i++) {
			expect(numberToChar(i)).toBe(chars.charAt(i))
		}
	})
})

describe('method: encodeNumber', function () {
	it('converts an integer to base 64', function () {
		expect(encodeNumber(188)).toBe('2Y')
		expect(encodeNumber(368)).toBe('5M')
		expect(encodeNumber(755)).toBe('bP')
		expect(encodeNumber(1023)).toBe('f-')
		expect(encodeNumber(2252)).toBe('zc')
		expect(encodeNumber(10003)).toBe('2sj')
		expect(encodeNumber(349555)).toBe('1llP')
		expect(encodeNumber(4663622)).toBe('hOB6')
		expect(encodeNumber(+new Date(2009, 3, 3))).toBe('i1E63N0')
	})
})

describe('method: decodeNumber', function () {
	it('converts a base 64 representation of a decimal number into decimal', function () {
		expect(decodeNumber('2Y')).toBe(188)
		expect(decodeNumber('5M')).toBe(368)
		expect(decodeNumber('bP')).toBe(755)
		expect(decodeNumber('f-')).toBe(1023)
		expect(decodeNumber('zc')).toBe(2252)
		expect(decodeNumber('2sj')).toBe(10003)
		expect(decodeNumber('1llP')).toBe(349555)
		expect(decodeNumber('hOB6')).toBe(4663622)
		expect(decodeNumber('i1E63N0')).toBe(+new Date(2009, 3, 3))
	})
})

describe('method: encodeCookie', function () {
	it('encodes a cookie key, value and expiry into a single string', function () {
		// small key, small value, no expiry
		expect(encodeCookie('a', 'b')).toBe('901ab')
		// small key, small value, < 1 expiry
		expect(encodeCookie('a', 'b', 0.34)).toBe('915ab')
		// small key, small value, has expiry
		expect(encodeCookie('a', 'b', 254)).toBe('97Yab')
		// small key, small value, large expiry
		expect(encodeCookie('a', 'b', 2040)).toBe('9-Mab')

		// big key, small value, no expiry
		expect(encodeCookie('8 chars or more', 'b')).toBe('!0v018 chars or moreb')
		// big key, small value, < 1 expiry
		expect(encodeCookie('8 chars or more', 'b', 0.33)).toBe('!0v138 chars or moreb')
		// big key, small value, has expiry
		expect(encodeCookie('8 chars or more', 'b', 256)).toBe('!0v808 chars or moreb')
		// big key, small value, large expiry
		expect(encodeCookie('8 chars or more', 'b', 2040)).toBe('!0v-M8 chars or moreb')

		// big key, big value, no expiry
		expect(encodeCookie('8 chars or more', 'A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.')).toBe('!rf018 chars or moreA quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.')
		// big key, big value, <1 expiry
		expect(encodeCookie('8 chars or more', 'A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.', 0.22)).toBe('!rf0J8 chars or moreA quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.')
		// big key, big value, has expiry
		expect(encodeCookie('8 chars or more', 'A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.', 446)).toBe('!rfdY8 chars or moreA quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.')
		// big key, big value, large expiry
		expect(encodeCookie('8 chars or more', 'A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.', 2030)).toBe('!rf-s8 chars or moreA quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.')
	})
	it('throws an error if cookie is too large', function () {
		// large key (> 15 chars)
		expect(function () {
			encodeCookie('khojt78t98hihojhg989889', 's')
		}).toThrow()

		// large value (> 255 chars)
		expect(function () {
			encodeCookie('kkey', 'A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz. A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz. A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.')
		}).toThrow()

		// not large expiry, no throw
		expect(function () {
			encodeCookie('key', 'value', 2047)
		}).not.toThrow()

		// large expiry throws
		expect(function () {
			encodeCookie('key', 'value', 2048)
		}).toThrow()
		expect(function () {
			encodeCookie('key', 'value', 20228)
		}).toThrow()
	})
})


describe('method: decodeCookie', function () {
	it('decodes a cookie in encoded form and gives back an array of results', function () {
		var rel = +new Date(2016, 5, 26)

		expect(decodeCookie('901ab', rel)).toEqual([ 'a', 'b', 0, 5 ])
		expect(decodeCookie('915ab', rel)).toEqual([ 'a', 'b', 1466908776000, 5 ])
		expect(decodeCookie('97Yab', rel)).toEqual([ 'a', 'b', 1488825000000, 5 ])
		expect(decodeCookie('9-Mab', rel)).toEqual([ 'a', 'b', 1643135400000, 5 ])
		expect(decodeCookie('!0v018 chars or moreb', rel)).toEqual([ '8 chars or more', 'b', 0, 21 ])
		expect(decodeCookie('!0v138 chars or moreb', rel)).toEqual([ '8 chars or more', 'b', 1466907912000, 21 ])
		expect(decodeCookie('!0v808 chars or moreb', rel)).toEqual([ '8 chars or more', 'b', 1488997800000, 21 ])
		expect(decodeCookie('!0v-M8 chars or moreb', rel)).toEqual([ '8 chars or more', 'b', 1643135400000, 21 ])
		expect(decodeCookie('!rf018 chars or moreA quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.', rel)).toEqual([ '8 chars or more', 'A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.', 0, 128 ])
		expect(decodeCookie('!rf0J8 chars or moreA quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.', rel)).toEqual([ '8 chars or more', 'A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.', 1466898408000, 128 ])
		expect(decodeCookie('!rfdY8 chars or moreA quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.', rel)).toEqual([ '8 chars or more', 'A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.', 1505413800000, 128 ])
		expect(decodeCookie('!rf-s8 chars or moreA quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.', rel)).toEqual([ '8 chars or more', 'A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.', 1642271400000, 128 ])
	})
})

describe('class: CookieJar', function () {
	beforeEach(function () {
		document.cookie = 'myjar=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
	});

	describe('constructor', function () {
		it('creates a new timestamp cookie on its own', function () {
			var jar = new CookieJar('myjar')
			expect(jar.get('_')).toBeDefined()
		})
	})

	describe('set/get', function () {
		it('sets a cookie in the jar', function () {
			var jar = new CookieJar('myjar')
			jar.set('hello', 'world')
			jar.set('yellow', 'card')
			jar.set('8 chars or more', 'A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.');
			jar.set('_vwo_cookie', '2', 0.45)
			jar.set('_vwo_cookie2', '22', 1999)

			expect(jar.get('hello')).toBe('world')
			expect(jar.get('yellow')).toBe('card')
			expect(jar.get('8 chars or more')).toBe('A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.')
			expect(jar.get('_vwo_cookie')).toBe('2')
			expect(jar.get('_vwo_cookie2')).toBe('22')

			// cookies also available in the other jar
			var jar2 = new CookieJar('myjar')
			expect(jar2.get('hello')).toBe('world')
			expect(jar2.get('yellow')).toBe('card')
			expect(jar2.get('8 chars or more')).toBe('A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.')
			expect(jar2.get('_vwo_cookie')).toBe('2')
			expect(jar2.get('_vwo_cookie2')).toBe('22')

			jar2.set('wow', 'awesome')

			expect(jar2.get('wow')).toBe('awesome')
			expect(jar.get('wow')).toBe('awesome')
		})
		it('throws an error if too many cookies are set', function () {
			expect(function () {
				var jar = new CookieJar('myjar')
				for (var i = 0; i < 400; i++) {
					jar.set('a' + i, 'b' + i)
				}
			}).toThrow()
		})
	})

	describe('unset', function () {
		it('unsets a cookie from the jar', function () {
			var jar = new CookieJar('myjar')
			jar.set('hello', 'world')
			jar.set('yellow', 'card')
			jar.set('8 chars or more', 'A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.');
			jar.set('_vwo_cookie', '2', 0.45)
			jar.set('_vwo_cookie2', '22', 1999)

			// non cache test
			var jar2 = new CookieJar('myjar')
			expect(jar2.get('hello')).toBe('world')
			expect(jar2.get('yellow')).toBe('card')
			expect(jar2.get('8 chars or more')).toBe('A quick brown fox jumps over the lazy dog and what not etc etc etc .. Jackdaws love my big sphinx of quartz.')
			expect(jar2.get('_vwo_cookie')).toBe('2')
			expect(jar2.get('_vwo_cookie2')).toBe('22')

			jar2.unset('hello')

			expect(jar.get('hello')).not.toBeDefined()
			expect(jar2.get('hello')).not.toBeDefined()

		})
	})
})
