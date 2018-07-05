Changelog
=========

All notable changes to this project will be documented in this file. The format is based on
[Keep a Changelog] and this project adheres to [Semantic Versioning].

[Unreleased]
------------

(nothing)

[v1.0.2] - 2018-07-05
---------------------

### Fixed

- Fixed `fromEnv` setting `displayTime` to `true` whenever `LOG_TIME` was set, disregarding actual value.
- Fixed `demo.js` crashing since v1.x API changes.

[v1.0.1] - 2018-07-05
---------------------

### Fixed

- Fixed `displayTime` being set to the wrong value by default.

[v1.0.0] - 2018-07-03
---------------------

### Added

- API documentation

### Changed

- Added [esdoc-integrate-test-plugin] ESDoc plugin
- Tweaked logo

### Fixed

- Fixed ESDoc not being updated correctly after build success

v0.1.0 - 2018-07-02
-------------------

### Added

- Initial implementation
- Unit tests
- Media files
- Documentation

[Keep a Changelog]: https://keepachangelog.com/en/1.0.0/
[Semantic Versioning]: (https://semver.org/spec/v2.0.0.html
[esdoc-integrate-test-plugin]: https://www.npmjs.com/package/esdoc-integrate-test-plugin

[Unreleased]: https://github.com/amercier/hiplog/compare/v1.0.2...HEAD
[v1.0.2]: https://github.com/amercier/hiplog/compare/v1.0.1...v1.0.2
[v1.0.1]: https://github.com/amercier/hiplog/compare/v1.0.0...v1.0.1
[v1.0.0]: https://github.com/amercier/hiplog/compare/v0.1.0...v1.0.0
