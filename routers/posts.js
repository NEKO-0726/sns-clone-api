//投稿のAPIを構築する

const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isAuthenticated = require("../middlewares/isAuthenticated");

//prismaのインスタンス化
const prisma = new PrismaClient();

//つぶやき投稿用API
router.post("/post", isAuthenticated, async (req, res) => {
  const { content } = req.body;

  //content(入力内容)が空の場合はデータを保存したくない
  if (!content) {
    return res.status(400).json({ message: "内容を入力してください" });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: req.userId, // 認証ミドルウェアで設定されたuserIdを使用
      },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });

    res.status(201).json(newPost);
  } catch {
    console.error();
    res.status(500).json({ message: "サーバーエラー" });
  }
});

//最新つぶやき用API
//GET メソッドを使って /get_latest_post というURLにアクセスされたときに実行される処理。
router.get("/get_latest_post", async (req, res) => {
  try {
    const latestPosts = await prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });
    return res.status(200).json(latestPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "サーバーエラー" });
  }
});

//その閲覧しているユーザーの投稿内容だけを取得
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userPosts = await prisma.post.findMany({
      where: {
        authorId: parseInt(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: true,
      },
    });

    return res.status(200).json(userPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラー" });
  }
});

module.exports = router;
