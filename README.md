# npm 发包demo

### 操作流程为
1. 修改本地代码
2. git提交修改 
   - feat：新功能（feature）
   - fix：修补bug
   - docs：文档（documentation）
   - style：格式（不影响代码运行的变动）
   - refactor：重构（即不是新增功能，也不是修改bug的代码变动）
   - test：增加测试
   - chore：构建过程或辅助工具的变动
3. `npm run x/y/z`  
   1. 改变package.json中的版本号
   2. 使用conventional-changelog工具将git提交记录记录到CHANGELOG.md
   3. 提交package.json和CHANGELOG.md文件
   4. git打标签tag，push代码
4. `npm run publish`