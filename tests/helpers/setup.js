// @ts-nocheck

var hooks = require('require-extension-hooks');

hooks('.scss').push(() => {
  return `
    const path = require('path');

    const writeFile = require('write');
    const stripComments = require('strip-css-comments');

    const test = require('ava');
    const compilers = {
      dartsass: require('sass'),
      libsass: require('node-sass'),
    };

    function render(compiler, file) {
      return new Promise((resolve, reject) => {
        compiler.render({
          file,
          includePaths: [__dirname, path.resolve(__dirname, '../node_modules')],
          outputStyle: 'expanded',
          precision: 10
        }, (err, data) => {
          if (err) reject(err.formatted);
          else resolve(data.css.toString());
        });
      });
    }

    Object.keys(compilers).forEach(compiler => {
      const outFile = path.join(__dirname, 'renders', path.relative(__dirname, __filename)).replace(/\.scss$/, '.'+compiler+'.css');
      test(path.basename(__filename, path.extname(__filename))+'['+compiler+']', t => {
        return render(compilers[compiler], __filename).then(css => {
          writeFile.sync(outFile, css);
          t.snapshot(stripComments(css, { preserve: false }));
        });
      });
    });
  `;
});
