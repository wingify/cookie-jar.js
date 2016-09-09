# CookieJar
A fast and compact micro-cookie manager written in JavaScript. Just 1KB minified and gzipped.

## Why CookieJar?

Certain browsers have a limitation on how many cookies can be created and also on the total size of all the cookies. To bypass that,
`CookieJar` creates a jar of cookies in a single browser cookie. It uses a custom storage and retreival mechanism that is very fast
and uses very less space.

## Usage

```javascript
var jar = new CookieJar('myjar')
jar.set('hello', 'world')
jar.set('yellow', 'card')
jar.get('hello') // world

jar.unset('hello')
jar.get('hello') // undefined
```

## API

**Constructor** `jar = new CookieJar( jarName )`

Creates a new CookieJar with the given name. A browser cookie is created with that particular name that never expires.

**Set a cookie** `jar.set( key, value, [ expiryInDays ] )`

Sets a cookie in the jar with the given `key` and `value` passed as strings. Optionally you may also include an expiry (in days) 
after which the cookie will expire. For storage and performance reasons, the parameters have the following limitations:
- `key`: A string between 1 and 15 characters
- `value`: A string between 1 and 255 characters
- `expiry`: A number between 1 and 2047 (if > 1), or between 0.01 and 0.99 (if < 1)

**Get a cookie** `jar.get( key )`

Gets a cookie from the jar with the given `key`. If it does not exist, returns `undefined`. If you try to read a cookie that has expired,
but still exists in the jar, it will be removed and `undefined` would be returned.

**Get all cookies** `jar.getAll()`

Gets all non-expired cookies in the jar as an object where each key is the cookie key and value is an array, where the first item is the value of the cookie, and the second item is expiry timestamp of that cookie.

**Unset a cookie** `jar.unset( key )`

Unsets a cookie with the given `key` by removing it from the jar.

**Unset all cookies** `jar.clear()`

Unsets all the cookies in the jar.

## Contributing

See [CONTRIBUTING.md](https://github.com/wingify/q-directives/blob/master/CONTRIBUTING.md)

## License

See [LICENSE.md](https://github.com/wingify/q-directives/blob/master/LICENSE.md)
