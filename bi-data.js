/**
 * bi-data.js — BI System 数据生成引擎
 *
 * 基于种子的伪随机数据生成器，确保：
 * 1. 同一次页面加载数据一致（会话级种子）
 * 2. 刷新页面/点击刷新生成新数据
 * 3. 所有业务恒等式保持成立
 *    - KYC <= 注册
 *    - 开户 <= KYC
 *    - 首次入金 <= 开户
 *    - 交易 <= 开户
 *    - 净入金 = 入金 - 出金
 *    - Funding Total = Available + Frozen
 *    - Equity 与 Balance 接近
 */

(function (global) {
  'use strict';

  // ===== 基于种子的伪随机数生成器 (Mulberry32) =====
  function mulberry32(seed) {
    return function () {
      seed = seed + 0x6D2B79F5 | 0;
      var t = seed;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // 生成会话种子（基于当前时间戳，秒级精度）
  function genSeed() {
    return Math.floor(Date.now() / 1000);
  }

  // ===== 数字格式化工具 =====
  function formatNumber(n) {
    if (n >= 100000000) return (n / 100000000).toFixed(2) + '亿';
    if (n >= 10000) return (n / 10000).toFixed(1) + '万';
    return Math.round(n).toLocaleString('en-US');
  }

  function formatAmount(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function formatPercent(n) {
    return (n * 100).toFixed(1) + '%';
  }

  function formatDate(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function formatDateTime(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    var hh = String(date.getHours()).padStart(2, '0');
    var mm = String(date.getMinutes()).padStart(2, '0');
    var ss = String(date.getSeconds()).padStart(2, '0');
    return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss;
  }

  function formatShortDate(date) {
    return String(date.getMonth() + 1) + '/' + String(date.getDate());
  }

  // ===== 日期范围计算 =====
  function getDateRange(period, customStart, customEnd) {
    var end = new Date();
    end.setHours(23, 59, 59, 999);
    var start = new Date();

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        if (customStart) start = new Date(customStart + 'T00:00:00');
        if (customEnd) end = new Date(customEnd + 'T23:59:59');
        break;
      default:
        start.setHours(0, 0, 0, 0);
    }

    return { start: start, end: end };
  }

  function countDays(start, end) {
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }

  // ===== 生成日期数组 =====
  function generateDateArray(start, end) {
    var dates = [];
    var current = new Date(start);
    current.setHours(0, 0, 0, 0);
    var endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  // ===== 生成客户数据 =====
  function generateCustomerData(rand, days, filters) {
    // 基础注册数
    var baseDaily = 120 + Math.floor(rand() * 80); // 120-200/天
    var totalReg = Math.round(baseDaily * days * (0.9 + rand() * 0.2));

    // 注册方式分布
    var regMethodRatio = {
      phone: 0.55 + rand() * 0.1,
      email: 0.25 + rand() * 0.05,
      social: 0.1 + rand() * 0.05
    };
    // 归一化
    var ratioSum = regMethodRatio.phone + regMethodRatio.email + regMethodRatio.social;
    regMethodRatio.phone /= ratioSum;
    regMethodRatio.email /= ratioSum;
    regMethodRatio.social /= ratioSum;

    // 按注册方式筛选
    var regFilter = filters.regMethod || 'all';
    var regMultiplier = regFilter === 'all' ? 1 : regMethodRatio[regFilter] || 0;
    var effectiveReg = Math.round(totalReg * regMultiplier);

    // 漏斗比率（业务约束：KYC <= 注册，开户 <= KYC，首次入金 <= 开户，交易 <= 首次入金）
    var kycRate = 0.68 + rand() * 0.07;    // 68-75%
    var openAccRate = 0.55 + rand() * 0.08; // 55-63% of kyc
    var firstDepositRate = 0.38 + rand() * 0.07; // 38-45% of open
    // tradeRate 必须 < firstDepositRate (需要先入金才能交易)
    var tradeRate = firstDepositRate * (0.7 + rand() * 0.2); // firstDepositRate 的 70-90%

    // KYC等级分布
    var kycLv2Ratio = 0.7 + rand() * 0.05; // 70-75% of KYC
    var kycLv3Ratio = 0.25 + rand() * 0.05; // 25-30% of KYC

    var kycFilter = filters.kycLevel || 'all';
    var kycMultiplier = 1;
    if (kycFilter === 'lv2') kycMultiplier = kycLv2Ratio;
    if (kycFilter === 'lv3') kycMultiplier = kycLv3Ratio;

    // 入金通道分布
    var channelRatios = {
      bank: 0.35 + rand() * 0.05,
      card: 0.25 + rand() * 0.05,
      crypto: 0.2 + rand() * 0.05,
      local: 0.15 + rand() * 0.05
    };
    var chSum = channelRatios.bank + channelRatios.card + channelRatios.crypto + channelRatios.local;
    channelRatios.bank /= chSum;
    channelRatios.card /= chSum;
    channelRatios.crypto /= chSum;
    channelRatios.local /= chSum;

    var depositChannelFilter = filters.depositChannel || 'all';
    var depositChMultiplier = depositChannelFilter === 'all' ? 1 : channelRatios[depositChannelFilter] || 0;

    // 计算各项
    var totalKyc = Math.round(effectiveReg * kycRate * (kycFilter === 'all' ? 1 : kycMultiplier / kycLv2Ratio));
    // 约束：KYC <= 注册
    totalKyc = Math.min(totalKyc, effectiveReg);

    var totalOpenAcc = Math.round(effectiveReg * kycRate * openAccRate);
    // 约束：开户 <= KYC (totalKyc 可能已被筛选缩小，用非筛选版本)
    var fullKyc = Math.round(effectiveReg * kycRate);
    totalOpenAcc = Math.min(totalOpenAcc, fullKyc);

    var totalFirstDeposit = Math.round(totalOpenAcc * firstDepositRate * depositChMultiplier);
    // 约束：首次入金 <= 开户
    totalFirstDeposit = Math.min(totalFirstDeposit, totalOpenAcc);

    var totalTrading = Math.round(totalOpenAcc * tradeRate);
    // 约束：交易 <= 首次入金 <= 开户
    totalTrading = Math.min(totalTrading, totalFirstDeposit, totalOpenAcc);

    // 环比波动
    var prevFactor = 0.92 + rand() * 0.16; // 92%-108%

    return {
      registeredUsers: effectiveReg,
      kycUsers: totalKyc,
      kycLv2: Math.round(effectiveReg * kycRate * kycLv2Ratio),
      kycLv3: Math.round(effectiveReg * kycRate * kycLv3Ratio),
      openAccounts: totalOpenAcc,
      firstDepositUsers: totalFirstDeposit,
      tradingUsers: totalTrading,
      regMethodRatios: regMethodRatio,
      channelRatios: channelRatios,
      kycRate: kycRate,
      openAccRate: openAccRate,
      firstDepositRate: firstDepositRate,
      tradeRate: tradeRate,
      prevFactor: prevFactor,
      dailyReg: generateDailySeries(rand, days, baseDaily * regMultiplier)
    };
  }

  // ===== 生成出入金数据 =====
  function generateFundingData(rand, days, filters) {
    // 基础入金用户数
    var dailyDepositUsers = 85 + Math.floor(rand() * 45);
    var totalDepositUsers = Math.round(dailyDepositUsers * days * (0.95 + rand() * 0.1));

    // 按入金通道筛选
    var channelFilter = filters.depositChannel || 'all';
    var channelRatios = {
      bank: 0.32 + rand() * 0.05,
      card: 0.28 + rand() * 0.05,
      crypto: 0.22 + rand() * 0.05,
      local: 0.15 + rand() * 0.03
    };
    var chSum = channelRatios.bank + channelRatios.card + channelRatios.crypto + channelRatios.local;
    Object.keys(channelRatios).forEach(function (k) { channelRatios[k] /= chSum; });

    var chMultiplier = channelFilter === 'all' ? 1 : channelRatios[channelFilter] || 0;
    var effectiveDepositUsers = Math.round(totalDepositUsers * chMultiplier);

    // 币种分布
    var currencyFilter = filters.currency || 'all';
    var currencyRatios = {
      usd: 0.6 + rand() * 0.08,
      aed: 0.32 + rand() * 0.06,
      usdt: 0.05 + rand() * 0.03
    };
    var curSum = currencyRatios.usd + currencyRatios.aed + currencyRatios.usdt;
    currencyRatios.usd /= curSum;
    currencyRatios.aed /= curSum;
    currencyRatios.usdt /= curSum;

    var curMultiplier = currencyFilter === 'all' ? 1 : currencyRatios[currencyFilter] || 0;

    // 平均每笔入金（USD equivalent）
    var avgDeposit = 2500 + rand() * 1500;
    var depositPerUser = 2.5 + rand() * 1.5; // 人均笔数
    var totalDepositAmount = Math.round(effectiveDepositUsers * depositPerUser * avgDeposit * curMultiplier);

    // 出金数据（约束：出金 < 入金）
    var withdrawRatio = 0.55 + rand() * 0.1; // 55-65%
    var totalWithdrawAmount = Math.round(totalDepositAmount * withdrawRatio);

    // 出金通道分布（和入金类似但略不同）
    var wdChannelFilter = filters.withdrawChannel || 'all';
    var wdChannelRatios = {
      bank: 0.45 + rand() * 0.05,
      card: 0.18 + rand() * 0.04,
      crypto: 0.25 + rand() * 0.05,
      local: 0.1 + rand() * 0.03
    };
    var wdSum = wdChannelRatios.bank + wdChannelRatios.card + wdChannelRatios.crypto + wdChannelRatios.local;
    Object.keys(wdChannelRatios).forEach(function (k) { wdChannelRatios[k] /= wdSum; });

    var wdChMultiplier = wdChannelFilter === 'all' ? 1 : wdChannelRatios[wdChannelFilter] || 0;
    totalWithdrawAmount = Math.round(totalWithdrawAmount * wdChMultiplier);
    // 约束：出金 <= 入金
    totalWithdrawAmount = Math.min(totalWithdrawAmount, totalDepositAmount);

    // 出金用户数
    var withdrawUsers = Math.round(effectiveDepositUsers * 0.45 * wdChMultiplier);
    withdrawUsers = Math.min(withdrawUsers, effectiveDepositUsers);

    // 净入金
    var netDeposit = totalDepositAmount - totalWithdrawAmount;

    // 申请中出金
    var pendingWithdraw = Math.round(totalWithdrawAmount * 0.18 * (0.9 + rand() * 0.2));

    // 环比
    var prevFactor = 0.9 + rand() * 0.18;

    return {
      depositUsers: effectiveDepositUsers,
      depositAmount: totalDepositAmount,
      withdrawAmount: totalWithdrawAmount,
      withdrawUsers: withdrawUsers,
      netDeposit: netDeposit,
      pendingWithdraw: pendingWithdraw,
      channelRatios: channelRatios,
      wdChannelRatios: wdChannelRatios,
      currencyRatios: currencyRatios,
      avgDepositPerUser: Math.round(totalDepositAmount / Math.max(1, effectiveDepositUsers)),
      prevFactor: prevFactor,
      dailyDeposit: generateDailySeries(rand, days, dailyDepositUsers * depositPerUser * avgDeposit * chMultiplier * curMultiplier / days),
      dailyWithdraw: generateDailySeries(rand, days, dailyDepositUsers * depositPerUser * avgDeposit * withdrawRatio * chMultiplier * curMultiplier / days * 0.95)
    };
  }

  // ===== 生成交易数据 =====
  function generateTradingData(rand, days, filters) {
    var category = filters.category || 'all';
    var symbol = filters.symbol || 'all';

    // 品类分布
    var categoryRatios = {
      forex: 0.4 + rand() * 0.06,
      metals: 0.18 + rand() * 0.04,
      energy: 0.12 + rand() * 0.03,
      indices: 0.15 + rand() * 0.04,
      crypto: 0.12 + rand() * 0.03
    };
    var catSum = categoryRatios.forex + categoryRatios.metals + categoryRatios.energy + categoryRatios.indices + categoryRatios.crypto;
    Object.keys(categoryRatios).forEach(function (k) { categoryRatios[k] /= catSum; });

    // 品种映射
    var symbols = {
      forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'],
      metals: ['XAUUSD', 'XAGUSD', 'PLATINUM'],
      energy: ['USOIL', 'UKOIL', 'NATGAS'],
      indices: ['NAS100', 'US30', 'SPX500', 'UK100'],
      crypto: ['BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD']
    };

    var catMultiplier = category === 'all' ? 1 : categoryRatios[category] || 0;

    // 开仓订单数基础
    var dailyOrders = 1200 + Math.floor(rand() * 600);
    var totalOrders = Math.round(dailyOrders * days * catMultiplier * (0.95 + rand() * 0.1));

    // 交易账户数（去重）
    var accountCount = Math.round((800 + rand() * 400) * catMultiplier * Math.min(1, days / 10));
    accountCount = Math.max(50, accountCount);

    // 交易手数
    var lotsPerOrder = 0.5 + rand() * 1.2;
    var totalLots = Math.round(totalOrders * lotsPerOrder * 100) / 100;

    // 按品种的手数排名
    var symbolLots = {};
    var targetSymbols = category === 'all'
      ? ['EURUSD', 'XAUUSD', 'BTCUSD', 'NAS100', 'USOIL', 'GBPUSD', 'ETHUSD', 'US30']
      : symbols[category] || [];

    var remainingLots = totalLots;
    for (var i = 0; i < targetSymbols.length; i++) {
      var weight = 1 - (i / targetSymbols.length) * 0.6;
      var sLots = Math.round(remainingLots * weight * 0.35 * 100) / 100;
      if (i === targetSymbols.length - 1) sLots = Math.round(remainingLots * 100) / 100;
      symbolLots[targetSymbols[i]] = sLots;
      remainingLots -= sLots;
    }

    // 品种筛选
    if (symbol !== 'all' && symbolLots[symbol]) {
      var symRatio = symbolLots[symbol] / totalLots;
      totalOrders = Math.round(totalOrders * symRatio);
      totalLots = symbolLots[symbol];
    }

    // 环比
    var prevFactor = 0.92 + rand() * 0.16;

    return {
      openOrders: totalOrders,
      tradingAccounts: accountCount,
      totalLots: totalLots,
      avgLotPerOrder: Math.round(totalLots / Math.max(1, totalOrders) * 100) / 100,
      categoryRatios: categoryRatios,
      symbolLots: symbolLots,
      symbols: symbols,
      prevFactor: prevFactor,
      dailyOrders: generateDailySeries(rand, days, dailyOrders * catMultiplier),
      dailyLots: generateDailySeries(rand, days, dailyOrders * lotsPerOrder * catMultiplier)
    };
  }

  // ===== 生成每日数据序列 =====
  function generateDailySeries(rand, days, avgPerDay) {
    var series = [];
    var current = avgPerDay;
    for (var i = 0; i < days; i++) {
      // 带趋势的随机游走
      var trendFactor = 1 + (i / days) * 0.15; // 15% 增长趋势
      var variation = 0.8 + rand() * 0.4; // ±20% 波动
      current = avgPerDay * trendFactor * variation;
      // 添加一些周末效应
      if (days > 14 && i % 7 >= 5) current *= 0.75;
      series.push(Math.round(Math.max(0, current)));
    }
    return series;
  }

  // ===== 生成财务数据（EOD） =====
  function generateFinancialData(rand, days, filters) {
    var currencyFilter = filters.currency || 'all';
    var amountType = filters.amountType || 'all';

    var currencyRatios = {
      usd: 0.62 + rand() * 0.06,
      aed: 0.3 + rand() * 0.05,
      usdt: 0.06 + rand() * 0.02
    };
    var curSum = currencyRatios.usd + currencyRatios.aed + currencyRatios.usdt;
    currencyRatios.usd /= curSum;
    currencyRatios.aed /= curSum;
    currencyRatios.usdt /= curSum;

    var curMultiplier = currencyFilter === 'all' ? 1 : currencyRatios[currencyFilter] || 0;

    // 基础 Balance
    var baseBalance = 25000000 + rand() * 5000000; // 2500-3000万 USD
    baseBalance *= curMultiplier;

    // 每日 Balance 序列
    var dailyBalance = [];
    var dailyEquity = [];
    var dailyFundingTotal = [];
    var dailyFundingAvailable = [];
    var dailyFundingFrozen = [];

    var currentBalance = baseBalance;
    var currentFunding = baseBalance * 0.85;

    for (var i = 0; i < days; i++) {
      // Balance 日变化 ±1.5%
      var change = 1 + (rand() - 0.5) * 0.03;
      currentBalance *= change;
      currentBalance = Math.max(baseBalance * 0.8, Math.min(baseBalance * 1.2, currentBalance));
      dailyBalance.push(Math.round(currentBalance));

      // Equity ≈ Balance ±2%（浮动盈亏）
      var equitySpread = 1 + (rand() - 0.5) * 0.04;
      dailyEquity.push(Math.round(currentBalance * equitySpread));

      // Funding 余额
      var fundingChange = 1 + (rand() - 0.5) * 0.02;
      currentFunding *= fundingChange;
      currentFunding = Math.max(baseBalance * 0.7, Math.min(baseBalance * 1.0, currentFunding));

      // Available / Frozen 拆分
      var frozenRatio = 0.08 + rand() * 0.05; // 8-13% 冻结
      var frozen = Math.round(currentFunding * frozenRatio);
      var available = Math.round(currentFunding - frozen);
      var total = available + frozen;

      dailyFundingTotal.push(total);
      dailyFundingAvailable.push(available);
      dailyFundingFrozen.push(frozen);
    }

    var latest = {
      balance: dailyBalance[dailyBalance.length - 1],
      equity: dailyEquity[dailyEquity.length - 1],
      fundingTotal: dailyFundingTotal[dailyFundingTotal.length - 1],
      fundingAvailable: dailyFundingAvailable[dailyFundingAvailable.length - 1],
      fundingFrozen: dailyFundingFrozen[dailyFundingFrozen.length - 1]
    };

    return {
      dailyBalance: dailyBalance,
      dailyEquity: dailyEquity,
      dailyFundingTotal: dailyFundingTotal,
      dailyFundingAvailable: dailyFundingAvailable,
      dailyFundingFrozen: dailyFundingFrozen,
      latest: latest,
      currencyRatios: currencyRatios,
      prevFactor: 1 + (rand() - 0.5) * 0.02
    };
  }

  // ===== 生成地区排名数据 =====
  function generateRegionData(rand, totalReg) {
    var regions = [
      { name: '华东地区', code: 'east', weight: 0.28 },
      { name: '华南地区', code: 'south', weight: 0.22 },
      { name: '华北地区', code: 'north', weight: 0.16 },
      { name: '西南地区', code: 'southwest', weight: 0.12 },
      { name: '华中地区', code: 'central', weight: 0.10 },
      { name: '西北地区', code: 'northwest', weight: 0.06 },
      { name: '东北地区', code: 'northeast', weight: 0.06 }
    ];

    return regions.map(function (r) {
      var variation = 0.9 + rand() * 0.2;
      return {
        name: r.name,
        code: r.code,
        value: Math.round(totalReg * r.weight * variation)
      };
    }).sort(function (a, b) { return b.value - a.value; });
  }

  // ===== 生成最近异常数据 =====
  function generateAnomalies(rand, count) {
    var types = [
      { type: 'deposit_delay', level: 'warning', zh: '入金到账延迟', en: 'Deposit Delay' },
      { type: 'withdraw_failed', level: 'danger', zh: '出金失败', en: 'Withdraw Failed' },
      { type: 'kyc_reject', level: 'warning', zh: 'KYC审核异常', en: 'KYC Rejection' },
      { type: 'trade_spike', level: 'info', zh: '交易量突增', en: 'Volume Spike' },
      { type: 'account_lock', level: 'danger', zh: '账户异常锁定', en: 'Account Lock' },
      { type: 'price_abnormal', level: 'warning', zh: '报价异常', en: 'Price Abnormal' }
    ];

    var anomalies = [];
    for (var i = 0; i < count; i++) {
      var t = types[Math.floor(rand() * types.length)];
      var hoursAgo = Math.floor(rand() * 24);
      var minsAgo = Math.floor(rand() * 60);
      var time = new Date(Date.now() - hoursAgo * 3600000 - minsAgo * 60000);
      var affectedCount = Math.floor(rand() * 50) + 1;
      var id = 'ANM-' + String(1000 + i).padStart(4, '0');

      anomalies.push({
        id: id,
        type: t.type,
        level: t.level,
        zhLabel: t.zh,
        enLabel: t.en,
        time: time,
        affected: affectedCount,
        zhDesc: t.zh + '，涉及' + affectedCount + '个账户',
        enDesc: t.en + ', ' + affectedCount + ' accounts affected'
      });
    }
    return anomalies.sort(function (a, b) { return b.time - a.time; });
  }

  // ===== 公共 API =====
  var sessionSeed = genSeed();

  var BiData = {
    // 刷新会话种子
    refresh: function () {
      sessionSeed = genSeed();
      return sessionSeed;
    },
    getSeed: function () { return sessionSeed; },

    // 工具方法
    random: mulberry32,
    formatNumber: formatNumber,
    formatAmount: formatAmount,
    formatPercent: formatPercent,
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    formatShortDate: formatShortDate,
    getDateRange: getDateRange,
    countDays: countDays,
    generateDateArray: generateDateArray,

    // 数据生成
    generateCustomerData: generateCustomerData,
    generateFundingData: generateFundingData,
    generateTradingData: generateTradingData,
    generateFinancialData: generateFinancialData,
    generateRegionData: generateRegionData,
    generateAnomalies: generateAnomalies,

    // 获取完整数据快照
    getSnapshot: function (period, customStart, customEnd, filters) {
      var rand = mulberry32(sessionSeed + (period ? period.length : 0) + (filters ? JSON.stringify(filters).length : 0));
      var range = getDateRange(period, customStart, customEnd);
      var days = countDays(range.start, range.end);
      var dates = generateDateArray(range.start, range.end);

      // 用不同的偏移量生成各模块数据，避免完全相同
      var customer = generateCustomerData(mulberry32(sessionSeed + 1000), days, filters);
      var funding = generateFundingData(mulberry32(sessionSeed + 2000), days, filters);
      var trading = generateTradingData(mulberry32(sessionSeed + 3000), days, filters);
      var regions = generateRegionData(mulberry32(sessionSeed + 4000), customer.registeredUsers);
      var anomalies = generateAnomalies(mulberry32(sessionSeed + 5000), 8);
      var financial = generateFinancialData(mulberry32(sessionSeed + 6000), Math.min(days, 60), filters);

      return {
        seed: sessionSeed,
        timestamp: new Date(),
        period: period,
        days: days,
        dates: dates,
        range: range,
        customer: customer,
        funding: funding,
        trading: trading,
        regions: regions,
        anomalies: anomalies,
        financial: financial
      };
    }
  };

  global.BiData = BiData;

})(window);
