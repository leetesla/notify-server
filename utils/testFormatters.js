const { formatMarketCapToString } = require('./formatters');

// 测试用例
console.log('Testing formatMarketCapToString function:');

// 测试小于1000的数值
console.log('500 ->', formatMarketCapToString(500)); // 应该输出: "500"
console.log('999 ->', formatMarketCapToString(999)); // 应该输出: "999"

// 测试大于等于1000且小于1000000的数值
console.log('1500 ->', formatMarketCapToString(1500)); // 应该输出: "1.5K"
console.log('500000 ->', formatMarketCapToString(500000)); // 应该输出: "500.0K"

// 测试大于等于1000000且小于1000000000的数值
console.log('1500000 ->', formatMarketCapToString(1500000)); // 应该输出: "1.5M"
console.log('500000000 ->', formatMarketCapToString(500000000)); // 应该输出: "500.0M"

// 测试大于等于1000000000的数值
console.log('1500000000 ->', formatMarketCapToString(1500000000)); // 应该输出: "1.5B"
console.log('50000000000 ->', formatMarketCapToString(50000000000)); // 应该输出: "50.0B"

// 测试边界情况
console.log('0 ->', formatMarketCapToString(0)); // 应该输出: "0"
console.log('1000 ->', formatMarketCapToString(1000)); // 应该输出: "1.0K"
console.log('1000000 ->', formatMarketCapToString(1000000)); // 应该输出: "1.0M"
console.log('1000000000 ->', formatMarketCapToString(1000000000)); // 应该输出: "1.0B"

// 测试null和undefined
console.log('null ->', `"${formatMarketCapToString(null)}"`); // 应该输出: ""
console.log('undefined ->', `"${formatMarketCapToString(undefined)}"`); // 应该输出: ""

// 测试一些特殊数值
console.log('NaN ->', `"${formatMarketCapToString(NaN)}"`); // 应该输出: "NaN" 或处理后的结果