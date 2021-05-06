# 0.1.0 (2021-05-06)


### Bug Fixes

* add null checks for SelToAilas() to escape when nothing is selected ([964ed40](https://github.com/alx-plugins/marginnote-companion/commit/964ed40d1c40741c38ea2e75af648b81328ff206))
* link inserts properly in when {p:string[]} is present in body ([7261113](https://github.com/alx-plugins/marginnote-companion/commit/7261113c61f45b93d964bcd19daa5be1e43e68c5))
* remove redundant empty lines in the importMeta() output ([71177d1](https://github.com/alx-plugins/marginnote-companion/commit/71177d1b5897b77ce001071835890ace5b46c9d4))
* **frontmatter.ts:** rendered frontmatter no longer mixed with first line ([0a52394](https://github.com/alx-plugins/marginnote-companion/commit/0a52394fe4e275e0fe6fa15f40ff25dc74674a08))
* importMeta() no longer create empty lines below frontmatter ([01859ab](https://github.com/alx-plugins/marginnote-companion/commit/01859ab99a63afabcc2f9a1f6bb63b5805b96b08))
* **render.ts:** html's <header> can be ignored again during turndown ([d99d298](https://github.com/alx-plugins/marginnote-companion/commit/d99d2986828ab8f807df2513cde65400ff21609d))
* getSimpleNote() no longer ignore comments ([a656417](https://github.com/alx-plugins/marginnote-companion/commit/a65641753bf4ace315eeeced703193c4c6b4fadd))
* paste event handler no longer block normal paste event ([d445550](https://github.com/alx-plugins/marginnote-companion/commit/d445550c9b470a4c81a76d0acfedc6c99e85f522))


### Features

* add url scheme for SelToAlias() ([d2f4e15](https://github.com/alx-plugins/marginnote-companion/commit/d2f4e15b0d3cb2c46c66db30c3d37ba1f852d718))
* **settings.ts:** add setting tab for noteImportOption ([1e9195d](https://github.com/alx-plugins/marginnote-companion/commit/1e9195db5cb8ee5d7b589896edc563492db1fdb1))
* add aliasBelowH1 ([e14e156](https://github.com/alx-plugins/marginnote-companion/commit/e14e15627f765abb40c25e97326097a51f82b110))
* add autodef and SelToAlias macro ([c6185f7](https://github.com/alx-plugins/marginnote-companion/commit/c6185f73f7fa3e529671d7bdf6ea64fbfdfeab72))
* add extractSource macro ([55f5ca2](https://github.com/alx-plugins/marginnote-companion/commit/55f5ca20a987115ed673b568a0800cc2544e3908))
* add new option to update existing h1 for importMeta() ([473e6a0](https://github.com/alx-plugins/marginnote-companion/commit/473e6a02a329173872ddb49503d2c6f33e93d371))
* add SourceButton ([6fa4e17](https://github.com/alx-plugins/marginnote-companion/commit/6fa4e17a3aeab1d92b89246032d16ab27f56c549))
* add unload method for paste handler ([6cae321](https://github.com/alx-plugins/marginnote-companion/commit/6cae321dc5753768418a63810f36317574ea2c1a))
* enable autopaste ([45c5764](https://github.com/alx-plugins/marginnote-companion/commit/45c5764a6a3d0230eadfcd2cf6810d3aedab4665))
* migrate code from cpNote and alx-macros ([54ea70e](https://github.com/alx-plugins/marginnote-companion/commit/54ea70e3b19c4cd0e4710328d3270f2742609285))
* use turndown to convert htmlComments ([224a026](https://github.com/alx-plugins/marginnote-companion/commit/224a02658eb46e4f7551171c9be57cea0a094002))

