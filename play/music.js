const player = require('play-sound')();
let canPlay = true;
async function conditionalLoopPlay(filePath, maxTime = 30000) {
    let startTime = Date.now();
    let playCount = 0;
    
    while (canPlay && (Date.now() - startTime) < maxTime) {
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

        // 检查是否继续播放的条件
        if (canPlay && (Date.now() - startTime) < maxTime) {
            const remainingTime = maxTime - (Date.now() - startTime);
            console.log(`剩余时间: ${remainingTime}ms`);

            // 动态间隔，最少1秒
            const waitTime = Math.max(1000, Math.min(3000, remainingTime / 5));
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    console.log(`播放结束，总共播放了 ${playCount} 次`);
}

// 使用示例
// (async () => {
//     await conditionalLoopPlay('reminder.wav', 15000); // 最多播放15秒
// })();