/**
 * bi-charts.js — BI System SVG 图表渲染工具
 *
 * 纯原生 SVG 图表渲染，无依赖
 * 支持：折线图、多折线图、双轴折线图、环形图、横向条形图、堆叠面积图
 */

(function (global) {
  'use strict';

  // 颜色方案
  var COLORS = {
    primary: '#3B82F6',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    purple: '#8B5CF6',
    cyan: '#06B6D4',
    orange: '#F97316',
    pink: '#EC4899',
    gray: '#94A3B8'
  };

  var CHART_COLORS = [
    COLORS.primary,
    COLORS.success,
    COLORS.warning,
    COLORS.purple,
    COLORS.cyan,
    COLORS.orange,
    COLORS.pink,
    COLORS.danger
  ];

  // ===== 工具函数 =====
  function formatNum(n) {
    if (Math.abs(n) >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
    if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'K';
    return Math.round(n).toString();
  }

  function formatAmount(n) {
    if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (Math.abs(n) >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
    return '$' + Math.round(n);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ===== 单折线/面积图 =====
  function renderLineChart(container, options) {
    var data = options.data || [];
    var labels = options.labels || [];
    var color = options.color || COLORS.primary;
    var valueFormatter = options.valueFormatter || formatNum;
    var showArea = options.showArea !== false;
    var smooth = options.smooth !== false;
    var width, height;

    // 获取容器尺寸
    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    if (!container) return;

    // 清空容器
    container.innerHTML = '';

    var padding = { top: 20, right: 20, bottom: 30, left: 50 };
    width = container.clientWidth - padding.left - padding.right;
    height = container.clientHeight - padding.top - padding.bottom;

    if (width <= 0 || height <= 0 || data.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><div class="empty-state-text">暂无数据</div></div>';
      return;
    }

    // 计算 Y 轴范围
    var minVal = Math.min.apply(null, data);
    var maxVal = Math.max.apply(null, data);
    if (minVal === maxVal) {
      minVal = minVal * 0.9;
      maxVal = maxVal * 1.1;
    }
    var yRange = maxVal - minVal;
    minVal -= yRange * 0.1;
    maxVal += yRange * 0.1;
    yRange = maxVal - minVal;

    // X 轴点
    var xStep = width / Math.max(1, data.length - 1);

    // 生成路径
    var pathD = '';
    var areaD = '';
    var points = [];

    for (var i = 0; i < data.length; i++) {
      var x = padding.left + i * xStep;
      var y = padding.top + height - ((data[i] - minVal) / yRange) * height;
      points.push({ x: x, y: y, value: data[i], label: labels[i] || '' });
    }

    // 平滑曲线（贝塞尔）
    if (smooth && points.length > 2) {
      pathD = 'M' + points[0].x + ',' + points[0].y;
      for (var j = 1; j < points.length; j++) {
        var p0 = points[j - 1];
        var p1 = points[j];
        var cpx = (p0.x + p1.x) / 2;
        pathD += ' C' + cpx + ',' + p0.y + ' ' + cpx + ',' + p1.y + ' ' + p1.x + ',' + p1.y;
      }
      areaD = pathD + ' L' + points[points.length - 1].x + ',' + (padding.top + height) +
              ' L' + points[0].x + ',' + (padding.top + height) + ' Z';
    } else {
      pathD = points.map(function (p, i) {
        return (i === 0 ? 'M' : 'L') + p.x + ',' + p.y;
      }).join(' ');
      areaD = pathD + ' L' + points[points.length - 1].x + ',' + (padding.top + height) +
              ' L' + points[0].x + ',' + (padding.top + height) + ' Z';
    }

    // Y 轴刻度（5 个）
    var yTicks = [];
    var numTicks = 4;
    for (var k = 0; k <= numTicks; k++) {
      var val = minVal + (yRange * k / numTicks);
      var yPos = padding.top + height - (k / numTicks) * height;
      yTicks.push({ value: val, y: yPos });
    }

    // X 轴标签（最多显示 8 个）
    var xLabelCount = Math.min(8, labels.length);
    var xLabelStep = Math.max(1, Math.floor(labels.length / xLabelCount));

    var svg = '';
    svg += '<svg class="chart-svg" viewBox="0 0 ' + (width + padding.left + padding.right) + ' ' + (height + padding.top + padding.bottom) + '" preserveAspectRatio="none">';

    // 网格线
    svg += '<g class="chart-grid">';
    yTicks.forEach(function (tick) {
      svg += '<line x1="' + padding.left + '" y1="' + tick.y + '" x2="' + (padding.left + width) + '" y2="' + tick.y + '" />';
    });
    svg += '</g>';

    // Y 轴标签
    svg += '<g class="chart-axis y-axis">';
    yTicks.forEach(function (tick) {
      svg += '<text x="' + (padding.left - 8) + '" y="' + (tick.y + 4) + '" text-anchor="end">' + valueFormatter(tick.value) + '</text>';
    });
    svg += '</g>';

    // 面积
    if (showArea) {
      svg += '<path class="chart-area" d="' + areaD + '" fill="' + color + '" />';
    }

    // 折线
    svg += '<path class="chart-line" d="' + pathD + '" stroke="' + color + '" />';

    // 数据点（只显示部分）
    var dotStep = Math.max(1, Math.floor(points.length / 8));
    for (var m = 0; m < points.length; m += dotStep) {
      svg += '<circle class="chart-dot" cx="' + points[m].x + '" cy="' + points[m].y + '" r="3" stroke="' + color + '" />';
    }

    // X 轴标签
    svg += '<g class="chart-axis x-axis">';
    for (var n = 0; n < labels.length; n += xLabelStep) {
      var xLabelX = padding.left + n * xStep;
      svg += '<text x="' + xLabelX + '" y="' + (padding.top + height + 20) + '" text-anchor="middle">' + escapeHtml(labels[n]) + '</text>';
    }
    svg += '</g>';

    svg += '</svg>';
    container.innerHTML = svg;
  }

  // ===== 多折线图 =====
  function renderMultiLineChart(container, options) {
    var series = options.series || [];
    var labels = options.labels || [];
    var valueFormatter = options.valueFormatter || formatNum;

    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    if (!container) return;

    container.innerHTML = '';

    var padding = { top: 20, right: 20, bottom: 30, left: 50 };
    var width = container.clientWidth - padding.left - padding.right;
    var height = container.clientHeight - padding.top - padding.bottom;

    if (width <= 0 || height <= 0 || series.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><div class="empty-state-text">暂无数据</div></div>';
      return;
    }

    // 计算全局 Y 范围
    var allValues = [];
    series.forEach(function (s) { allValues = allValues.concat(s.data); });
    var minVal = Math.min.apply(null, allValues);
    var maxVal = Math.max.apply(null, allValues);
    if (minVal === maxVal) { minVal *= 0.9; maxVal *= 1.1; }
    var yRange = maxVal - minVal;
    minVal -= yRange * 0.1;
    maxVal += yRange * 0.1;
    yRange = maxVal - minVal;

    var xStep = width / Math.max(1, labels.length - 1);

    // Y 轴刻度
    var yTicks = [];
    for (var k = 0; k <= 4; k++) {
      var val = minVal + (yRange * k / 4);
      yTicks.push({ value: val, y: padding.top + height - (k / 4) * height });
    }

    var xLabelCount = Math.min(8, labels.length);
    var xLabelStep = Math.max(1, Math.floor(labels.length / xLabelCount));

    var svg = '';
    svg += '<svg class="chart-svg" viewBox="0 0 ' + (width + padding.left + padding.right) + ' ' + (height + padding.top + padding.bottom) + '" preserveAspectRatio="none">';

    // 网格
    svg += '<g class="chart-grid">';
    yTicks.forEach(function (tick) {
      svg += '<line x1="' + padding.left + '" y1="' + tick.y + '" x2="' + (padding.left + width) + '" y2="' + tick.y + '" />';
    });
    svg += '</g>';

    // Y 轴标签
    svg += '<g class="chart-axis y-axis">';
    yTicks.forEach(function (tick) {
      svg += '<text x="' + (padding.left - 8) + '" y="' + (tick.y + 4) + '" text-anchor="end">' + valueFormatter(tick.value) + '</text>';
    });
    svg += '</g>';

    // 绘制每条线
    series.forEach(function (s, si) {
      var color = s.color || CHART_COLORS[si % CHART_COLORS.length];
      var data = s.data;
      var points = [];

      for (var i = 0; i < data.length; i++) {
        var x = padding.left + i * xStep;
        var y = padding.top + height - ((data[i] - minVal) / yRange) * height;
        points.push({ x: x, y: y });
      }

      // 平滑路径
      var pathD = '';
      if (points.length > 2) {
        pathD = 'M' + points[0].x + ',' + points[0].y;
        for (var j = 1; j < points.length; j++) {
          var p0 = points[j - 1];
          var p1 = points[j];
          var cpx = (p0.x + p1.x) / 2;
          pathD += ' C' + cpx + ',' + p0.y + ' ' + cpx + ',' + p1.y + ' ' + p1.x + ',' + p1.y;
        }
      } else {
        pathD = points.map(function (p, i) {
          return (i === 0 ? 'M' : 'L') + p.x + ',' + p.y;
        }).join(' ');
      }

      svg += '<path class="chart-line" d="' + pathD + '" stroke="' + color + '" />';
    });

    // X 轴标签
    svg += '<g class="chart-axis x-axis">';
    for (var n = 0; n < labels.length; n += xLabelStep) {
      var xLabelX = padding.left + n * xStep;
      svg += '<text x="' + xLabelX + '" y="' + (padding.top + height + 20) + '" text-anchor="middle">' + escapeHtml(labels[n]) + '</text>';
    }
    svg += '</g>';

    svg += '</svg>';
    container.innerHTML = svg;
  }

  // ===== 双轴折线图 =====
  function renderDualAxisChart(container, options) {
    var leftSeries = options.leftSeries || {};
    var rightSeries = options.rightSeries || {};
    var labels = options.labels || [];
    var leftFormatter = options.leftFormatter || formatNum;
    var rightFormatter = options.rightFormatter || formatNum;

    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    if (!container) return;

    container.innerHTML = '';

    var padding = { top: 20, right: 50, bottom: 30, left: 50 };
    var width = container.clientWidth - padding.left - padding.right;
    var height = container.clientHeight - padding.top - padding.bottom;

    if (width <= 0 || height <= 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><div class="empty-state-text">暂无数据</div></div>';
      return;
    }

    var leftData = leftSeries.data || [];
    var rightData = rightSeries.data || [];
    var leftColor = leftSeries.color || COLORS.primary;
    var rightColor = rightSeries.color || COLORS.success;

    // 左轴
    var leftMin = Math.min.apply(null, leftData.length ? leftData : [0]);
    var leftMax = Math.max.apply(null, leftData.length ? leftData : [1]);
    if (leftMin === leftMax) { leftMin *= 0.9; leftMax *= 1.1; }
    var leftRange = leftMax - leftMin;
    leftMin -= leftRange * 0.1;
    leftMax += leftRange * 0.1;
    leftRange = leftMax - leftMin;

    // 右轴
    var rightMin = Math.min.apply(null, rightData.length ? rightData : [0]);
    var rightMax = Math.max.apply(null, rightData.length ? rightData : [1]);
    if (rightMin === rightMax) { rightMin *= 0.9; rightMax *= 1.1; }
    var rightRange = rightMax - rightMin;
    rightMin -= rightRange * 0.1;
    rightMax += rightRange * 0.1;
    rightRange = rightMax - rightMin;

    var xStep = width / Math.max(1, labels.length - 1);

    // 生成左轴路径
    function buildPath(data, min, range) {
      var points = [];
      for (var i = 0; i < data.length; i++) {
        var x = padding.left + i * xStep;
        var y = padding.top + height - ((data[i] - min) / range) * height;
        points.push({ x: x, y: y });
      }
      if (points.length <= 2) {
        return points.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p.x + ',' + p.y; }).join(' ');
      }
      var d = 'M' + points[0].x + ',' + points[0].y;
      for (var j = 1; j < points.length; j++) {
        var p0 = points[j - 1];
        var p1 = points[j];
        var cpx = (p0.x + p1.x) / 2;
        d += ' C' + cpx + ',' + p0.y + ' ' + cpx + ',' + p1.y + ' ' + p1.x + ',' + p1.y;
      }
      return d;
    }

    // Y 轴刻度
    var yTicks = [];
    for (var k = 0; k <= 4; k++) {
      yTicks.push({
        leftVal: leftMin + (leftRange * k / 4),
        rightVal: rightMin + (rightRange * k / 4),
        y: padding.top + height - (k / 4) * height
      });
    }

    var xLabelCount = Math.min(8, labels.length);
    var xLabelStep = Math.max(1, Math.floor(labels.length / xLabelCount));

    var svg = '';
    svg += '<svg class="chart-svg" viewBox="0 0 ' + (width + padding.left + padding.right) + ' ' + (height + padding.top + padding.bottom) + '" preserveAspectRatio="none">';

    // 网格
    svg += '<g class="chart-grid">';
    yTicks.forEach(function (tick) {
      svg += '<line x1="' + padding.left + '" y1="' + tick.y + '" x2="' + (padding.left + width) + '" y2="' + tick.y + '" />';
    });
    svg += '</g>';

    // 左 Y 轴
    svg += '<g class="chart-axis y-axis-left">';
    yTicks.forEach(function (tick) {
      svg += '<text x="' + (padding.left - 8) + '" y="' + (tick.y + 4) + '" text-anchor="end" fill="' + leftColor + '">' + leftFormatter(tick.leftVal) + '</text>';
    });
    svg += '</g>';

    // 右 Y 轴
    svg += '<g class="chart-axis y-axis-right">';
    yTicks.forEach(function (tick) {
      svg += '<text x="' + (padding.left + width + 8) + '" y="' + (tick.y + 4) + '" text-anchor="start" fill="' + rightColor + '">' + rightFormatter(tick.rightVal) + '</text>';
    });
    svg += '</g>';

    // 左轴线
    svg += '<path class="chart-line" d="' + buildPath(leftData, leftMin, leftRange) + '" stroke="' + leftColor + '" />';
    // 右轴线
    svg += '<path class="chart-line" d="' + buildPath(rightData, rightMin, rightRange) + '" stroke="' + rightColor + '" stroke-dasharray="4,3" />';

    // X 轴标签
    svg += '<g class="chart-axis x-axis">';
    for (var n = 0; n < labels.length; n += xLabelStep) {
      var xLabelX = padding.left + n * xStep;
      svg += '<text x="' + xLabelX + '" y="' + (padding.top + height + 20) + '" text-anchor="middle">' + escapeHtml(labels[n]) + '</text>';
    }
    svg += '</g>';

    svg += '</svg>';
    container.innerHTML = svg;
  }

  // ===== 环形图 =====
  function renderDonutChart(container, options) {
    var items = options.items || [];
    var centerLabel = options.centerLabel || '';
    var centerValue = options.centerValue || '';

    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    if (!container) return;

    container.innerHTML = '';

    var size = Math.min(container.clientWidth, container.clientHeight - 40);
    var cx = container.clientWidth / 2;
    var cy = size / 2 + 10;
    var outerR = Math.min(size / 2 - 10, 80);
    var innerR = outerR * 0.65;

    if (items.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-pie"></i><div class="empty-state-text">暂无数据</div></div>';
      return;
    }

    var total = items.reduce(function (sum, item) { return sum + (item.value || 0); }, 0);

    var svg = '';
    svg += '<svg class="chart-svg" style="height:' + (size + 20) + 'px" viewBox="0 0 ' + container.clientWidth + ' ' + (size + 20) + '">';

    var startAngle = -Math.PI / 2;
    items.forEach(function (item, i) {
      if (total === 0 || item.value <= 0) return;
      var ratio = item.value / total;
      var endAngle = startAngle + ratio * Math.PI * 2;

      var x1 = cx + outerR * Math.cos(startAngle);
      var y1 = cy + outerR * Math.sin(startAngle);
      var x2 = cx + outerR * Math.cos(endAngle);
      var y2 = cy + outerR * Math.sin(endAngle);
      var x3 = cx + innerR * Math.cos(endAngle);
      var y3 = cy + innerR * Math.sin(endAngle);
      var x4 = cx + innerR * Math.cos(startAngle);
      var y4 = cy + innerR * Math.sin(startAngle);

      var largeArc = ratio > 0.5 ? 1 : 0;

      var d = 'M' + x1 + ',' + y1 +
        ' A' + outerR + ',' + outerR + ' 0 ' + largeArc + ' 1 ' + x2 + ',' + y2 +
        ' L' + x3 + ',' + y3 +
        ' A' + innerR + ',' + innerR + ' 0 ' + largeArc + ' 0 ' + x4 + ',' + y4 +
        ' Z';

      svg += '<path d="' + d + '" fill="' + (item.color || CHART_COLORS[i % CHART_COLORS.length]) + '" />';
      startAngle = endAngle;
    });

    svg += '</svg>';

    // 中心文字
    var centerHtml = '<div class="donut-center" style="position:absolute;top:' + cy + 'px;left:50%;transform:translate(-50%,-50%);">';
    centerHtml += '<div class="donut-center-value">' + escapeHtml(centerValue || formatNum(total)) + '</div>';
    centerHtml += '<div class="donut-center-label">' + escapeHtml(centerLabel) + '</div>';
    centerHtml += '</div>';

    // 图例
    var legendHtml = '<div class="donut-legend">';
    items.forEach(function (item, i) {
      var ratio = total > 0 ? (item.value / total * 100).toFixed(1) : 0;
      legendHtml += '<div class="donut-legend-row">';
      legendHtml += '  <div class="donut-legend-left">';
      legendHtml += '    <span class="donut-legend-color" style="background:' + (item.color || CHART_COLORS[i % CHART_COLORS.length]) + '"></span>';
      legendHtml += '    <span>' + escapeHtml(item.label) + '</span>';
      legendHtml += '  </div>';
      legendHtml += '  <div class="donut-legend-value">' + formatNum(item.value) + ' <span style="color:#94A3B8;font-weight:400;">(' + ratio + '%)</span></div>';
      legendHtml += '</div>';
    });
    legendHtml += '</div>';

    container.innerHTML = svg + centerHtml + legendHtml;
  }

  // ===== 横向条形排行榜 =====
  function renderHorizontalBars(container, options) {
    var items = options.items || [];
    var color = options.color || COLORS.primary;
    var valueFormatter = options.valueFormatter || formatNum;
    var showRank = options.showRank !== false;

    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-list-ol"></i><div class="empty-state-text">暂无数据</div></div>';
      return;
    }

    var maxVal = Math.max.apply(null, items.map(function (i) { return i.value || 0; }));
    var colors = options.colors || null;

    var html = '<div class="hbar-list">';
    items.forEach(function (item, i) {
      var barColor = colors ? colors[i % colors.length] : color;
      var percent = maxVal > 0 ? (item.value / maxVal * 100) : 0;
      percent = Math.max(2, Math.min(100, percent));

      html += '<div class="hbar-item">';
      if (showRank) {
        html += '<div class="rank-num">' + (i + 1) + '</div>';
      }
      html += '  <div class="hbar-label">' + escapeHtml(item.label) + '</div>';
      html += '  <div class="hbar-track">';
      html += '    <div class="hbar-fill" style="width:' + percent + '%;background:' + barColor + ';"></div>';
      html += '  </div>';
      html += '  <div class="hbar-value">' + valueFormatter(item.value) + '</div>';
      html += '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
  }

  // ===== 漏斗图 =====
  function renderFunnelChart(container, options) {
    var items = options.items || [];
    var valueFormatter = options.valueFormatter || formatNum;

    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-filter"></i><div class="empty-state-text">暂无数据</div></div>';
      return;
    }

    var maxVal = items[0].value || 1;
    var colors = [COLORS.primary, '#22D3EE', COLORS.success, COLORS.warning, COLORS.orange];

    var html = '<div class="funnel-list">';
    items.forEach(function (item, i) {
      var percent = maxVal > 0 ? (item.value / maxVal * 100) : 0;
      percent = Math.max(15, Math.min(100, percent));
      var barColor = item.color || colors[i % colors.length];

      // 转化率（相对上一步）
      var rate = '';
      var rateCls = '';
      if (i > 0 && items[i - 1].value > 0) {
        var r = item.value / items[i - 1].value;
        rate = (r * 100).toFixed(1) + '%';
        rateCls = r >= 0.6 ? 'good' : (r >= 0.4 ? '' : 'bad');
      } else if (i === 0) {
        rate = '100%';
        rateCls = 'good';
      }

      html += '<div class="funnel-row">';
      html += '  <div class="funnel-label">' + escapeHtml(item.label) + '</div>';
      html += '  <div class="funnel-bar-wrap">';
      html += '    <div class="funnel-bar" style="width:' + percent + '%;background:' + barColor + ';">' + valueFormatter(item.value) + '</div>';
      html += '  </div>';
      html += '  <div class="funnel-rate ' + rateCls + '">' + rate + '</div>';
      html += '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
  }

  // ===== 堆叠面积图 =====
  function renderStackedAreaChart(container, options) {
    var series = options.series || [];
    var labels = options.labels || [];
    var valueFormatter = options.valueFormatter || formatNum;

    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    if (!container) return;

    container.innerHTML = '';

    var padding = { top: 20, right: 20, bottom: 30, left: 50 };
    var width = container.clientWidth - padding.left - padding.right;
    var height = container.clientHeight - padding.top - padding.bottom;

    if (width <= 0 || height <= 0 || series.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-area"></i><div class="empty-state-text">暂无数据</div></div>';
      return;
    }

    // 计算堆叠总和
    var totals = [];
    var stacked = []; // stacked[i][j] = 第 i 个数据点第 j 层的累计值
    for (var i = 0; i < labels.length; i++) {
      var sum = 0;
      var pointStack = [];
      for (var j = 0; j < series.length; j++) {
        sum += series[j].data[i] || 0;
        pointStack.push(sum);
      }
      totals.push(sum);
      stacked.push(pointStack);
    }

    var maxVal = Math.max.apply(null, totals);
    var minVal = 0;
    var yRange = maxVal - minVal;
    if (yRange === 0) yRange = 1;

    var xStep = width / Math.max(1, labels.length - 1);

    // Y 轴刻度
    var yTicks = [];
    for (var k = 0; k <= 4; k++) {
      var val = minVal + (yRange * k / 4);
      yTicks.push({ value: val, y: padding.top + height - (k / 4) * height });
    }

    var xLabelCount = Math.min(8, labels.length);
    var xLabelStep = Math.max(1, Math.floor(labels.length / xLabelCount));

    var svg = '';
    svg += '<svg class="chart-svg" viewBox="0 0 ' + (width + padding.left + padding.right) + ' ' + (height + padding.top + padding.bottom) + '" preserveAspectRatio="none">';

    // 网格
    svg += '<g class="chart-grid">';
    yTicks.forEach(function (tick) {
      svg += '<line x1="' + padding.left + '" y1="' + tick.y + '" x2="' + (padding.left + width) + '" y2="' + tick.y + '" />';
    });
    svg += '</g>';

    // Y 轴标签
    svg += '<g class="chart-axis y-axis">';
    yTicks.forEach(function (tick) {
      svg += '<text x="' + (padding.left - 8) + '" y="' + (tick.y + 4) + '" text-anchor="end">' + valueFormatter(tick.value) + '</text>';
    });
    svg += '</g>';

    // 从底部往上绘制堆叠区域（倒序）
    for (var s = series.length - 1; s >= 0; s--) {
      var color = series[s].color || CHART_COLORS[s % CHART_COLORS.length];
      var areaPath = '';
      var topPoints = [];
      var bottomPoints = [];

      for (var p = 0; p < labels.length; p++) {
        var x = padding.left + p * xStep;
        var topVal = stacked[p][s];
        var bottomVal = s > 0 ? stacked[p][s - 1] : 0;
        var topY = padding.top + height - ((topVal - minVal) / yRange) * height;
        var bottomY = padding.top + height - ((bottomVal - minVal) / yRange) * height;
        topPoints.push({ x: x, y: topY });
        bottomPoints.push({ x: x, y: bottomY });
      }

      // 构建平滑面积路径
      function buildSmoothPath(points) {
        if (points.length <= 2) {
          return points.map(function (pt, idx) { return (idx === 0 ? 'M' : 'L') + pt.x + ',' + pt.y; }).join(' ');
        }
        var d = 'M' + points[0].x + ',' + points[0].y;
        for (var idx = 1; idx < points.length; idx++) {
          var p0 = points[idx - 1];
          var p1 = points[idx];
          var cpx = (p0.x + p1.x) / 2;
          d += ' C' + cpx + ',' + p0.y + ' ' + cpx + ',' + p1.y + ' ' + p1.x + ',' + p1.y;
        }
        return d;
      }

      var topPath = buildSmoothPath(topPoints);
      var bottomPath = buildSmoothPath(bottomPoints.slice().reverse());
      areaPath = topPath + ' L' + bottomPoints[bottomPoints.length - 1].x + ',' + bottomPoints[bottomPoints.length - 1].y +
                 ' ' + bottomPath.replace('M', 'L') + ' Z';

      svg += '<path d="' + areaPath + '" fill="' + color + '" opacity="0.7" />';
    }

    // X 轴标签
    svg += '<g class="chart-axis x-axis">';
    for (var n = 0; n < labels.length; n += xLabelStep) {
      var xLabelX = padding.left + n * xStep;
      svg += '<text x="' + xLabelX + '" y="' + (padding.top + height + 20) + '" text-anchor="middle">' + escapeHtml(labels[n]) + '</text>';
    }
    svg += '</g>';

    svg += '</svg>';
    container.innerHTML = svg;
  }

  // ===== 暴露 API =====
  var BiCharts = {
    COLORS: COLORS,
    renderLineChart: renderLineChart,
    renderMultiLineChart: renderMultiLineChart,
    renderDualAxisChart: renderDualAxisChart,
    renderDonutChart: renderDonutChart,
    renderHorizontalBars: renderHorizontalBars,
    renderFunnelChart: renderFunnelChart,
    renderStackedAreaChart: renderStackedAreaChart,
    formatNum: formatNum,
    formatAmount: formatAmount
  };

  global.BiCharts = BiCharts;

})(window);
