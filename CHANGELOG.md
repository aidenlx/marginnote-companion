# [0.6.0](https://github.com/aidenlx/marginnote-companion/compare/0.5.1...0.6.0) (2021-09-15)


### Features

* allow templates to be added to command ([2740ee3](https://github.com/aidenlx/marginnote-companion/commit/2740ee337a8d97d1300f9483281fb2166eb682d7))
* **setting-tab:** hide indent char input box when set to true ([f6c8e76](https://github.com/aidenlx/marginnote-companion/commit/f6c8e76475ecb6605bad6b6426580977c5776684))

## [0.5.1](https://github.com/aidenlx/marginnote-companion/compare/0.5.0...0.5.1) (2021-09-14)


### Bug Fixes

* fix version ([966f044](https://github.com/aidenlx/marginnote-companion/commit/966f044f86602fdff8dad83c693e09e88c6936b3))

# [0.5.0](https://github.com/aidenlx/marginnote-companion/compare/0.4.0...0.5.0) (2021-09-14)


### Bug Fixes

* **cm-tools:** fix cursor unchanged when insert new string on mobile ([6227901](https://github.com/aidenlx/marginnote-companion/commit/6227901ae5c847264ae94a62009d275cfeabf891))


### Features

* add command to insert mn data; initial mobile support ([435b33d](https://github.com/aidenlx/marginnote-companion/commit/435b33d5ea25659a42ca2d818111a88b2b6599ff))

# [0.4.0](https://github.com/aidenlx/marginnote-companion/compare/0.3.4...0.4.0) (2021-09-13)


### Bug Fixes

* **toc-template:** query now returns dashed name in favor of camel; add Encode for Query ([0359532](https://github.com/aidenlx/marginnote-companion/commit/035953241d5723452d127140fc59d009b7194272))


### Features

* **toc-template:** add option for indent character ([91b5594](https://github.com/aidenlx/marginnote-companion/commit/91b55944e508d0285d93f43b154f55f74bad46c6))

## [0.3.4](https://github.com/aidenlx/marginnote-companion/compare/0.3.3...0.3.4) (2021-09-12)


### Bug Fixes

* **toc-template:** fix tab indent ([516f70a](https://github.com/aidenlx/marginnote-companion/commit/516f70a0287ac017672a240669e0106274331393))

## [0.3.3](https://github.com/aidenlx/marginnote-companion/compare/0.3.2...0.3.3) (2021-09-12)


### Bug Fixes

* **mn-data-handler:** fix fail to import meta ([531ed94](https://github.com/aidenlx/marginnote-companion/commit/531ed942b964f10bd74b9208963fab74afbe0b99))
* **toc-template:** disable sort ([214d067](https://github.com/aidenlx/marginnote-companion/commit/214d06763cb53e57c30331e9006845d4bcd9badb))

## [0.3.2](https://github.com/aidenlx/marginnote-companion/compare/0.3.1...0.3.2) (2021-09-07)


### Bug Fixes

* **paste-handler:** fix html being pasted three times with html->md enabled ([73888e3](https://github.com/aidenlx/marginnote-companion/commit/73888e36f89f60142bcc14a4d2d1b17dfbaf66de))


### Features

* **icons:** add icon for marginnote link in preview mode ([e393b44](https://github.com/aidenlx/marginnote-companion/commit/e393b441362e4da2cbcbeb52772993595422e64e))

## [0.3.1](https://github.com/aidenlx/marginnote-companion/compare/0.3.0...0.3.1) (2021-09-04)


### Bug Fixes

* **input-handler:** fix version failed to compare when they are the same ([a2f9a5b](https://github.com/aidenlx/marginnote-companion/commit/a2f9a5b64524d525f2a21c2dc2467ee86d8934ed))

# [0.3.0](https://github.com/aidenlx/marginnote-companion/compare/0.2.0...0.3.0) (2021-09-04)


### Bug Fixes

* fix version ([9f68ea4](https://github.com/aidenlx/marginnote-companion/commit/9f68ea434d4cb5d5454fc10b3fd64beed6dff699))
* **setting-tab:** fix descriptions ([892fe5c](https://github.com/aidenlx/marginnote-companion/commit/892fe5c4211fe106baf5a3b8b5f0a1ba90dfa388))


### Features

* add i18n support ([58bf4b6](https://github.com/aidenlx/marginnote-companion/commit/58bf4b69f37d87fc441e88d11a6ad07a8089666a))
* add marginnote icons ([a5aa0e1](https://github.com/aidenlx/marginnote-companion/commit/a5aa0e195d355f98e95ab8a252eb27760ea6103c))
* **lang:** add TFunctionFull that reveals all possible key path ([0f01131](https://github.com/aidenlx/marginnote-companion/commit/0f011314eaec8eb03696472de6e597e1eeea0dea))
* options to select template in editor menu ([e1cb45a](https://github.com/aidenlx/marginnote-companion/commit/e1cb45a1d74f8031b0461b9c4be0c4b9b3364a97))
* paste to insert toc ([8dec186](https://github.com/aidenlx/marginnote-companion/commit/8dec186d1191ab3b4628a02cd1a7df06408e0c3a))
* **setting-tab:** add date-time format toggle ([80b1cbb](https://github.com/aidenlx/marginnote-companion/commit/80b1cbb495988728e5907f97b9a4e813dd23374e))
* **setting-tab:** basic setting interface for templates ([20fe87c](https://github.com/aidenlx/marginnote-companion/commit/20fe87c7c68913a665c3de64eb8ea871690293e8))
* **setting-tab:** update template config settings ([f13165c](https://github.com/aidenlx/marginnote-companion/commit/f13165cfa1f04153d249effcd3efa60229836181))
* **settings:** muiltple template configs ([219d43b](https://github.com/aidenlx/marginnote-companion/commit/219d43bc82762449745d9aa26340c9d755e60b43))
* support obsidian-bridge v3.0.0 ([c244553](https://github.com/aidenlx/marginnote-companion/commit/c2445533d7ee144e1b6f5c02591a4f0507127955))


### Reverts

* remove redundant defaultTpl from config ([b961add](https://github.com/aidenlx/marginnote-companion/commit/b961add659acc51f1cdf26d9419eec8475613d7f))

# [0.2.0](https://github.com/aidenlx/marginnote-companion/compare/0.1.0...0.2.0) (2021-08-30)


### Bug Fixes

* fix issues ([6f55c23](https://github.com/aidenlx/marginnote-companion/commit/6f55c236bb89fb120d0d4269f5fc70c11ec13047))
* fix turndown import ([e426e09](https://github.com/aidenlx/marginnote-companion/commit/e426e092a3b9b9f4fc2f9d74de5c52b7a2618735))
* minor fixes ([4126672](https://github.com/aidenlx/marginnote-companion/commit/4126672685d609eaa08abd1f8a0b5b7c0e9de6ae))


### Features

* add Comment and Excerpt class; add CmtBreak keyword ([c51bd47](https://github.com/aidenlx/marginnote-companion/commit/c51bd470eb345e2630cf03b6513ebe334bf356af))
* add support for Mustache template ([bee50cf](https://github.com/aidenlx/marginnote-companion/commit/bee50cfcfc0ecf11affe910b0d46a08d9110b9cf))
* meta now includes page rage of excerpt ([228a539](https://github.com/aidenlx/marginnote-companion/commit/228a5394fb425a811676982d332cef491750394f))

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

