# 如何工作
基于gatsby简单封装
# 如何使用
1. git clone
2. npm run init
4. into you blog path note watch/deploy
# file format
## 唯一原则
标题与分类能且只能从md文件的绝对路径和md文件的frontmatter.title中确定  
## 隐喻匹配原则
文件夹代表分类 文件名代表标题 移动文件至其他文件夹意味着修改分类 修改文件名意味着修改标题

## 最小依赖原则
所有与md文件显示(渲染)相关的资源(图片,视频等)应当直接被放置到离md文件最近的地方 在引用时直接通过路径来引用
也就是说 在需要引用其他资源的md文件的同目录下 应当有且只有这个md文件本身和它的资源文件
这就是导致了这个文件夹的命名问题 为了此原则与隐喻匹配原则的冲突 遵循以下几点
1. 所有main.md文件或者与目录同名的文件的目录或者文件夹结尾为.md的都不是分类而被认为是标题
2. 因为文件名必须符合操作系统文件命名规则 所以允许使用md的frontmatter.title作为标题的别名
3. 违背以上规则 停止渲染
参见如下测试用例
a,[a],"" => a,[],null
main,[..,a],"" => a,[],null
main,[..,a],b => b,[],null
main,[],b => b,[],null
main,[],"" => null,null,err
xxxx,[..,a],b => b,[],null
xxxx,[..,a],b => b,[],null

# TODO
- [x] disqus
- [] category 
- [] time diff
- [] group sort
- [] empty article
- [] image
- [] gatsby-remark-prismjs cpp haskhell
- [] ts
- [] support of draft state
- [] rss
- [] unit test