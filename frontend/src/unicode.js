/**
 * Unicode 字符（码点）与 UTF-16 码元坐标互转。
 *
 * 后端 API 与数据库一律以 Unicode 字符下标表示区间（与 Python 的
 * len() / 切片一致）；而浏览器的 DOM 选区、String.prototype.slice、
 * String.length 都按 UTF-16 码元计数。正文出现 emoji 等补充平面字符
 * （UTF-16 代理对，占 2 个码元）时两种坐标会错位：拖选区间会偏移、
 * 高亮可能切开代理对。本模块在边界处统一转换，保证：
 *   - 提交给后端的区间始终是字符下标；
 *   - 渲染 / 切片时先把字符下标换算成码元下标；
 *   - 任何边界都不会落在代理对中间（不拆分补充平面字符）。
 */

/** 字符串的 Unicode 字符数（码点数），与后端 len(content) 一致。 */
export function charLength(text) {
  let n = 0
  for (const _ of text) n += 1 // for..of 按码点迭代，代理对算 1 个字符
  return n
}

/**
 * 建立「字符下标 → UTF-16 码元下标」映射表（长度为 charLength(text) + 1），
 * 供把后端区间换算成 DOM / slice 使用的码元下标。
 */
export function buildUtf16Map(text) {
  const map = [0]
  for (const ch of text) map.push(map[map.length - 1] + ch.length)
  return map
}

/** 按字符下标切片，等价于后端的 content[start:end]，不拆分代理对。 */
export function sliceByChars(text, start, end) {
  return [...text].slice(start, end).join('')
}

/** 展示用截断：按字符数截断并追加省略号，不拆分代理对。 */
export function truncateByChars(text, max) {
  const chars = [...text]
  return chars.length > max ? `${chars.slice(0, max).join('')}…` : text
}
