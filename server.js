const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ===== MIDDLEWARE =====

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));

app.use(express.static(__dirname));

// ===== MONGODB =====


mongoose.connect(
"mongodb+srv://dmin:05060403@cluster0.rnxra9s.mongodb.net/ekakamov?retryWrites=true&w=majority&appName=Cluster0"
)

.then(() => {

    console.log("MONGO CONNECTED");

})
.catch(err => {

    console.log("MONGO ERROR:", err);

});

// ===== SCHEMA =====

const MemberSchema = new mongoose.Schema({

    name: String,

    password: String,

    rank: Number,

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

        if (!user.gallery) {

            user.gallery = [];
        }

        user.gallery.splice(index, 1);

        await user.save();

        res.sendStatus(200);

    } catch(err) {

        console.log(err);

        res.status(500).send("SERVER ERROR");
    }
});

// ===== START =====

app.listen(process.env.PORT || 3000, () => {

    console.log("SERVER STARTED");

});
