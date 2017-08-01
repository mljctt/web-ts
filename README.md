# web-ts

Typescript web project code scaffold base on Koa@2.

> Javascript Version: https://github.com/qixin1991/web-zero.git

# demo
![web-ts-demo](http://brain.qiniudn.com/web-ts-demo.gif)

# Install

> **Warning:** Dependency on Node `v7.6.0` or higher

```
npm install -g web-ts
```

# Usage

```
➜ web-ts
Usage: web-ts operation [init | new | delete] option [module_name] [databse_type]

Example:
	 web-ts init 			 Create a api project named current dir.
	 web-ts new users 		 Create src/routes/users.js and dao/users.js files.
	 web-ts new users mysql 	 Create users module with DB base on mysql.
	 web-ts delete users 		 Delete src/routes/users.js and src/dao/users.js files.
```

# Example

- Init project

```
mkdir web-ts-example && cd web-ts-example
web-ts init
```

- Create a new Biz Module

```
web-ts new users
```

Execute this in terminal, you'll see `routes/users.js` and `dao/users.js` that have been created.

- Create a new Biz Module with dao base on mysql

```
web-ts new users mysql
```

Execute this in terminal, you'll see `routes/users.js` and `dao/users.js` that have been created.

- Delete a Biz Module

```
web-ts delete users
```

Execute this in terminal, you'll see `routes/users.js` and `dao/users.js` that have been deleted.

- Start webapp

> Remember to edit `conf/db_${env}.js`. These files are db settings.

```
npm install
npm start
```
Now, open browser to visit [http://localhost:3000](http://localhost:3000)

Have Fun!
