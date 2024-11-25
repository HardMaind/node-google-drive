# Nodejs FES Template

# Environment vars
This project uses the following environment variables:

| Name                          | Description                         | Default Value                                  |
| ----------------------------- | ------------------------------------| -----------------------------------------------|
|CORS           | Cors accepted values            | "*"      |


# Pre-requisites
- Install [Node.js](https://nodejs.org/en/) version 20.*


# Getting started
- Clone the repository
```
git clone https://github.com/HardMaind/node-google-drive.git
```
- Install dependencies
```
cd node-google-drive
npm install
```
- Build and run the project
```
npm start
```
  Navigate to `http://localhost:3000`


## Project Structure
The folder structure of this app is explained below:

| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **node_modules**         | Contains all  npm dependencies                                                            |
| **public**               | Contains HTML and CSS file with some UI and style.                                        |
| **public/index.ejs**     | Index file is contain HTML code for UI render. 
| **public/style.css**     | Style file is contain some CSS for goog look of HTML.  
| index.ts                 | Entry point to express app                                                               |
| package.json             | Contains npm dependencies as well as [build scripts](#what-if-a-library-isnt-on-definitelytyped)  
