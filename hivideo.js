/**
 * 视频库：hivideo
 * hivideo-options包含属性:
 * autoplay 自动播放, isrotate 全屏是否横屏播放,autoHide 播放时是否隐藏控制条
 * @author heavi, 2016.08.04
 */
var hivideo = function(ele){
        return new hivideo.prototype.init(ele);
    };

/**
 * 视频构造函数
 * @type {{init: hivideo.init}}
 */
hivideo.prototype = {
    /**
     * 视频构造函数
     * @param ele
     */
    init: function(ele){
        this.volume_ = 0
        this.videoId_ = "hivideo" + new Date().getTime();
        //播放器容器
        var videoWrapper = document.createElement("div");
        videoWrapper.setAttribute("class", "hi-video-wrapper");
        videoWrapper.setAttribute("hivideoId", this.videoId_);
        ele.setAttribute("hivideoId", "hivideo");
        var oldVideoParentEle = ele.parentNode;
        oldVideoParentEle.removeChild(ele);
        videoWrapper.appendChild(ele);
        if(!hivideo.hasClass(ele, "hi-video")){
            hivideo.addClass(ele, "hi-video");
        }
        oldVideoParentEle.appendChild(videoWrapper);

        var videoBar = document.createElement("div");
        videoBar.setAttribute("hivideoId", "videoBar");
        videoBar.setAttribute("class", "hi-video-controlbar");
        videoBar.innerHTML = '<div  class="video-play float"> \
        <button hivideoId="playBtn" class="onBtn"></button> \
        </div> \
        <div class="video-slider float"> \
        <progress hivideoId="progressbar" class="progressbar" value="0" max="100" ></progress> \
        <input type="range" hivideoId="seekbar"  value="0" class="seekbar"> \
        </div> \
        <div  class="video-mute float"> \
        <button hivideoId="muteBtn" class="onBtn"></button> \
        </div> \
        <div class="video-volume float"> \
        <input type="range" hivideoId="volumebar" class="volumebar" value="10" min="0" max="100" step="0.1"> \
        </div> \
        <div class="video-fullscreen float"> \
        <button hivideoId="fullBtn" class="onBtn"></button> \
        </div>';
        videoWrapper.appendChild(videoBar);

        this.videoParent = videoWrapper;
        this.video = ele;
        this.videoBar = hivideo.querySelector('div[hivideoId="videoBar"]', videoWrapper);
        this.playBtn = hivideo.querySelector('button[hivideoId="playBtn"]', videoWrapper);
        this.fullBtn = hivideo.querySelector('button[hivideoId="fullBtn"]', videoWrapper);
        this.muteBtn = hivideo.querySelector('button[hivideoId="muteBtn"]', videoWrapper);
        this.seekbar = hivideo.querySelector('input[hivideoId="seekbar"]', videoWrapper);
        this.volumebar = hivideo.querySelector('input[hivideoId="volumebar"]', videoWrapper);
        this.bindFullEvent().bindPlayEvent().bindMuteEvent().bindTimeChangeEvent().bindAutoHideControlsEvent();
        this.config();

        return this;
    },
    config: function(){
        var self = this;
        self.options = self.options || {};
        var boolConvert = function(value){
            return value && value.toLowerCase() == "true";
        };

        [{"autoplay": boolConvert}, {"isrotate": boolConvert}, {"autoHide": boolConvert}].forEach(function(propObj){
            for(var prop in propObj){
                if(self.video.hasAttribute(prop)){
                    self.options[prop] = propObj[prop](self.video.getAttribute(prop));
                }
            }
        });
        if(self.options.autoplay){
            self.playBtn.click();
        }
    }
}

/**
 * 对象扩展函数
 * @param obj
 */
hivideo.extend = hivideo.prototype.extend = function(obj){
    var self = this;
    for(var prop in obj){
        if(obj.hasOwnProperty(prop) && !self.hasOwnProperty(prop)){
            self[prop] = obj[prop];
        }
    }
}

