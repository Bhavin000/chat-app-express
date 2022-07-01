const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { query } = require("../db/mysql");

class User {
  constructor(obj) {
    this._id = obj.id
    this.name = obj.name
    this.email = obj.email
    this.password = obj.password
  }

  toJSON() {
    return {
      id: this._id,
      name: this.name,
      email: this.email
    }
  }

  async hashPassword() {
    return bcrypt.hash(this.password, 8)
  }

  async comparePassword(pass) {
    return bcrypt.compare(pass, this.password)
  }

  async generateAuthToken() {
    const token = jwt.sign({ _id: this._id.toString() }, 'thisisit');

    const q = `INSERT INTO 
                    tokens (user_id, token) 
                    VALUES ('${this._id}', '${token}')`

    await query(q)
    return token;
  };
}

module.exports = {
  User
}