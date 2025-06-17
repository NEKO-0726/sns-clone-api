const jwt = require("jsonwebtoken");

function isAuthenticated(req, res, next) {
  //contextディレクトリのauth.tsxファイルの、useEffect内で設定したAuthorizationヘッダーを半角スペースで分割して取得
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "認証トークンがありません" });
  }

  //デコードを行う。ログイン時に生成されたトークンかを確かめる
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "認証トークンがありません" });
    }

    req.userId = decoded.id;

    //認証が成功したので、asyncより後の処理に移っていいですよって意味
    next();
  });
}

module.exports = isAuthenticated;
