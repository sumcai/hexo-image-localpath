# hexo-image-localpath

> `hexo-image-localpath` resolve the relative path of markdown assets automatically.

The code of this plugin refers to [hexo-intuitive-image](https://www.npmjs.com/package/hexo-intuitive-image), and fix the issue of `symlink operation not permitted`.



## Install

```sh
npm install hexo-image-localpath --save
```

After `hexo-image-localpath` installed, assets local-path in markdown file will be resolved automatically when use `hexo generate` or `hexo server` .



## Example

`_config.yml` configuration:

```
permalink: :title/
post_asset_folder: false
```



Here are document structure .  Front-matter of post supports permalink.

```text
- source
  |- _posts
     |- Notes
        |- Html
        |  |- HelloWorldHtml.md  ==> ![111](assets/111.jpg)
        |  |- assets
        |     |-111.jpg
        |  
        |- Javascript
		   |- HelloWorldJs.md   ==> permalink: /learnJS/ && ![222](assets/222.jpg)
       	   |- assets
       	      |-222.jpg
```



after executing command `hexo generate` or `hexo server`, assets files will be copied to `url\image-assets` public folder and assets file-path will be replaced to corresponding file-path.

```
- public
  |- Notes
  |  |- Html
  |     |- HelloWorldHtml
  |        |- index.html  ==> <img src="/Notes/Html/HelloWorldHtml/image-assets/111.jpg"
  |        |- image-assets
  |           |-111.jpg
  |       
  |- learnJS
     |- index.html		 ==> <img src="/learnJS/image-assets/222.jpg"
     |- image-assets
       	|-222.jpg
```



## Additional

you may add following config to `_config.yml` to rename image with its hash to avoid name duplication.

```
intuitive_image:
  hash: true
```



## 中文说明

网上找到的hexo引用本地图片路径基本都是需要新建文章同名目录，再使用[hexo-image-link](https://github.com/cocowool/hexo-image-link)、[hexo-asset-link](https://github.com/liolok/hexo-asset-link)此类插件适配，此方案可行，但最大的问题是一篇文章就要新建一个目录存储图片，看着非常难受。我平常喜欢将所有文章的图片都存储在一个目录中，搜遍全网只有[hexo-intuitive-image](https://www.npmjs.com/package/hexo-intuitive-image), 满足我的诉求，感谢原作者。`hexo-image-localpath`从它继承而来，增加解决 `symlink operation not permitted`报错的问题。

`hexo-image-localpath`主要用来解决markdown引用本地图片路径，生成静态网页后无法正确引用的问题。使用该插件基本可以和typora完美配合，无需手工拷贝图片或者修改链接。

原理是解析markdown中的图片路径，将源文件拷贝到目标url下的`image-assets`目录，同时将正确的图片路径填入html文件中。



### 安装方式

```sh
npm install hexo-image-localpath --save
```



### 使用说明

该插件安装后自动生效，无需添加任何配置。



### 案例

`_config.yml` 配置如下，关闭hexo自带的`post_asset_folder`功能，文章默认链接使用文章标题。

```
permalink: :title/
post_asset_folder: false
```



文档结构如下图，`HelloWorldHtml.md`引用的图片保存在同目录下的assets中，`HelloWorldJs.md`同样，只不过是在`Front-matter` 中设置了文章的固定路径 `permalink: /learnJS/`。

```
- source
  |- _posts
     |- Notes
        |- Html
        |  |- HelloWorldHtml.md  ==> ![111](assets/111.jpg)
        |  |- assets
        |     |-111.jpg
        |  
        |- Javascript
		   |- HelloWorldJs.md   ==> permalink: /learnJS/ && ![222](assets/222.jpg)
       	   |- assets
       	      |-222.jpg
```

执行 `hexo generate` 或 `hexo server`后，所有的markdown、图片资源被解析到public目录下，生成的文件目录如下，其中`HelloWorldHtml.md`按照原文件路径生成，`HelloWorldJs.md`按固定url生成，文章里的图片相对路径都被正确替换。

```
- public
  |- Notes
  |  |- Html
  |     |- HelloWorldHtml
  |        |- index.html  ==> <img src="/Notes/Html/HelloWorldHtml/image-assets/111.jpg"
  |        |- image-assets
  |           |-111.jpg
  |       
  |- learnJS
     |- index.html		 ==> <img src="/learnJS/image-assets/222.jpg"
     |- image-assets
       	|-222.jpg
```



### 补充

可在`_config.yml`中添加如下配置，防止图片名称重复(一般情况估计也用不到^^~)，尽情使用吧!

```
intuitive_image:
  hash: true
```

