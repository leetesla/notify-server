const player = require('play-sound')();
let canPlay = true;

// 将硬编码的等待时间提取为常量
const PLAY_INTERVAL = 5000; // 5秒

async function conditionalLoopPlay(filePath) {
    let playCount = 0;

    // 无限循环，直到 canPlay 被设置为 false
    while (true) {
        // 只在播放前判断 canPlay 状态
        if (canPlay) {
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
        } else {
            console.log('canPlay 为 false，跳过播放');
        }

        // 固定间隔等待
        console.log(`等待${PLAY_INTERVAL/1000}秒后继续...`);
        await new Promise(resolve => setTimeout(resolve, PLAY_INTERVAL));
    }
}

// 使用示例
// (async () => {
//     await conditionalLoopPlay('reminder.wav');
// })();