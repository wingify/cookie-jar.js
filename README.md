# CookieJar
A fast and compact micro-cookie manager written in JavaScript. Just 1KB minified and gzipped.

[![npm version](https://badge.fury.io/js/cookie-jar.js.svg)](https://badge.fury.io/js/cookie-jar.js)
[![Build Status](https://travis-ci.org/wingify/cookie-jar.js.svg?branch=master)](https://travis-ci.org/wingify/cookie-jar.js)

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
- `key`: A string between 1 and 15 characters.
- `value`: A string between 1 and 255 characters.
- `expiry`: A number between 1 and 2047 (if > 1), or between 0.01 and 0.99 (if < 1).

If the parameters do not conform to the above limitations, an error is thrown.

**Get a cookie** `jar.get( key )`

Gets a cookie from the jar with the given `key`. If it does not exist, returns `undefined`. If you try to read a cookie that has expired,
but still exists in the jar, it will be removed and `undefined` would be returned.

**Get all cookies** `jar.getAll()`

Gets all non-expired cookies in the jar as an object where each key is the cookie key and value is an array, where the first item is the value of the cookie, and the second item is expiry timestamp of that cookie.

**Unset a cookie** `jar.unset( key )`

Unsets a cookie with the given `key` by removing it from the jar.

**Unset all cookies** `jar.clear()`

Unsets all the cookies in the jar.

## Behind The Scenes - Storage Mechanism

### Saving Space
The compiled cookie string is really compact and takes very little space.
- If cookie `key.length < 8` and `value.length < 8`, the library identifies it as a microcookie and takes 3 extra characters to store meta information. The first character stores the key and value length encoded as a base64 representation of the cookie's key and value's length (3 bits each = 8 characters each), and the next two characters indicate cookie's expiry in days.
- If cookie `key.length < 16` and `value.length < 256`, it is a macro cookie, and takes 5 extra characters for meta information. The first character identifies the cookie as a macro-cookie. The next two characters store the length of the cookie's key and value (4 and 8 bits respectively = 16 and 256 characters respectively) and the next two characters indicate cookie's expiry in days.
 
### Performant
Compared to JSON, this is quite a compact way of storing strings. While iterating through the cookie string, the length of the cookie is stored in the beginning of each cookie so the logic can *hop* through the string and get to the next cookie by adding the cookie's length each time. Searching or splitting the string is unnecessary, which makes the code really performant by avoiding serialization and deserialization altogether.

## Contributing

See [CONTRIBUTING.md](https://github.com/wingify/q-directives/blob/master/CONTRIBUTING.md)

## License

See [LICENSE.md](https://github.com/wingify/q-directives/blob/master/LICENSE.md)
