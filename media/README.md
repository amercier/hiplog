hiplog-assets
=============

> Assets for [hiplog](https://github.com/amercier/hiplog).

Install
-------

Requirements:
- [Node.js] 8+, with **npm** 5+
- [Sketch] with [sketchtool] in `PATH`.

Install [npm] dependencies:

```sh
npm install
```

Build assets
------------

```sh
npm run build
```

This generates `.png` and `.svg` assets in the `img/` folder.

**Note:** these assets are intended to be commited, that is why `npm run generate`
is run as a git pre-commit hook (using [pre-commit]).

License
-------

[![License](https://img.shields.io/github/license/amercier/hiplog.svg)](./LICENSE.md)

[Node.js]: https://nodejs.org/
[Sketch]: https://www.sketchapp.com/
[sketchtool]: https://developer.sketchapp.com/guides/sketchtool/
[npm]: https://www.npmjs.com/
[pre-commit]: https://www.npmjs.com/package/pre-commit
