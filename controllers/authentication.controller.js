const { StatusCodes, getReasonPhrase } = require("http-status-codes");
const db = require("../models");
const handleApiError = require("./utils/apiErrorHandler");
const helpers = require("./utils/helpers")
const model = db.stockItem;
const jwt = require('jsonwebtoken');


exports.login = async (req, res) => {
  console.log("CHEGUEI NO LOGIN!");
  console.log(req);

  if (authenticateUser(req.body.username, req.body.password)) {
    const id = 1;
    const token = generateAccessToken(id);
    
    return res.json({ 
        auth: true, 
        token: token,
        expiresIn: 10800 });
  }
    
  res.status(401).json({message: 'Nome de Usuário ou Senha inválidos!'});
};

exports.logout = async (req, res) => {
  res.json({ auth: false, token: null });
};

exports.authenticateToken = (req, res, next) => {
    console.log(req.headers);
    const authHeader = req.headers['authorization']
    const token = authHeader.split(' ')[1]

    if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });
    
    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) return res.status(403).json({ auth: false, message: 'Failed to authenticate token.' });
      console.log("autorizado");
      req.user = user;
      next();
    });
};

function generateAccessToken(id) {
    return jwt.sign({id: id}, process.env.SECRET, { expiresIn: '18000s' });
}

function authenticateUser(username, password) {
  if(username === 'natalia' && password === 'Gma2009adm') {
    return true;
  }

  if(username === 'gilsandro' && password === 'Gma2009adm') {
    return true;
  }

  if(username === 'rubia' && password === 'Gma2009') {
    return true;
  }

  if(username === 'dev' && password === 'dev') {
    return true;
  }

  return false;
}