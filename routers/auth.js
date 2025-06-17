const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateIdenticon = require("../utils/generateIdenticon");

//prismaのインスタンス化
const prisma = new PrismaClient();

//新規ユーザー登録API
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const defaultIconImage = generateIdenticon(email);

  try {
    //ハッシュ化したパスワードを使ってユーザーをDBに保存する
    const hashedPassword = await bcrypt.hash(password, 10);

    //ここでPrismaを使ってユーザーをDBに保存する処理を書く

    //prismaのモジュールを使うのでインストールする
    //npm i @prisma/client
    //prismaを使うことで、javascript形式でデータを挿入できる
    //prisma.user.createのuserはmodelのUserを指す
    //awaitは非同期処理なので、async関数内で使う必要がある
    //passwordはそのまま保存するのは危険なのでbcryptライブラリを使ってハッシュ化する
    //npm i bcrypt
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profile: {
          create: {
            bio: "はじめまして",
            profileImageUrl: defaultIconImage,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return res.json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "サーバーエラー" });
  }
});

//ユーザーログインAPI
//ユーザにトークンを発行してログイン処理を書く
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  //ユーザーが存在するか確認
  const user = await prisma.user.findUnique({
    where: { email },
  });

  //ユーザーが存在しない場合は401エラーを返す
  if (!user) {
    return res.status(401).json({ message: "そのユーザーは存在しません" });
  }

  //パスワードが正しいか確認
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "パスワードが正しくありません" });
  }

  //トークンを発行
  //jsonwebtokenを使ってトークンを発行する
  //jwtを使うのでインストールする
  //npm i jsonwebtoken
  //process.env.SECRET_KEYは秘密鍵のこと、直接書くとセキュリティ的にまずいので環境変数として宣言、.envファイルに記載
  //Node.js上で環境変数を使うためにdotenvライブラリを使う
  // npm i dotenv
  //tokenはローカルストレージ(あまりよくない)やクッキーに保存して、クライアントが所持する
  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    expiresIn: "1d", // トークンの有効期限を1日に設定
  });

  return res.json({ token });
});

module.exports = router;
