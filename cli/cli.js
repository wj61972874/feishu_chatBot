#! /usr/bin/env node

const chalk = require('chalk');
const program = require('commander');
const figlet = require('figlet');
const ConfigHelper = require('./config_helper')

console.log(chalk.green('~ Welcome to Use Web Config CLI ~'));

program
    .command('config')
    .description('config web app info and api path')
    .action(() => {
        const helper = new ConfigHelper();
        helper.handle()
    })

program
    .on('--help', () => {
        // 使用 figlet 绘制 Logo
        console.log('\r\n' + figlet.textSync('webcli', {
            font: 'Ghost',
            horizontalLayout: 'default',
            verticalLayout: 'default',
            width: 80,
            whitespaceBreak: true
        }));
        // 新增说明信息
        console.log(`\r\nGo to ${chalk.cyan(`https://open.feishu.cn`)} show more info\r\n`)
    })

// 解析用户执行命令传入参数
program.parse(process.argv);

