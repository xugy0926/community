(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Lily = factory(global));
}(this, (function () {

  function Lily() {
  }

  Lily.prototype.options = function () {
    return {
      key: '',
      loginname: '',
      username: '',
      userId: '',
      password: '',
      rePassword: '',
      email: '',
      weixin: '',
      qq: '',
      avatar: '',
      location: '',
      signature: '',
      accessToken: '',
      posts: [],
      currentPage: 1,
      canLoadData: true,
      pages: 1,
      newest: false,
      good: false,
      title: '',
      content: '',
      description: '',
      advertisingMap: '',
      recommendUrl: '',
      errorMsg: '',
      successMsg: ''
    }
  }

  Lily.prototype.parse = function (response) {
    return response.data;
  }

  Lily.prototype.resetLoad = function (vm) {
    vm.canLoadData = true;
  }

  Lily.prototype.error = function (err, vm) {
    if (vm) {
      vm.errorMsg = err.response.data.error;
    }
  }

  Lily.prototype.signin = function (vm) {
    axios.post(dataPrefix + '/user/signin',
      {
        loginname: vm.username,
        password: vm.password
      })
      .then(this.parse)
      .then(function (result) {
        var user = result.user;
        if (user && user.active) {
          location.href =  pagePrefix + '/';
        } else {
          console.log(result);
          vm.errMsg = result.message;
        }
      })
      .catch(err => this.error(err, vm))
  }

  Lily.prototype.searchPasswordFromMail = function (vm) {
    axios.post(dataPrefix + '/user/createSearchPassword',
      {
        email: vm.email
      })
      .then(this.parse)
      .then(function (result) {
        if (vm) {
          vm.successMsg = result.msg;
        }
      })
      .catch(err => this.error(err, vm));
  }

  Lily.prototype.resetPassword = function (vm) {
    if (vm.password !== vm.rePassword) {
      vm.errorMsg = '两次输入的密码不一致';
      return;
    }

    if (vm.password === '' || vm.rePassword === '') {
      vm.errorMsg = '请输入新密码';
      return;
    }

    if (vm.password.length < 6 || vm.rePassword < 6) {
      vm.errorMsg = '密码太短';
      return;
    }

    vm.errorMsg = '';
    vm.successMsg = '';

    axios.post(dataPrefix + '/user/authSearchPassword',
      {
        key: vm.key,
        loginname: vm.loginname,
        password: vm.password,
        rePassword: vm.rePassword
      })
      .then(this.parse)
      .then(function(result) {
        vm.password = '';
        vm.rePassword = '';
        vm.successMsg = result.msg;
      })
  }

  Lily.prototype.getUser = function (vm) {
    axios.get(dataPrefix + '/user/' + vm.userId + '/detail')
      .then(this.parse)
      .then(function(result) {
        vm.loginname =  result.user.loginname;
        vm.weixin = result.user.weixin;
        vm.qq = result.user.qq;
        vm.email = result.user.email;
        vm.avatar = result.user.avatar;
        vm.location = result.user.location;
        vm.signature = result.user.signature;
        vm.accessToken = result.user.accessToken;
      })
      .catch(err => this.error(err, vm))
  }

  Lily.prototype.updateUser = function (vm) {
    axios.patch(dataPrefix + '/user/' + vm.userId + '/update',
      {
        loginname: vm.loginname,
        weixin: vm.weixin,
        qq: vm.qq,
        email: vm.email,
        avatar: vm.avatar,
        location: vm.location,
        signature: vm.signature
      })
      .then(this.parse)
      .then(function(result) {
        vm.successMsg = result.msg;
      })
      .catch(err => this.error(err, vm))
  }

  Lily.prototype.signup = function (vm) {
    axios.post(dataPrefix + '/user/signup',
      {
        loginname: vm.loginname,
        password: vm.password,
        rePassword: vm.rePassword,
        email: vm.email
      })
      .then(this.parse)
      .then(result => { vm.successMsg = result.message })
      .catch(err => this.error(err, vm))
  }

  Lily.prototype.getPosts = function(
    vm,
    zoneId,
    currentPage,
    good
  ) {
    vm.newest = !good;
    vm.good = good;

    axios.get(dataPrefix + '/posts',
      {
        params: {
          currentPage: currentPage,
          zoneId: zoneId,
          good: vm.good
        }
      })
      .then(this.parse)
      .then(function (result) {
        let newPosts = result.posts;
        let newAuthors = result.authors;
        // moment.locale('zh-cn');
        newPosts.forEach(function (item) {
          item.updateAtAgo = moment(item.updateAt).fromNow();
          var index = _.findIndex(newAuthors, function(i) {
            return i._id === item.authorId
          })

          if (index >= 0) {
            item.author = newAuthors[index]
          }

          vm.posts.push(item);
        })

        vm.pages = result.pages;
        vm.currentPage = result.currentPage;
      })
      .then(() => this.resetLoad(vm))
      .catch(err => this.error(err, vm))
  };

  Lily.prototype.getUserPosts = function (
    vm,
    currentPage,
    userId
  ) {
    if (currentPage > vm.pages) return;

    axios.get(dataPrefix + '/user/' + userId + '/posts?' + 'currentPage=' + currentPage)
      .then(this.parse)
      .then(function (result) {
        let newPosts = result.posts;
        let newAuthors = result.authors;
        // moment.locale('zh-cn');
        newPosts.forEach(function(item) {
          item.updateAtAgo = moment(item.updateAt).fromNow();
          var index = _.findIndex(newAuthors, function(i) {
            return i._id === item.authorId
          })

          if (index >= 0) {
            item.author = newAuthors[index]
          }

          vm.posts.push(item);
        })

        vm.pages = result.pages;
        vm.currentPage = result.currentPage;
      })
      .then(() => this.resetLoad(vm))
      .catch(err => this.error(err, vm))
  }

  Lily.prototype.getUserCollectPosts = function (
    vm,
    currentPage,
    userId
  ) {
    if (currentPage > vm.pages) return;

    axios.get(dataPrefix + '/user/' + userId + '/collectPosts?' + 'currentPage=' + currentPage)
      .then(this.parse)
      .then(function(result) {
        result.posts.forEach(function(item) {
          item.updateAtAge = moment(item.updateAt).fromNow();
          vm.posts.push(item);
        });

        vm.currentPage = currentPage;
        vm.pages = result.pages;
      })
      .then(() => this.resetLoad(vm))
      .catch(err => this.error(err, vm))
  }

  Lily.prototype.createPost = function (
    vm,
    data
  ) {
    axios.post(dataPrefix + '/posts', data)
      .then(this.parse)
      .then(function(result) {
        location.href = result.url;
      })
      .catch(this.error);
  }

  Lily.prototype.upPost = function (
    vm,
    id
  ) {
    axios.patch(dataPrefix + '/posts/' + id + '/up')
      .then(this.parse)
      .then(function(result) {
        let index = _.findIndex(vm.posts, function(post) {
          if (post._id === id) return true;
        });

        vm.posts[index].ups = result.ups;
      })
      .catch(err => this.error(err, vm))
  }
  return Lily;
})));