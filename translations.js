'use strict';

const fs = require('fs');
const path = require('path')
var recursive = require("recursive-readdir");

// Escape invalid characters from path
const defaultPath = path.resolve(__dirname, 'app').replace(/ /g, '\\ ');
const translationDirectoryName = 'traslations'
const languagesConsts = {
  en:{
    label: 'en',
    directoryName : 'en',
  },
  gr:{
    label: 'gr',
    directoryName : 'gr',
  },
  sq:{
    label: 'gr',
    directoryName : 'sq',
  },
}



const match = []
const translationFiles = []

function readFile(path){
  const content = fs.readFileSync(path, 'utf-8')
  // console.log('content>>', content)

  console.log(path)
  // const find = content.match(/\bTranslateSerivice\.translate\(("([^")]+)/ig)
  const find = content.match(/TranslateSerivice\.translate\(([^)]+)\)/ig)
    // console.log(JSON.stringify(find))
    
    
   find && find.forEach((m, i) => {
    //  console.log(i)
     match.push({fn:m, path})
   })
  
  
}

recursive(defaultPath, function (err, files) {
  // console.log(typeof files)
  files.forEach(f =>{
    
    if (/\.(ts|html)$/i.test(f)){
        // console.log('ffffffffffffffffffffF>', f);
      readFile(f)
    }
  })

  // console.log(match)

  match.flat().forEach((m, i)=>{
    const splitedPath = m.path.split('/')
    const matchFunctions = (m.fn.match(/\(([^)]+)\)/g))[0].replace(/([\(|\)]|[|"'])/ig, '').split(',')
    const tmpFileName = splitedPath.pop()
    translationFiles.push({
      key: matchFunctions[0],
      value: '',
      hasPlural: !!matchFunctions[2],
      path: m.path,
      fileName: tmpFileName.substr(0, tmpFileName.lastIndexOf('.')),
      parent: splitedPath.pop()
    })
    
    
  })

  createLanguagesFiles()
});

// Create Directories

if (!fs.existsSync(`${defaultPath}/${translationDirectoryName}`)) {
  fs.mkdirSync(`${defaultPath}/${translationDirectoryName}`);
}

[`${translationDirectoryName}/${languagesConsts.en.directoryName}`,
  `${translationDirectoryName}/${languagesConsts.gr.directoryName}`,
  `${translationDirectoryName}/${languagesConsts.sq.directoryName}`].forEach(dir => {
    const fullPath = `${defaultPath}/${dir}`
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath);
    }
  })



const translationsFilePaths = {}

function createLanguagesFiles(){

  const languagesKeys = Object.keys(languagesConsts)
  languagesKeys.forEach(lng => {
    translationFiles.forEach(t => {
      const tmpFilePath = `${t.parent}.${t.fileName}.${languagesConsts[lng].label}.ts`

      if (!translationsFilePaths.hasOwnProperty(lng)){
        translationsFilePaths[lng] = []
      }

      if (translationsFilePaths[lng].indexOf(tmpFilePath) === -1){
        translationsFilePaths[lng].push(tmpFilePath) 
      }
    })
  })
  

  Object.keys(translationsFilePaths).forEach(languageKey => {
    translationsFilePaths[languageKey].forEach(fileName => {
      
      const filePath = `${defaultPath}/${translationDirectoryName}/${languagesConsts[languageKey].directoryName}/${fileName}`
      
      console.log('filePath', filePath)
      createFile(filePath)
    })
  })
  
}




function createFile(filename) {
  fs.open(filename, 'r', function (err, fd) {
    if (err) {
      fs.writeFile(filename, '', function (err) {
        if (err) {
          console.log(err);
        }
        console.log("The file was saved!");
      });
    } else {
      console.log("The file exists!");
    }
  });
}


// const fd = fs.openSync(filePath, 'w')




// createFiles()




// function callBack(filename, content){
//   console.log('filename', filename)
//   console.log('filename', content)
// }

// readFiles({ onFileContent:callBack})
