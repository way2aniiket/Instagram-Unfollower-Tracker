const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const app = express();
const upload = multer({ dest: 'temp/' });

app.set('view engine', 'ejs');
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static('public'));

async function extractUsernames(filePath) {
    const htmlContent = await fs.promises.readFile(filePath, 'utf-8'); // Await file read
    const $ = cheerio.load(htmlContent);
    const usernames = [];

    $('a[target="_blank"]').each((index, element) => {
        usernames.push($(element).text());
    });

    return usernames;
}

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.post('/upload', upload.fields([{ name: 'followers' }, { name: 'following' }]), async (req, res) => {
    if (!req.files || !req.files['followers'] || !req.files['following']) {
        return res.redirect('/');
    }

    const followersPath = req.files['followers'][0].path;
    const followingPath = req.files['following'][0].path;

    // Await the function calls
    const followers = await extractUsernames(followersPath);
    const following = await extractUsernames(followingPath);

    const setFollowers = new Set(followers);
    const setFollowing = new Set(following);

    const fans = [...setFollowers].filter(x => !setFollowing.has(x));
    const snakes = [...setFollowing].filter(x => !setFollowers.has(x));

    console.log("List C (fans):", fans);
    console.log("List D (snakes):", snakes);

    res.render('result', { fans, snakes });
});


const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
