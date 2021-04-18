# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog][2], and this project adheres to
[Semantic Versioning][1].

## [Unreleased]

## [4.1.0] - 2021-04-17
Version number jump to work around an older, ugly version number that was
release erroneously.

### Updated
- extended run times on weekens to account for more daytime games
- changed all file extensions and switched code coverage engine

## [3.0.0] - 2021-04-09

### Added
- alarm to alert on ETL failing for over an hour
- metric for tracking DOM type of matchup pages
- logic to avoid running during baseball off hours

### Updated
- test run definition to no longer use deprecated polyfill library
- test run definition to use more tightly-scoped path
- upgraded to Node 14 (except test coverage)
- updated all dependencies to latest

## [2.1.0] - 2019-07-27
### Updated
- Dependencies:
  - aws-sdk (2.501.0)
  - babel-plugin-istanbul (5.2.0)
  - chrome-aws-lambda (1.19.0)
  - puppeteer (1.19.0)

## [2.0.0] - 2019-07-19
### Removed
- all old functionality

### Added
- new Lambda-based ETL
- scripting for running ETL locally, tests and deployments
- supporting AWS infrastructure to host and trigger ETL

## [1.0.0] - 2018-09-25
### Added
- this CHANGELOG
- lightweight and flimsy ETL that handled scoring during the entire 2018 season

### Changed
- README to contain actual content

### Removed
- Nothing, just keeping this here to use a template for future CHANGELOG
sections

[1]:https://semver.org/spec/v2.0.0.html
[2]:https://keepachangelog.com/en/1.0.0/
