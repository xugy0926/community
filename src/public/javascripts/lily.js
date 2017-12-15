(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
      ? define(factory)
      : (global.Lily = factory(global));
})(this, function() {
  function Lily({ el, data, methods }) {
    if (!el) el = '#app';
    if (!data) data = {};
    if (!methods) methods = {};

    return new Vue({
      el: el,
      data: Object.assign(data, {
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
        oldPassword: '',
        newPassword: '',
        zones: [],
        posts: [],
        authors: [],
        replies: [],
        currentPage: 1,
        canLoadData: true,
        isLoading: false,
        pages: 1,
        newest: false,
        good: false,
        postId: '',
        title: '',
        content: '',
        description: '',
        advertisingMap: '',
        recommendUrl: '',
        errorMsg: '',
        successMsg: ''
      }),
      methods: Object.assign(methods, {
        resetMessage() {
          this.errorMsg = '';
          this.successMsg = '';
        },
        parse(response) {
          return response.data;
        },
        resetLoading(data) {
          this.isLoading = false;
          return data;
        },
        error(err) {
          this.errorMsg = err.response ? err.response.data.error : err;
          alert(this.errorMsg);
        },
        signin() {
          axios
            .post(dataPrefix + '/user/signin', {
              loginname: this.username,
              password: this.password
            })
            .then(this.parse)
            .then(function(result) {
              const user = result.user;
              if (user && user.active) {
                location.href = pagePrefix + '/';
              } else {
                this.errorMsg = result.message;
              }
            })
            .catch(this.error);
        },
        signup() {
          axios
            .post(dataPrefix + '/user/signup', {
              loginname: vm.loginname,
              password: vm.password,
              rePassword: vm.rePassword,
              email: vm.email
            })
            .then(this.parse)
            .then(result => {
              vm.successMsg = result.message;
            })
            .catch(this.error);
        },
        getUser(id) {
          axios
            .get(dataPrefix + '/user/' + id + '/detail')
            .then(this.parse)
            .then(result => {
              this.loginname = result.user.loginname;
              this.weixin = result.user.weixin;
              this.qq = result.user.qq;
              this.email = result.user.email;
              this.avatar = result.user.avatar;
              this.location = result.user.location;
              this.signature = result.user.signature;
              this.accessToken = result.user.accessToken;
            })
            .catch(this.error);
        },
        updateUserInfo(id) {
          axios
            .patch(dataPrefix + '/user/' + id + '/update', {
              loginname: this.loginname,
              weixin: this.weixin,
              qq: this.qq,
              email: this.email,
              avatar: this.avatar,
              location: this.location,
              signature: this.signature
            })
            .then(this.parse)
            .then(result => {
              this.successMsg = result.msg;
            })
            .catch(this.error);
        },
        getZones(params) {
          axios
            .get(dataPrefix + '/zones', {
              params
            })
            .then(this.parse)
            .then(result => {
              result.zones.forEach(function(item) {
                item.active = false;
              });

              this.zones = result.zones;
            })
            .catch(this.error);
        },
        getPosts(url, params) {
          if (!this.canLoadData) return;
          this.isLoading = true;
          this.newest =
            typeof params.good !== 'undefined' ? !params.good : true;
          this.good = typeof params.good !== 'undefined' ? params.good : false;
          axios
            .get(url, { params })
            .then(this.parse)
            .then(this.resetLoading)
            .then(result => {
              let newPosts = result.posts;
              let newAuthors = result.authors;
              newPosts.forEach(item => {
                item.updateAtAgo = dateFns.distanceInWordsToNow(item.updateAt);
                item.author = R.find(
                  R.propEq('_id', item.authorId),
                  newAuthors
                );
                this.posts.push(item);
              });
              this.pages = result.pages;
              this.currentPage = result.currentPage;
              this.canLoadData = result.pages > result.currentPage;
            })
            .catch(this.error);
        },
        getPost(id) {
          return axios
            .get(dataPrefix + '/posts/' + id)
            .then(function(response) {
              return response.data;
            });
        },
        createPost(body) {
          axios
            .post(dataPrefix + '/posts', body)
            .then(this.parse)
            .then(function(result) {
              location.href = result.url;
            })
            .catch(this.error);
        },
        savePost(id, body) {
          axios
            .patch(dataPrefix + '/posts/' + id, body)
            .then(this.parse)
            .then(function(result) {
              location.href = result.url;
            })
            .catch(this.error);
        },
        onUpPost(id) {
          axios
            .patch(dataPrefix + '/posts/' + id + '/up')
            .then(this.parse)
            .then(result => {
              if (this.posts.length > 0) {
                const idx = R.findIndex(R.propEq('_id', id))(this.posts);
                this.posts[idx].ups = result.ups;
              } else {
                this.ups = result.ups.length;
              }
            })
            .catch(this.error);
        }
      })
    });
  }

  return Lily;
});
