(function(global) {

	var ScrollButtom = function () {
		var i = 0;
	};

	//获取滚动条当前的位置 
	ScrollButtom.prototype.getScrollTop = function() { 
		var scrollTop = 0; 
		if (document.documentElement && document.documentElement.scrollTop) { 
		  scrollTop = document.documentElement.scrollTop; 
		} else if (document.body) { 
		  scrollTop = document.body.scrollTop; 
		} 
		return scrollTop;
	};

	//获取当前可是范围的高度 
	ScrollButtom.prototype.getClientHeight = function() {
		var clientHeight = 0; 
		if (document.body.clientHeight && document.documentElement.clientHeight) {
		  clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight);
		} else { 
		  clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight);
		}
		return clientHeight;
	};

	//获取文档完整的高度 
	ScrollButtom.prototype.getScrollHeight = function () { 
	  return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight); 
	};

	ScrollButtom.prototype.init = function(callback) {
	  var that = this;
	  if (typeof callback !== 'function') {
	  	return;
	  }

	  $(window).on('scroll',function() {
		if ((that.getScrollTop() + that.getClientHeight()) >= that.getScrollHeight()) {
		    callback();
		}
	  });
	};

	global.ScrollButtom = ScrollButtom;
})(this);