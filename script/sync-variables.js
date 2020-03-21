const fs = require("fs");
const path = require("path");
const ROOT = path.resolve( __dirname, '..');

const TARGET_VARIABLE_DIR_STR = path.resolve( ROOT, 'src/assets');
// @qax/qax-ui变量文件名
const TARGET_VARIABLE_FILE_STR = "scss-variable";
const VARIABLE_FILE_CACHE = [];

const JSON_FILE_PATH = path.resolve( TARGET_VARIABLE_DIR_STR, TARGET_VARIABLE_FILE_STR + '.json' )

setVariableCache(TARGET_VARIABLE_DIR_STR);
fs.writeFileSync( JSON_FILE_PATH, JSON.stringify(VARIABLE_FILE_CACHE), 'utf-8');

function setVariableCache(target_path) {
    const jsFilename = path.resolve(target_path, TARGET_VARIABLE_FILE_STR+'.js');
    const scssFilename = path.resolve(target_path, TARGET_VARIABLE_FILE_STR+'.scss');

    console.log( jsFilename, scssFilename)

    if (fs.existsSync(jsFilename)) {
      const content = fs.readFileSync(jsFilename, "utf8");
      VARIABLE_FILE_CACHE.push(...content
        .replace(/(.*)\n/g, function(m, g) {
          const result = /export const ([^;]*;$)/.exec(g);
          return result ? result[1] : "";
        })
        .split(";"));
    }

    if (fs.existsSync(scssFilename)) {
      const content = fs.readFileSync(scssFilename, "utf8");
      VARIABLE_FILE_CACHE.push(...content
        .replace(/(.*)\n/g, function(m, g) {
          if (/\$--[^;]*;$/.test(g)) {
            return g;
          } else {
            return "";
          }
        })
        .split(";"));
    }

    // console.log( VARIABLE_FILE_CACHE )
  }