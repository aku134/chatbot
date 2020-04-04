(async function() {
    const http = require('http')
    const ss = require('string-similarity')
    const fs = require('fs-extra')
    const express = require('express')
    const app = express()
    let json = require('ngrok')
    const bodyParser = require('body-parser')
    const cookieParser = require('cookie-parser')
    const crypto = require('crypto')
    const tiny = require('tiny-json-http')
    let port
    let flag
    let i
    let temp
    let url
    let clear = false
    app.use(cookieParser())
    app.set('view engine', 'ejs')
    app.use(bodyParser.urlencoded({
        extended: true
    }))
    try {
        JSON.parse(fs.readFileSync('node_modules/db2/botMsg'))
        JSON.parse(fs.readFileSync('node_modules/db2/usrMsg'))
        JSON.parse(fs.readFileSync('node_modules/db2/authentication'))
    } catch (err) {
        fs.mkdirsSync('node_modules/db2')
        fs.writeFileSync('node_modules/db2/botMsg', '{"":[]}')
        fs.writeFileSync('node_modules/db2/usrMsg', '{"":[]}')
        fs.writeFileSync('node_modules/db2/authentication', '{"":""}')
    }
    if (process.env.PORT) {
        port = parseInt(process.env.PORT)
    } else {
        port = 3701
    }
    app.all('/', async (req, res) => {
        if (clear) {
            res.clearCookie("username")
            res.clearCookie("password")
            res.render("sessiontimeout")
        } else {
            flag = false
            if (req.cookies.username && req.cookies.password) {
                if (crypto.createHash("sha256").update(req.cookies.password).digest("base64") == JSON.parse(fs.readFileSync('node_modules/db2/authentication'))[req.cookies.username]) {
                    flag = true
                }
            }
            if (!flag) {
                if (req.body.signup == "signup") {
                    if (req.body.username && req.body.password) {
                        if (JSON.parse(fs.readFileSync('node_modules/db2/authentication'))[req.body.username]) {
                            res.render("signup", {
                                warn: true
                            })
                        } else {
                            flag = JSON.parse(fs.readFileSync('node_modules/db2/authentication'))
                            flag[req.body.username] = crypto.createHash("sha256").update(crypto.createHash("sha256").update(req.body.password).digest("base64")).digest("base64")
                            fs.writeFileSync('node_modules/db2/authentication', JSON.stringify(flag))
                            res.cookie("password", crypto.createHash("sha256").update(req.body.password).digest("base64"))
                            res.cookie("username", req.body.username)
                            flag = JSON.parse(fs.readFileSync('node_modules/db2/usrMsg'))
                            flag[req.body.username] = []
                            fs.writeFileSync('node_modules/db2/usrMsg', JSON.stringify(flag))
                            flag = JSON.parse(fs.readFileSync('node_modules/db2/botMsg'))
                            flag[req.body.username] = []
                            fs.writeFileSync('node_modules/db2/botMsg', JSON.stringify(flag))
                            res.render("main", {
                                botMsg: JSON.parse(fs.readFileSync('node_modules/db2/botMsg'))[req.body.username],
                                usrMsg: JSON.parse(fs.readFileSync('node_modules/db2/usrMsg'))[req.body.username]
                            })
                        }
                    } else {
                        res.render("signup", {
                            warn: false
                        })
                    }
                } else if (req.body.login == "login") {
                    if (req.body.username && req.body.password) {
                        if (JSON.parse(fs.readFileSync('node_modules/db2/authentication'))[req.body.username] == crypto.createHash("sha256").update(crypto.createHash("sha256").update(req.body.password).digest("base64")).digest("base64")) {
                            res.cookie("password", crypto.createHash("sha256").update(req.body.password).digest("base64"))
                            res.cookie("username", req.body.username)
                            res.render("main", {
                                botMsg: JSON.parse(fs.readFileSync('node_modules/db2/botMsg'))[req.body.username],
                                usrMsg: JSON.parse(fs.readFileSync('node_modules/db2/usrMsg'))[req.body.username]
                            })
                        } else {
                            res.render("login", {
                                warn: true
                            })
                        }
                    } else {
                        res.render("login", {
                            warn: false
                        })
                    }
                } else {
                    res.render("choice")
                }
            } else {
                if (req.body.msg) {
                    flag = JSON.parse(fs.readFileSync('node_modules/db2/usrMsg'))
                    flag[req.cookies.username].push(req.body.msg)
                    fs.writeFileSync('node_modules/db2/usrMsg', JSON.stringify(flag))
                    flag = [await (async function(url, username) {
                        if (url == "/joke") {
                            url = ["https://sv443.net/jokeapi/v2/joke/Any", "https://official-joke-api.appspot.com/jokes/random", "https://official-joke-api.appspot.com/random_joke", "https://api.icndb.com/jokes/random?escape=javascript", "https://sv443.net/jokeapi/v2/joke/Dark", "https://sv443.net/jokeapi/v2/joke/Miscellaneous", "https://sv443.net/jokeapi/v2/joke/Programming", "https://api.chucknorris.io/jokes/random"]
                            url = url[Math.floor(Math.random() * url.length)]
                            url = await tiny.get({
                                url
                            })
                            url = url.body
                            if (url.type) {
                                if (url.type == "success" || url.type == "single") {
                                    if (url.joke) {
                                        url = url.joke
                                    } else {
                                        url = url.value.joke
                                        url = url.replace("\\'", "'")
                                        url = url.replace('\\"', '"')
                                    }
                                } else {
                                    if (url.delivery) {
                                        url = url.setup + "\n\n" + url.delivery
                                    } else {
                                        url = url.setup + "\n\n" + url.punchline
                                    }
                                }
                            } else {
                                url = url.value
                            }
                            return [url, 0]
                        } else if (url == "/meme") {
                            url = "https://meme-api.herokuapp.com/gimme"
                            url = await tiny.get({
                                url
                            })
                            url = url.body.url
                            return [url, 0]
                        } else if (url == "/start") {
                            url = "This is the list of currently available commands:\n\n"
                            url += "1. /start - Lists all the available commands!\n"
                            url += "2. /joke - Sends you a joke!\n"
                            url += "3. /meme - Sends you a meme!\n\n"
                            url += "Cheers!"
                            return [url, 0]
                        } else {
                            temp = ""
                            url = url.toLowerCase()
                            for (i = 0; i < url.length; ++i) {
                                if ("qwertyuiopasdfghjklzxcvbnm ".includes(url[i])) {
                                    temp += url[i]
                                }
                            }
                            temp = temp.split()
                            temp = (function(temp) {
                                url = {}
                                temp.forEach(function(i) {
                                    if (!url[i]) {
                                        url[i] = true
                                    }
                                })
                                return Object.keys(url);
                            })(temp).join(" ")
                            url = Object.keys(json)
                            url = ss.findBestMatch(temp, url)
                            if (url.bestMatch.rating > 0.8 || url.bestMatch.rating == 0.8) {
                                url = json[url.bestMatch.target]
                                url = url[Math.floor(Math.random() * url.length)]
                            } else {
                                url = "Hello there! Don't know where to start? Try using the /start command!"
                            }
                            return [url, 0]
                        }
                    })(req.body.msg, req.cookies.username)]
                    setTimeout(function() {
                        flag.push(JSON.parse(fs.readFileSync('node_modules/db2/botMsg')))
                        flag[1][req.cookies.username].push(flag[0][0])
                        fs.writeFileSync('node_modules/db2/botMsg', JSON.stringify(flag[1]))
                        res.render("main", {
                            botMsg: JSON.parse(fs.readFileSync('node_modules/db2/botMsg'))[req.cookies.username],
                            usrMsg: JSON.parse(fs.readFileSync('node_modules/db2/usrMsg'))[req.cookies.username]
                        })
                    }, flag[0][1])
                } else {
                    res.render("main", {
                        botMsg: JSON.parse(fs.readFileSync('node_modules/db2/botMsg'))[req.cookies.username],
                        usrMsg: JSON.parse(fs.readFileSync('node_modules/db2/usrMsg'))[req.cookies.username]
                    })
                }
            }
        }
    })
    app.all('/deleteaccount', async (req, res) => {
        if (clear) {
            res.clearCookie("username")
            res.clearCookie("password")
            res.render("sessiontimeout")
        } else {


            flag = false
            if (req.cookies.username && req.cookies.password) {
                if (crypto.createHash("sha256").update(req.cookies.password).digest("base64") == JSON.parse(fs.readFileSync('node_modules/db2/authentication'))[req.cookies.username]) {
                    flag = true
                }
            }
            if (flag && req.body.deleteaccount == "delete account") {
                res.render('confirm', {
                    warn: false
                })
            } else if (flag && req.body.confirm == "confirm") {
                if (JSON.parse(fs.readFileSync('node_modules/db2/authentication'))[req.cookies.username] == crypto.createHash("sha256").update(crypto.createHash("sha256").update(req.body.password).digest("base64")).digest("base64")) {
                    flag = JSON.parse(fs.readFileSync('node_modules/db2/authentication'))
                    delete flag[req.cookies.username]
                    fs.writeFileSync('node_modules/db2/authentication', JSON.stringify(flag))
                    flag = JSON.parse(fs.readFileSync('node_modules/db2/usrMsg'))
                    delete flag[req.cookies.username]
                    fs.writeFileSync('node_modules/db2/usrMsg', JSON.stringify(flag))
                    flag = JSON.parse(fs.readFileSync('node_modules/db2/botMsg'))
                    delete flag[req.cookies.username]
                    fs.writeFileSync('node_modules/db2/botMsg', JSON.stringify(flag))
                    res.render("sorry")
                } else {
                    res.render('confirm', {
                        warn: true
                    })
                }
            } else {
                res.render('lost')
            }
        }
    })
    app.all('/clearchat', async (req, res) => {
        if (clear) {
            res.clearCookie("username")
            res.clearCookie("password")
            res.render("sessiontimeout")
        } else {
            flag = false
            if (req.cookies.username && req.cookies.password) {
                if (crypto.createHash("sha256").update(req.cookies.password).digest("base64") == JSON.parse(fs.readFileSync('node_modules/db2/authentication'))[req.cookies.username]) {
                    flag = true
                }
            }
            if (flag && req.body.clearchat == "clear chat") {
                flag = JSON.parse(fs.readFileSync('node_modules/db2/usrMsg'))
                flag[req.cookies.username] = []
                fs.writeFileSync('node_modules/db2/usrMsg', JSON.stringify(flag))
                flag = JSON.parse(fs.readFileSync('node_modules/db2/botMsg'))
                flag[req.cookies.username] = []
                fs.writeFileSync('node_modules/db2/botMsg', JSON.stringify(flag))
                res.redirect("/")
            } else {
                res.render('lost')
            }
        }
    })
    app.all('*', async (req, res) => {
        if (clear) {
            res.clearCookie("username")
            res.clearCookie("password")
            res.render("sessiontimeout")
        } else {
            flag = false
            if (req.cookies.username && req.cookies.password) {
                if (crypto.createHash("sha256").update(req.cookies.password).digest("base64") == JSON.parse(fs.readFileSync('node_modules/db2/authentication'))[req.cookies.username]) {
                    flag = true
                }
            }
            if (flag && req.body.signout == "sign out") {
                flag = req.cookies.password
                res.clearCookie("password")
                res.cookie("password", flag.split("").reverse().join(""))
                res.redirect("/")
            } else {
                res.render('lost')
            }
        }
    })
    app.all('*', async (req, res) => {
        if (clear) {
            res.clearCookie("username")
            res.clearCookie("password")
            res.render("sessiontimeout")
        } else {
            res.render('lost')
        }
    })
    http.createServer(app).listen(port)
    await json.connect(port).then((url) => {
        try {
            fs.readFileSync('node_modules/db2/README.md')
        } catch (err) {
            fs.writeFileSync('node_modules/db2/README.md', url + '/' + '\n\nhttp://localhost:' + port + '/')
        }
    })
    url = "https://gitlab.com/alias-rahil/db3/-/raw/master/res.json"
    json = await tiny.get({
        url
    })
    setInterval(
        () => {
            clear = true
            setTimeout(() => {
                clear = false
            }, 10000)
        },
        1000000
    )
})()
