import { UserProxy } from '../proxy';
import { bhash } from '../common/tools';
import { admin } from '../config';

async function createAdmin() {
  try {
    const user = await UserProxy.findOne({ loginname: admin.loginname });
    if (!user) {
      const passwordHash = bhash(admin.password);
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
