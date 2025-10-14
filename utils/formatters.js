/**
 * 格式化市值数据
 * @param {string|number} value - 市值值，可能包含$, K, M, B等符号
 * @returns {number} 格式化后的数值
 */
function formatMarketCap(value) {
  if (!value && value !== 0) return value;
  
  // 转换为字符串处理
  let formattedValue = String(value);
  
  // 去掉开头的 $
  if (formattedValue.startsWith('$')) {
    formattedValue = formattedValue.substring(1);
  }
  
  // 去掉逗号
  formattedValue = formattedValue.replace(/,/g, '');
  
  // 检查结尾单位并转换
  if (formattedValue.endsWith('K')) {
    return parseFloat(formattedValue.substring(0, formattedValue.length - 1)) * 1000;
  } else if (formattedValue.endsWith('M')) {
    return parseFloat(formattedValue.substring(0, formattedValue.length - 1)) * 1000000;
  } else if (formattedValue.endsWith('B')) {
    return parseFloat(formattedValue.substring(0, formattedValue.length - 1)) * 1000000000;
  }
  
  // 如果没有单位，直接转换为数字
  return parseFloat(formattedValue);
}

/**
 * 将值转换为整数
 * @param {*} value - 要转换的值
 * @returns {number} 整数值
 */
function toInteger(value) {
  if (!value && value !== 0) return value;
  return parseInt(value, 10);
}

/**
 * 格式化倍数数据 (<1x, Nx)
 * @param {string} value - 原始值
 * @returns {number} 转换后的数值
 */
function formatMultiplier(value) {
  if (!value && value !== 0) return value;
  
  // 转换为字符串处理
  let formattedValue = String(value);
  
  // 处理 <1x 类型，转换为小数 (例如 <1x 转换为 0.1)
  if (formattedValue.startsWith('<')) {
    const numberPart = formattedValue.substring(1, formattedValue.length - 1);
    // 对于 <nx 这种情况，我们将其视为 n/10
    // 例如 <1x 转换为 0.1, <2.5x 转换为 0.25
    return (parseFloat(numberPart) / 10) || 0.1;
  }
  
  // 处理 Nx 类型，去掉 x 转换为数字（整数或小数）
  if (formattedValue.endsWith('x')) {
    return parseFloat(formattedValue.substring(0, formattedValue.length - 1)) || 0;
  }
  
  // 如果不符合任何模式，尝试直接转换为数字
  return parseFloat(formattedValue) || 0;
}

/**
 * 格式化百分比数据
 * @param {string} value - 带%号的值
 * @returns {number} 转换后的小数
 */
function formatPercentage(value) {
  if (!value && value !== 0) return value;
  
  // 转换为字符串处理
  let formattedValue = String(value);
  
  // 去掉 % 号并转换为小数
  if (formattedValue.endsWith('%')) {
    return parseFloat(formattedValue.substring(0, formattedValue.length - 1)) / 100 || 0;
  }
  
  // 如果没有 % 号，直接转换为数字
  return parseFloat(formattedValue) || 0;
}

module.exports = {
  formatMarketCap,
  toInteger,
  formatMultiplier,
  formatPercentage
};