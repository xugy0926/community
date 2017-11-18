(function(global) {

  var EditorDialog = function() {
    var $body = $('body');
    this.$win =$([
      '<div id="edit-dialog-modal" class="ui large modal">',
            '<div class="header"></div>',
            '<div class="content">',
              '<div class="ui form comment-reply-input">',
                '<textarea class="form-control reply-content" rows="30"></textarea>',
              '</div>',
            '</div>',
            '<div class="actions">',
              '<div class="ui cancel button">取消</div>',
              '<div class="ui green button" role="submit">提交</div>',
            '</div>',
      '</div>'].join('')).appendTo($body);

    // dialog消失时，移除嵌入到body内的modal
    this.$win.on('hidden.bs.modal', function (e) {
      $('#edit-dialog-modal').remove();
    });
  };

  EditorDialog.prototype.init = function (title, content) {
    this.title = title;
    this.content = content;
  };

  EditorDialog.prototype.show = function(callback){
    var that = this
    that.$win.find('.header').text(that.title)
    // 构建编辑器
    that.$win.find('.reply-content').text(that.content)
    that.$win.modal('show')
    that.$win.on('click', '[role=submit]', function(){
      callback(that.$win.find('.reply-content').val())
      that.$win.modal('hide')
    });
  };

  global.EditorDialog = EditorDialog
})(this);