export function checkId(id) {
  return new Promise((resolve, reject) => {
    if (!id || id.length !== 24) reject('此话题不存在或已被删除');
    else resolve(id);
  });
}

export function checkPostOperateLimit(authorId, isAdmin, userId) {
  return new Promise((resolve, reject) => {
    if (!isAdmin && !authorId.equals(userId)) reject('无权限');
    else resolve();
  });
}
