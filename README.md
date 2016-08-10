# hivideo
hivideo是一款自定义的html5 video播放器，重写了播放控制条样式，支持暂停、进度控制、声音控制、全屏播放。

如果在手机端使用，在全屏时支持横屏播放。

在线演示地址：https://heavis.github.io/hivideo/index.html

hivideo支持CommonJs、CMD、AMD规范。

# Quick start
hivideo源代码目录结构：

hivideo

----assets

    ----images
    
    ----hivideo.css
    
----hivideo.js


1.需要把上面的所有文件添加到项目中，在主页面中引用样式hivideo.css。

2.hivideo.js文件可以直接在主页面引用，也可以通过CommonJs方式引入。

3.在video元素上标记属性ishivideo为true：
```html
<video ishivideo="true"></video>
```
4.按照自己需求设置属性：

autoplay 自动播放

isrotate 全屏是否横屏播放

autoHide 播放时是否隐藏控制条

使用方式：
```html
<video ishivideo="true" autoplay="true" isrotate="false" autoHide="true">
    <source src="http://www.html5videoplayer.net/videos/madagascar3.mp4" type="video/mp4">
</video>
```
下面是一个完整的hivideo使用demo：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>hivideo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="assets/hivideo.css" />
    <script type="text/javascript" src="hivideo.js"></script>
    <style type="text/css">
        .main-wrap{
            margin: 0 auto;
            min-width: 320px;
            max-width: 640px;
        }

        .main-wrap video{
            width: 100%;
        }
    </style>
</head>
<body>
    <div class="main-wrap">
        <video ishivideo="true" autoplay="true" isrotate="false" autoHide="true">
            <source src="http://www.html5videoplayer.net/videos/madagascar3.mp4" type="video/mp4">
        </video>
    </div>
</body>
</html>
```


