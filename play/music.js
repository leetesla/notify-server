const player = require('play-sound')();
const fs = require('fs').promises;
const redisClient = require('../config/redis');
const config = require('../config');
let canPlay = false;
let isPlaying = false;

// 将硬编码的等待时间提取为常量
const PLAY_INTERVAL = 5000; // 5秒

// 检查Redis中ALERT_LIVE键的值来设置canPlay状态
async function updateCanPlayStatus() {
    try {
        // 先检查键的类型
        const keyType = await redisClient.type(config.REDIS_KEYS.ALERT_LIVE);
        
        let alertLiveValue;
        if (keyType === 'list') {
            // 如果是list类型，获取列表长度
            const listLength = await redisClient.llen(config.REDIS_KEYS.ALERT_LIVE);
            alertLiveValue = listLength > 0 ? 'non-empty' : null;
        } else if (keyType === 'string') {
            // 如果是string类型，直接获取值
            alertLiveValue = await redisClient.get(config.REDIS_KEYS.ALERT_LIVE);
        } else if (keyType === 'set') {
            // 如果是set类型，获取集合大小
            const setSize = await redisClient.scard(config.REDIS_KEYS.ALERT_LIVE);
            alertLiveValue = setSize > 0 ? 'non-empty' : null;
        } else if (keyType === 'hash') {
            // 如果是hash类型，获取哈希大小
            const hashSize = await redisClient.hlen(config.REDIS_KEYS.ALERT_LIVE);
            alertLiveValue = hashSize > 0 ? 'non-empty' : null;
        } else {
            // 其他类型默认设为null
            alertLiveValue = null;
        }
        
        canPlay = alertLiveValue !== null && alertLiveValue !== '';
        console.log(`根据Redis键 ${config.REDIS_KEYS.ALERT_LIVE} (类型: ${keyType}) 的值更新 canPlay 状态: ${canPlay}`);
    } catch (error) {
        console.error('检查Redis键值时出错:', error.message);
        // 出错时默认设置为false，避免意外播放
        canPlay = false;
    }
}

// 添加设置 canPlay 状态的函数
function setCanPlay(value) {
    canPlay = value;
}

// 检查文件是否存在的辅助函数
async function checkFileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (err) {
        return false;
    }
}

async function conditionalLoopPlay(filePath) {
    let playCount = 0;

    // 无限循环，直到收到退出信号
    while (true) {
        // 检查Redis中ALERT_LIVE键的值来更新canPlay状态
        await updateCanPlayStatus();
        
        // 只在播放前判断 canPlay 状态
        if (canPlay) {
            isPlaying = true;
            playCount++;
            console.log(`第 ${playCount} 次播放`);

            // 播放音频
            await new Promise(resolve => {
                player.play(filePath, (err) => {
                    if (err) {
                        console.error('播放错误:', err);
                        canPlay = false;
                    }
                    resolve();
                });
            });
            isPlaying = false;
        } else {
            console.log('canPlay 为 false，跳过播放');
        }

        // 固定间隔等待
        console.log(`等待${PLAY_INTERVAL/1000}秒后继续...`);
        await new Promise(resolve => setTimeout(resolve, PLAY_INTERVAL));
    }
    
    console.log(`播放结束，总共尝试了 ${playCount} 次播放`);
}

// 监听退出信号，立即退出
process.on('SIGINT', () => {
    console.log('收到 SIGINT 信号，立即退出...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，立即退出...');
    process.exit(0);
});

// 添加 main 函数，只在直接运行脚本时执行
async function main() {
    // 检查是否提供了音频文件路径参数
    const filePath = 'assets/audio/alert.mp3';
    // if (!filePath) {
    //     console.error('请提供音频文件路径作为参数');
    //     process.exit(1);
    // }
    
    // 检查文件是否存在
    const fileExists = await checkFileExists(filePath);
    if (!fileExists) {
        console.error(`音频文件不存在: ${filePath}`);
        process.exit(1);
    }
    
    console.log(`开始播放音频文件: ${filePath}`);
    await conditionalLoopPlay(filePath);
}

// 只在直接运行此脚本时执行 main 函数
if (require.main === module) {
    main().catch(err => {
        console.error('程序执行出错:', err);
        process.exit(1);
    });
}

// 导出函数供其他模块使用
module.exports = { conditionalLoopPlay, setCanPlay, canPlay };