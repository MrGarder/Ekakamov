const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const cloudinary = require("cloudinary").v2;

const multer = require("multer");

const { CloudinaryStorage } =
require("multer-storage-cloudinary");

cloudinary.config({

    cloud_name: "dk7o3keez",

    api_key: "669527537632519",

    api_secret: "HPuD0MeI320ThXRwc-RUJhbXKlw"
});

const storage =
new CloudinaryStorage({

    cloudinary,

    params: {

        folder: "avatars",

        allowed_formats: [
            "jpg",
            "png",
            "jpeg",
            "webp"
        ]
    }
});

const upload = multer({
    storage
});

// ===== MIDDLEWARE =====

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));

app.use(express.static(__dirname));

// ===== MONGODB =====

mongoose.set('strictQuery', false);

mongoose.connect(
    "mongodb+srv://dmin:05060403@cluster0.rnxra9s.mongodb.net/ekakamov?retryWrites=true&w=majority&appName=Cluster0",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)



.then(() => {

    console.log("MONGO CONNECTED");

    app.listen(process.env.PORT || 3000, () => {

        console.log("SERVER STARTED");

    });

})

.catch(err => {

    console.log("MONGO ERROR:", err);

});

// ===== SCHEMA =====

const MemberSchema = new mongoose.Schema({

    name: String,

    password: String,

    // РАНГ ТЕПЕРЬ СТРОКА
    rank: String,

    warns: Number,

    online: Boolean,

    avatar: String,

    gallery: [String],

    department: String,

    position: String,

    xp: Number,

    level: Number

});

const Member = mongoose.model(
    "Member",
    MemberSchema
);
// ===== ПОЛУЧИТЬ ВСЕХ =====

app.get("/admin/get-members", async (req, res) => {

    try {

        const members = await Member.find();

        res.json(members);

    } catch(err) {

        console.log(err);

        res.status(500).send("SERVER ERROR");
    }
});

// ===== СОХРАНИТЬ =====

app.post("/admin/update-member", async (req, res) => {

    try {

       const {
    password,
    name,
    rank,
    warns,
    online,
    avatar,
    gallery,
    department,
    position,
    xp,
    level
} = req.body;

        if (password !== "05060403") {

            return res
            .status(403)
            .send("wrong password");
        }

        let existing = await Member.findOne({
            name
        });

        if (existing) {

            existing.rank = rank;
            existing.warns = warns;
            existing.online = online;
            existing.avatar = avatar;

            // ГАЛЕРЕЯ
            existing.gallery = gallery || [];
            existing.department = department;
            existing.position = position;
            existing.xp = xp;
            existing.level = level;

            await existing.save();

        } else {

            await Member.create({

                name,
                rank,
                warns,
                online,
                avatar,

                // ГАЛЕРЕЯ
                gallery: gallery || [],
               department,
               position,
              xp,
              level
            });
        }

        res.sendStatus(200);

    } catch(err) {

        console.log(err);

        res.status(500).send("SERVER ERROR");
    }
});

// ===== ВЫГОВОРЫ =====

app.post("/admin/update-warns", async (req, res) => {

    try {

        const {
            password,
            name,
            delta
        } = req.body;

        if (password !== "05060403") {

            return res
            .status(403)
            .send("wrong password");
        }

        let user = await Member.findOne({
            name
        });

        if (!user) {

            return res.sendStatus(404);
        }

        if (!user.warns) {

            user.warns = 0;
        }

        user.warns += delta;

        if (user.warns < 0) {

            user.warns = 0;
        }

        await user.save();

        res.sendStatus(200);

    } catch(err) {

        console.log(err);

        res.status(500).send("SERVER ERROR");
    }
});

// ===== УДАЛЕНИЕ ЮЗЕРА =====

app.post("/admin/delete-member", async (req, res) => {

    try {

        const {
            password,
            name
        } = req.body;

        if (password !== "05060403") {

            return res
            .status(403)
            .send("wrong password");
        }

        await Member.deleteOne({
            name
        });

        res.sendStatus(200);

    } catch(err) {

        console.log(err);

        res.status(500).send("SERVER ERROR");
    }
});

// ===== УДАЛЕНИЕ ФОТО =====

app.post("/admin/delete-gallery-image", async (req, res) => {

    try {

        const {
            password,
            name,
            index
        } = req.body;

        if(password !== "05060403"){

            return res
            .status(403)
            .send("wrong password");
        }

        let user = await Member.findOne({
            name
        });

        if(!user){

            return res.sendStatus(404);
        }

        if(!user.gallery){

            user.gallery = [];
        }

        // ФОТО КОТОРОЕ УДАЛЯЕМ
        const imageUrl = user.gallery[index];

        if(!imageUrl){

            return res.sendStatus(404);
        }

        // ===== CLOUDINARY PUBLIC ID =====
        const parts = imageUrl.split("/");

        const fileName =
            parts[parts.length - 1];

        const publicId =
            "avatars/" +
            fileName.split(".")[0];

        // ===== УДАЛЕНИЕ ИЗ CLOUDINARY =====
        await cloudinary.uploader.destroy(
            publicId
        );

        // ===== УДАЛЕНИЕ ИЗ МАССИВА =====
        user.gallery.splice(index, 1);

        await user.save();

        res.sendStatus(200);

    } catch(err){

        console.log(err);

        res.status(500).send("SERVER ERROR");
    }
});



app.post("/register", async (req, res) => {

    try {

        const {

            name,
            password

        } = req.body;

        let exists = await Member.findOne({
            name
        });

        if (exists) {

            return res
            .status(400)
            .send("USER EXISTS");
        }

        await Member.create({

            name,
            password,

            rank: "[1] Кандидат",

            warns: 0,

            online: true,

            avatar: "",

            gallery: [],

            department: "Без отдела",

            position: "Участник",

            xp: 0,

            level: 1
        });

        res.sendStatus(200);

    } catch(err) {

        console.log(err);

        res.status(500).send("SERVER ERROR");
    }
});

app.post("/login", async (req, res) => {

    try {

        const {

            name,
            password

        } = req.body;

        const user = await Member.findOne({
            name
        });

        if (!user) {

            return res
            .status(404)
            .send("USER NOT FOUND");
        }

        if (user.password !== password) {

            return res
            .status(403)
            .send("WRONG PASSWORD");
        }

        res.json(user);

    } catch(err) {

        console.log(err);

        res.status(500).send("SERVER ERROR");
    }
});

app.post(

    "/upload-gallery",

    upload.array("images", 10),

    async (req, res) => {

        try {

            const { name } = req.body;

            let user =
                await Member.findOne({
                    name
                });

            if(!user){

                return res.sendStatus(404);
            }

            const urls =
                req.files.map(
                    file => file.path
                );

            user.gallery = [
                ...(user.gallery || []),
                ...urls
            ];

            await user.save();

            res.json({
                gallery: user.gallery
            });

        } catch(err){

            console.log(err);

            res.sendStatus(500);
        }
    }
);

app.post(

    "/upload-avatar",

    upload.single("avatar"),

    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    error: "Файл не загружен"
                });
            }

            const { name } = req.body;

            let user =
                await Member.findOne({
                    name
                });

            if (!user) {

                return res.sendStatus(404);
            }

            const avatar =
                req.file.path;

            user.avatar = avatar;

            await user.save();

            res.json({
                avatar
            });

        } catch(err){

            console.log(err);

            res.status(500).json({
                error: err.message
            });
        }
    }
);