hivideo.extend({
    /**
     * 获取class
     * @param elem
     * @returns {*|string|string}
     */
    getClass: function( elem ) {
        return elem.getAttribute && elem.getAttribute( "class" ) || "";
    },
    /**
     * 添加class
     * @param ele
     * @param value
     */
    addClass: function(ele, value){
        if(value){
            var curValue = hivideo.getClass(ele);
            if(curValue.indexOf(value) === -1){
                curValue = curValue + " " + value;
            }
            ele.setAttribute("class", curValue.trim());
        }
    },
    /**
     * 删除class
     * @param ele
     */
    removeClass: function(ele, value){
        if(value){
            var curValue = hivideo.getClass(ele);
            if(curValue.indexOf(value) > -1){
                curValue = (" " +  curValue + " ").replace(" " + value + " ", " ");
            }
            ele.setAttribute("class", curValue.trim());
        }
    },
    /**
     * 元素是否存在值为@{value}的class
     * @param ele
     * @param value
     * @returns {boolean}
     */
    hasClass: function(ele, value){
        var has = false;

        if(value){
            var curValue = hivideo.getClass(ele);
            if(curValue.indexOf(value) > -1){
                has = true;
            }
        }

        return has;
    },
    /**
     * querySelectorAll工厂，以备兼容性修改
     * @returns {NodeList}
     */
    querySelectorAll: function(selector){
        return document.querySelectorAll(selector);
    },
    /**
     * querySelector工厂，以备兼容性修改
     * @param selector
     * @param parentEle
     * @returns {Element}
     */
    querySelector: function(selector, parentEle){
        return parentEle ? parentEle.querySelector(selector): document.querySelector(selector);
    }
});

hivideo.prototype.init.prototype = hivideo.prototype;
/**
 * 绑定全屏事件
 * @returns {hivideo}
 */
hivideo.prototype.bindFullEvent = function(){
    var self = this;
    var origWidth = origHeight = 0;

    ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"].forEach(function(eventType){
        var curFullhivideoId = null;
        document.addEventListener(eventType, function(event){
            if((curFullhivideoId = document.body.getAttribute("curfullHivideo")) && curFullhivideoId !== self.videoId_ ){
                return;
            }
            var isRotate = self.options.isrotate;
            if(self.isFullScreen()){
                var cltHeight = isRotate ? window.screen.width : window.screen.height;
                var cltWidth = isRotate ? window.screen.height : window.screen.width;
                if(isRotate && !hivideo.hasClass(self.videoParent, "rotate90")){
                    hivideo.addClass(self.videoParent, "rotate90");
                }
                self.videoParent.style.height = cltHeight + "px";
                self.videoParent.style.width = cltWidth + "px";
            }else{
                if(isRotate) self.videoParent.className = self.videoParent.className.replace("rotate90", "").trim();
                self.videoParent.style.height = origHeight + "px";
                self.videoParent.style.width = origWidth + "px";
            }
        })
    });

    self.fullBtn && self.fullBtn.addEventListener("click", function(){
        if(!self.isFullScreen()){
            document.body.setAttribute("curfullHivideo", self.videoId_);
            origWidth = self.videoParent.offsetWidth;
            origHeight = self.videoParent.offsetHeight;
            // go full-screen
            if (self.videoParent.requestFullscreen) {
                self.videoParent.requestFullscreen();
            } else if (self.videoParent.webkitRequestFullscreen) {
                self.videoParent.webkitRequestFullscreen();
            } else if (self.videoParent.mozRequestFullScreen) {
                self.videoParent.mozRequestFullScreen();
            } else if (self.videoParent.msRequestFullscreen) {
                self.videoParent.msRequestFullscreen();
            }
            self.exchangeBtnStatus(this, false);
        }else{
            // exit full-screen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }

            self.exchangeBtnStatus(this, true);
        }
    });

    return self;
};
/**
 * 绑定播放事件
 * @returns {hivideo}
 */
