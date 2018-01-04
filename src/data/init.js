import R from 'ramda';
import bcrypt from 'bcrypt';
import * as db from '../data/db';
import User from '../data/models/user';
import { admin } from '../config';

const findOne = db.findOne(User)(R.__)({});
const create = db.create(User);

async function createAdmin() {
  try {
    const user = await findOne({ loginname: admin.loginname });
    if (!user) {
      const passwordHash = bcrypt.hash(admin.password);
      await create({
        loginname: admin.loginname,
        passwordHash: passwordHash,
        email: admin.email,
        avatar: admin.avatar,
        active: true,
        role: 'A'
      });
    }
  } catch (err) {
    console.log(err);
  }
}

createAdmin();
