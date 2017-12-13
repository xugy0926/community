import bcrypt from 'bcrypt';
import { UserProxy } from '../proxy';
import { admin } from '../config';

async function createAdmin() {
  try {
    const user = await UserProxy.findOne({ loginname: admin.loginname });
    if (!user) {
      const passwordHash = bcrypt.hash(admin.password);
      await UserProxy.create({
        loginname: admin.loginname,
        passwordHash: passwordHash,
        email: admin.email,
        avatar: admin.avatar,
        active: true
      });
    }
  } catch (err) {
    console.log(err);
  }
}

createAdmin();
