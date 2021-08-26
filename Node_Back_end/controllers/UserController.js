var users = require('../models/users');
var passwordHash = require('password-hash');
const excelToJson = require("convert-excel-to-json");
var items = require('../models/items');
var service = require('../models/service');
var system_info = require('../models/system_info');
const {Op} = require("sequelize");
const nodemailer = require("nodemailer");

class UserController {
    isLog = async (req, res) => {
        // console.log("user =============>", req.session.user)
        if (!req.session.user) {
            return res.send(req.session.user ? req.session.user : {})
        }
        //console.log("user =============> ", req.session.user)
        const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));
        let myItems = [];
        if (req.query.filter) {

            if (req.query.filter === "All") {
                myItems = await items.findAll({
                    where: {
                        createdAt: {
                            [Op.gte]: sevenDaysAgo,
                            [Op.lte]: new Date(),
                        },

                    }
                })
            } else {
                myItems = await items.findAll({
                    where: {
                        buyer_name: req.query.filter,
                        createdAt: {
                            [Op.gte]: sevenDaysAgo,
                            [Op.lte]: new Date(),
                        },

                    }
                })
            }
            if (req.session.user) {
                req.session.user.items = myItems;

            }

        } else {
            myItems = req.session.user.role !== "admin" ? await items.findAll({
                where: {
                    buyer_name: req.session.user.f_name + " " + req.session.user.l_name,
                    createdAt: {
                        [Op.gte]: sevenDaysAgo,
                        [Op.lte]: new Date(),
                    }
                }
            }) : await items.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: sevenDaysAgo,
                        [Op.lte]: new Date(),
                    }
                }
            });
            if (req.session.user) {
                req.session.user.items = myItems;

            }
        }

        res.send(req.session.user ? req.session.user : {})
    }
    update = async (req, res) => {
        if (req.session.user.role === "admin") {

            let _users = [];
            await users.update({
                role: req.body.p,
            }, {
                where: {
                    id: req.body.id
                }
            })

            _users = await users.findAll();


            return res.send({
                success: true,
                users: _users,
            })
        }
        return res.send({
            success: false,
        })

    }
    LogOut = (req, res) => {
        req.session.user = null;
        res.send({
            success: true
        })
    }
    CheckForgetKey = async (req, res) => {

        var key = req.session.forgetKey,
            email = req.session.forgetEmail,
            sentKey = req.body.key,
            password = req.body.password;
        console.log("==============>", key, password, email, sentKey, sentKey === `${key}`)
        if (key && password && email && sentKey && sentKey === `${key}`) {
            await users.update({
                password: passwordHash.generate(password),
            }, {
                where: {
                    email: email
                }
            });
            return res.send({
                success: true,
            })
        }

        return res.send({
            success: false,
        })

    }
    sendForgetMail = async (req, res) => {
        if (!req.query.to) {
            return res.send({
                success: false,
            })
        }
        let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });
        let key = Math.floor(Math.random() * 6000);
        req.session.forgetKey = key;
        req.session.forgetEmail = req.query.to;
        let info = await transporter.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: req.query.to, // list of receivers
            subject: "forget Password", // Subject line
            text: "Your forget Code is " + key, // plain text body
            html: `<b>Your forget Code is <strong>${key}</strong> </b>`, // html body
        });

        return res.send({
            success: true,
            link: nodemailer.getTestMessageUrl(info),
        })

    }
    Log = async (req, res) => {
        var email = req.body.email;
        var password = req.body.password;

        //console.log("log ============>", req.session.user !== null)


        var user = await users.findOne({
            where: {
                email: email,
            }
        })
        if (!user) {
            res.send({
                "success": false
            })
        }
        const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));


        if (passwordHash.verify(password, user.password)) {
            let myItems = user.role !== "admin" ? await items.findAll({
                where: {
                    buyer_name: user.f_name + " " + user.l_name,
                    createdAt: {
                        [Op.gte]: sevenDaysAgo,
                        [Op.lte]: new Date(),
                    }
                }
            }) : await items.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: sevenDaysAgo,
                        [Op.lte]: new Date(),
                    }
                }
            });
            let _users = [];
            if (user.role === "admin") {
                _users = await users.findAll();
            }
            req.session.user = {
                ...user.toJSON(),
                items: myItems,
                users: _users,
            }
            //console.log('user =========>', req.session.user)

            res.send({
                "success": true,
                "user": req.session.user
            })
        } else {
            res.send({
                "success": false
            })
        }

    }
    register = async (req, res) => {

        var user = users.create({
            'f_name': req.body.fname,
            'l_name': req.body.lname,
            'email': req.body.email,
            'password': passwordHash.generate(req.body.password),
            'role': 'user',
        });
        res.send(
            {
                ...user,
                success: true,
            }
        );
    }
    role = async (req, res) => {
        const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));
        let myItems = [];

        // console.log("user =============>", req.session.user)
        if (!req.session.user) {
            return res.send(req.session.user ? req.session.user : {})
        }

        if (req.query.filter) {
            if (req.query.filter === "All") {
                myItems = await items.findAll({
                    where: {
                        createdAt: {
                            [Op.gte]: sevenDaysAgo,
                            [Op.lte]: new Date(),
                        },

                    }
                })
            } else {
                myItems = await items.findAll({
                    where: {
                        buyer_name: req.query.filter,
                        createdAt: {
                            [Op.gte]: sevenDaysAgo,
                            [Op.lte]: new Date(),
                        },

                    }
                })
            }

            req.session.user.items = myItems;
            return res.send({
                ...req.session.user,
                role: req.session.user.role,
                items: myItems,
            });
        } else {
            console.log('here =>')
            myItems = req.session.user.role !== "admin" ? await items.findAll({
                where: {
                    buyer_name: req.session.user.f_name + " " + req.session.user.l_name,
                    createdAt: {
                        [Op.gte]: sevenDaysAgo,
                        [Op.lte]: new Date(),
                    }
                }
            }) : await items.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: sevenDaysAgo,
                        [Op.lte]: new Date(),
                    }
                }
            });
            if (req.session.user) {
                req.session.user.items = myItems;

            }
        }
        return res.send({
            ...req.session.user,
            role: req.session.user.role
        });
    }
    uploadFile = (file, callback, res) => {
        let sampleFile;
        let uploadPath;
        //console.log('file ==============>', file)

        if (!file || Object.keys(file).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
        sampleFile = 'id' + Math.random() * 60000 + file.name;
        uploadPath = __dirname + '/../files/' + sampleFile;

        //console.log('dir ============> ', uploadPath);

        // Use the mv() method to place the file somewhere on your server
        file.mv(uploadPath, function (err) {
            if (err)
                return res.status(500).send(err);
            callback(uploadPath);
        });


    }
    getService = async (req, res) => {
        const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));

        let services = await service.findAll({
            where: {
                createdAt: {
                    [Op.gte]: sevenDaysAgo,
                    [Op.lte]: new Date(),
                }
            }
        });
        let WTD = await system_info.findOne({
            where: {
                name: 'WTD'
            }
        })
        let TARGET = await system_info.findOne({
            where: {
                name: 'TARGET'
            }
        })

        return res.send({
            WTD: WTD,
            TARGET: TARGET,
            services: services
        })

    }
    saveAsExcel = async (req, res) => {
        if (req.session.user && (req.session.user.role === "superuser" || req.session.user.role === "admin")) {
            this.uploadFile(req.files.myFile, async (file_path) => {
                    const result = excelToJson({
                        sourceFile: file_path,
                        // Is the number of rows that will be skipped and will not be present at our result object. Counting from top to bottom
                        sheets: [{
                            name: 'MainPage',
                            columnToKey: {
                                "A": 'loc',
                                "B": 'vendor',
                                "C": 'sub_vendor',
                                "D": 'vendor_name',
                                "E": 'item_number',
                                "F": "item_description",
                                "G": "item_pack",
                                "H": "last_sale_date",
                                "I": "item_status",
                                "J": "quantity_ordered",
                                "K": 'quantity_not_supplied',
                                "L": "dollars_lost",
                                "M": "current_item_status",
                                "N": "buyer",
                                "R": "buyer_name"

                            }
                        }, {
                            name: 'Buyer',
                            columnToKey: {
                                "D": 'Buyer',
                                "U": 'TARGET',
                                "AR": 'WTD',
                                "AN": 'service_level'

                            }
                        }],

                    });

                    if (result.Buyer.length > 0) {
                        let names = []
                        let _services = [];
                        for (let i in result.Buyer) {
                            console.log('result.Buyer ', result.Buyer[i], result.Buyer[i].service_level && result.Buyer[i].Buyer && result.Buyer[i].Buyer.trim() !== "")

                            if (result.Buyer[i].Buyer === "Total") {
                                // add total of target and wtd
                                let WTD = await system_info.findOne({
                                    where: {
                                        name: 'WTD'
                                    }
                                })
                                if (WTD) {
                                    system_info.update({
                                        name: 'WTD',
                                        value: result.Buyer[i].WTD
                                    })
                                } else {
                                    system_info.create({
                                        name: 'WTD',
                                        value: result.Buyer[i].WTD
                                    })
                                }
                                let TARGET = await system_info.findOne({
                                    where: {
                                        name: 'TARGET'
                                    }
                                })
                                if (TARGET) {
                                    system_info.update({
                                        name: 'TARGET',
                                        value: result.Buyer[i].TARGET
                                    })
                                } else {
                                    system_info.create({
                                        name: 'TARGET',
                                        value: result.Buyer[i].TARGET
                                    })
                                }
                                if (result.Buyer[i].service_level && result.Buyer[i].Buyer && result.Buyer[i].Buyer.trim() !== "") {
                                    // service.create(result.Buyer[i])

                                    if (names.includes(result.Buyer[i].Buyer)) {

                                        for (let c in _services) {
                                            if (_services[c].Buyer === result.Buyer[i].Buyer) {
                                                console.log('math system: ', c, " : ", (`${result.Buyer[i].service_level} + ${_services[c].service_level}) / 2`))
                                                _services[c].service_level = (+result.Buyer[i].service_level + +_services[c].service_level) / 2 // mix the two
                                            }
                                        }

                                    } else {

                                        _services.push(result.Buyer[i]);
                                        names.push(result.Buyer[i].Buyer)
                                    }

                                }


                            } else {


                                if (result.Buyer[i].service_level && result.Buyer[i].Buyer && result.Buyer[i].Buyer.trim() !== "") {
                                    // service.create(result.Buyer[i])

                                    if (names.includes(result.Buyer[i].Buyer)) {

                                        for (let c in _services) {
                                            if (_services[c].Buyer === result.Buyer[i].Buyer) {
                                                console.log('math system: ', c, " : ", (`${result.Buyer[i].service_level} + ${_services[c].service_level}) / 2`))
                                                _services[c].service_level = (+result.Buyer[i].service_level + +_services[c].service_level) / 2 // mix the two
                                            }
                                        }

                                    } else {

                                        _services.push(result.Buyer[i]);
                                        names.push(result.Buyer[i].Buyer)
                                    }

                                }
                                // add the items
                                // if (result.Buyer[i].service_level && result.Buyer[i].Buyer && result.Buyer[i].Buyer.trim() !== "") {
                                //     if (names.includes(result.Buyer[i].Buyer)) continue;
                                //     service.create(result.Buyer[i])
                                //     names.push(result.Buyer[i].Buyer)
                                //
                                // }

                            }


                        }

                        for (let c in _services) {
                            service.create(_services[c])
                        }
                        console.log('new tags', result)
                        res.send(result);
                    } else {
                        if (result.MainPage) {
                            for (var i in result.MainPage) {
                                for (var ii in result.MainPage[i]) {
                                    if (typeof result.MainPage[i][ii] !== "string") {
                                        result.MainPage[i][ii] = `${result.MainPage[i][ii]}`;
                                    }
                                }
                                items.create(result.MainPage[i])
                            }

                        }
                        res.send(result);

                    }


                }
                ,
                res
            );


        }

    }
}

var
    User = new UserController


module
    .exports = User;
