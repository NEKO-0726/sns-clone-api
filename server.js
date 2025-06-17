//npm i express nodemon
const express = require("express");
const app = express();
const authRoute = require("./routers/auth");
const postsRoute = require("./routers/posts");
const usersRoute = require("./routers/users");
const cors = require("cors");

require("dotenv").config(); // 環境変数を読み込むためにdotenvを使用。これで.envファイルの内容がprocess.envに反映される

const PORT = 8000;

app.use(cors()); // CORSを有効にする
// CORSは、異なるオリジン間でのリソース共有を許可するための仕組み

//express側で、JSON形式を使うという設定をする
//これをしないと、req.bodyがundefinedになる
app.use(express.json());

//先頭に"/api/auth"をつけて、authRouteを使う
app.use("/api/auth", authRoute);

app.use("/api/posts", postsRoute);

app.use("/api/users", usersRoute);

//最後にサーバー起動
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
