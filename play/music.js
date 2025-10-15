const player = require('play-sound')();
const fs = require('fs').promises;
let canPlay = true;
let isPlaying = false;

// 将硬编码的等待时间提取为常量
const PLAY_INTERVAL = 5000; // 5秒

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
    while (canPlay) {
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