hivideo.prototype.bindPlayEvent = function(){
    var self = this;
    [self.video, self.playBtn].forEach(function(ele){
        ele.addEventListener("click", function(event){
            event = event || window.event;

            if(!self.video) return;
            if(self.video.paused){
                self.video.play();
                self.playBtn && self.exchangeBtnStatus(self.playBtn, false);
            }else{
                self.video.pause();
                self.playBtn && self.exchangeBtnStatus(self.playBtn, true);
            }
        });
    });

    return self;
};
/**
 * 绑定播放控制面板隐藏事件
 */
hivideo.prototype.bindAutoHideControlsEvent = function(){
    var self = this;

    var showOrHideControls = function(isShow){
        isShow ? hivideo.removeClass(self.videoBar, "none") : hivideo.addClass(self.videoBar, "none");
    };

    var ticker = function(){
        //autoHide为true并且正在播放视频
        if(self.options.autoHide && !self.video.paused){
            showOrHideControls(false);
        }
    };
    var timerId = setInterval(ticker, 10000);

    ["mousemove"].forEach(function(type){
        self.videoParent.addEventListener(type, function(event){
            if(timerId){
                clearInterval(timerId);
                timerId = null;
            }
            showOrHideControls(true);
            timerId = setInterval(ticker, 10000);
        });
    });


    return self;
};
/**
 * 绑定音量控制事件
 * @returns {hivideo}
 */
hivideo.prototype.bindMuteEvent = function(){
    var self = this;
    self.muteBtn && self.muteBtn.addEventListener("click", function(){
        if(self.video.muted){
            self.video.muted = false;
            self.volumebar.value = self.volume_;

            self.exchangeBtnStatus(this, true);
        }else{
            self.video.muted = true;
            self.volumebar.value = 0;
            self.exchangeBtnStatus(this, false);
        }
    });

    return self;
}
/**
 * 绑定时间变化事件
 * @returns {hivideo}
 */
hivideo.prototype.bindTimeChangeEvent = function(){
    var self = this;
    //拖动时间进度
    self.seekbar && self.seekbar.addEventListener("change", function(){
        var time = self.video.duration * (this.value / 100);
        self.video.currentTime = time;
    });
    //video事件更新
    self.video && self.video.addEventListener("timeupdate", function(){
        var val = (100 / self.video.duration) * self.video.currentTime;
        self.seekbar.value = val;
    });
    //播放结束
    self.video && self.video.addEventListener("ended", function(){
        self.video.pause();
        self.video.currentTime = 0;
        self.exchangeBtnStatus(self.playBtn, true);
    });
    //声音控制
    self.volume_  = self.volumebar.value;
    self.video.volume = self.volumebar.value / 100;
    self.volumebar && self.volumebar.addEventListener("change", function(){
        self.video.volume = this.value / 100;
        self.volume_ = this.value;
        if(this.value == 0){
            self.video.muted = true;
            self.exchangeBtnStatus(self.muteBtn, false);
        }else {
            self.video.muted = false;
            self.exchangeBtnStatus(self.muteBtn, true);
        }
    });

    return self;
}
/**
 * 判断是否正在全屏播放
 * @returns {*}
 */
hivideo.prototype.isFullScreen = function(){
    return document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
};
/**
 * 更改按钮状态
 * @param ele
 * @param isOn
 */
hivideo.prototype.exchangeBtnStatus = function(ele, isOn){
    if(!ele) return;
    var onClass = "onBtn", offClass = "offBtn";
    if(isOn){
        hivideo.removeClass(ele, offClass);
        hivideo.addClass(ele, onClass);
    }else{
        hivideo.removeClass(ele, onClass);
        hivideo.addClass(ele, offClass);
    }
};
/**
 * 在DOMContentLoaded事件中初始化hivideo
 */
(function(){
    /**
     * 加载hivideo视频播放器
     */
    var loadVideo = function(){
        //TODO：现在hivideo.js文件必须放在html文件的最后，不然加载video失败。实现页面加载完后再之下后面的代码
        var videoList =  hivideo.querySelectorAll('video[ishivideo="true"]');
        for(var i = 0; i < videoList.length; i++){
            hivideo(videoList[i]);
        }
    };
    document.addEventListener( "DOMContentLoaded", function(){
        loadVideo();
        document.removeEventListener("DOMContentLoaded", arguments.callee);
    } );
})();



