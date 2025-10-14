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

module.exports = {
  formatMarketCap,
  toInteger
};