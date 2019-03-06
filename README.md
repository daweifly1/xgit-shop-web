### 注意事项
* windows平台安装依赖时使用npm，尽量不要使用cnpm。可以使用：
 npm config set registry https://registry.npm.taobao.org
命令配置淘宝镜像，提升下载速度。
* 遇到node-sass编译问题时可以使用cnpm解决
  运行cnpm install node-sass
### 本项目配置的npm命令，可以查看pageage.json文件了解具体命令
    npm run start: 使用proxy.conf.json文件中配置的代理启动项目
    npm run build --prod: 增加nodejs进程内存运行ng的打包命令
### 依赖版本：
    nodejs：8.9.x
    npm:latest
    @angular/cli:1.7.4
    angular:5.2.0
    ng-zorro-antd:0.7.1
    rxjs:5.5.6
### 环境搭建：
    安装：
        node和npm：在https://npm.taobao.org/mirrors/node/  下载node安装（包含npm）。
        angular-cli: npm install -g @angular/cli@1.7.4
        安装项目依赖：npm install
### 代理配置
    通过简单的配置代理，每个项目组只需要启动一个gateway服务即可。
    1、在proxy.conf.json文件中/site target字段配置目标地址
    2、在src/environment.ts/environment.ts baseUrl中配置需要访问的服务名
    示例：
        proxy.conf.json文件site -》target字段：http://test.51hawk.com/
        src/environment.ts/environment.ts baseUrl配置
        {
            ius:http://localhost:4200/site/iusService      #site 对应proxy.conf.json文件中的配置
        }
        当调用 http.post("ius","/login")  时
        最终访问地址为：http://test.51hawk.com/iusService/login

    使用npm start 启动项目代理才能生效。

    注意：代理只针对开发环境，生产构建时src/environment.ts/environment.prod.ts正常配置即可
### ng 命令：
     启动服务：ng serve      #开发时建议配置代理，使用npm start启动
     生产构建：ng build --prod --env=prod
     开发构建：ng build --dev --e=dev

     创建：ng g type dir-name -m module --spec=false
        type：类型，支持以下类型
        * component  #组件
        * directive  #指令
        * pipe       #管道
        * service    #服务
        * class      #类
        * interface  #接口

        dir-name：名称，默认在app目录下,可以指定目录。见示例。

        -m:指定模块
        --spec=false:不生成测试文件
        示例：
        ng g component views/my-component -m views --spec=false  #在views目录下生成my-component组件，并挂载到views.modules模块中
        可以将工作目录切换到要生成组件的目录下，不需要指定-m，ng会自动就近寻找.modules文件

     更多命令参考:https://www.cnblogs.com/ckAng/p/6693702.html

### 后端菜单路由配置
    1、所有的菜单和工作面板路由均为main(MainLayoutComponent组件)的子路由
    2、后端url字段配置一级菜单使用绝对路径，子菜单使用相对路由
       例如：顶部菜单top1，对应左侧菜单 side-1，浏览器中地址http://127.0.0.1/main/top1/side-1
            后端顶级菜单url字段为/main/top1,子菜单url字段配置为side1
### 调试
    在ts文件中加入debugger关键字即可打断点，并且在chrome调试工具Sources中可以看到ts文件
### 目录结构

    │  .angular-cli.json        #ng 脚手架配置文件
    │  .editorconfig
    │  karma.conf.js            #自动化测试配置
    │  package.json             #依赖配置
    │  protractor.conf.js
    │  README.md
    │  tsconfig.json            #代码风格检查
    │  tslint.json
    │
    ├─e2e                       #测试
    │      app.e2e-spec.ts
    │      app.po.ts
    │      tsconfig.e2e.json
    │
    └─src
        │  favicon.ico          #浏览器标签图标
        │  index.html           #入口文件
        │  main.ts              #入口文件
        │  polyfills.ts         #兼容性配置文件
        │  styles.scss          #样式入口文件
        │  test.ts
        │  tsconfig.app.json
        │  tsconfig.spec.json
        │  typings.d.ts
        │
        ├─app
        │  │  app.component.ts                  #根组件
        │  │  app.module.ts                     #根模块
        │  │
        │  ├─core                               #服务模块
        │  │  │  core.module.ts                #服务模块注册文件
        │  │  │
        │  │  ├─common-services               #公用服务，如用户信息、权限、菜单等
        │  │  │      menu.service.ts
        │  │  │      scepter.service.ts
        │  │  │      user.service.ts
        │  │  │
        │  │  └─infra                          #http工具和拦截器
        │  │      ├─http
        │  │      │      http-util.service.ts
        │  │      │
        │  │      └─interceptors                    #http拦截器
        │  │              default.interceptor.ts
        │  │
        │  ├─directives                             #指令
        |   |       |--common-directives             #普通指令
        │  │      |--pipes                          #管道
        │  │      directives.module.ts              #指令模块注册文件
        │  ├─layout                               #通用布局组件
        │  │  │  layout.module.ts                 #模块注册文件
        │  │  │
        │  │  └─side-menu                       #左侧菜单栏组件
        │  │          side-menu.component.html
        │  │          side-menu.component.scss
        │  │          side-menu.component.ts
        │  │
        │  ├─views                              #路由视图组件
        │  │  │  views-routing.module.ts        #根路由模块文件
        │  │  │  views.module.ts                #路由视图模块文件
        │  │  │
        │  │  ├─main-layout                     #主布局
        │  │  │      main-layout.component.html
        │  │  │      main-layout.component.scss
        │  │  │      main-layout.component.ts
        │  │  │
        │  │  └─role-manage                     #角色和权限管理
        │  │          role-manage.component.html
        │  │          role-manage.component.scss
        │  │          role-manage.component.ts
        │  │
        │  └─widget                              #服务组件
        │      │  widget.module.ts
        │      │
        │      ├─login-modal                        #登录模态框
        │      │      login-modal.component.html
        │      │      login-modal.component.scss
        │      │      login-modal.ts
        │      │
        │      └─show-message                       #alert message和toast message
        │              show-message.ts
        │
        ├─assets                                    #静态资源
        │      .gitkeep
        │
        ├─environments                              #环境配置文件
        │      environment.prod.ts
        │      environment.ts
        │
        └─global-styles                             #全局样式
                default.scss
    
