(function (global) {
  'use strict';
  var copy = {
    zh: {
      title:'基础数据', desc:'实时业务数据总览 · 点击任一数据视图查看详情',
      updated:'数据更新时间', period:'统计时间范围', today:'今日', yesterday:'昨日', d7:'近7日', d30:'近30日',
      refresh:'刷新数据', reset:'重置', detail:'查看详情', people:'人', accounts:'账户', lots:'手',
      user:'用户数据', userDesc:'注册、KYC、开户、首次入金和交易客户转化',
      funding:'出入金数据', fundingDesc:'入金、出金、净入金和处理中出金',
      trading:'交易数据', tradingDesc:'开仓订单、交易账户和开仓交易手数',
      finance:'财务数据', financeDesc:'Balance、Equity 和 Funding Balance 日终快照',
      registered:'注册用户', kyc:'KYC用户', firstDeposit:'首次入金用户', tradingUsers:'交易用户',
      deposit:'入金金额', withdrawal:'出金金额', net:'净入金', pending:'处理中出金',
      orders:'开仓订单', tradingAccounts:'开仓账户', openLots:'开仓手数',
      balance:'Balance', equity:'Equity', fundingBalance:'Funding Balance', eod:'最新 EOD',
      range:'当前范围'
    },
    en: {
      title:'Base Data', desc:'Real-time business overview · Click any data view for details',
      updated:'Updated at', period:'Time range', today:'Today', yesterday:'Yesterday', d7:'Last 7 days', d30:'Last 30 days',
      refresh:'Refresh', reset:'Reset', detail:'View details', people:'users', accounts:'accounts', lots:'lots',
      user:'User Data', userDesc:'Registration, KYC, account opening, first deposit and trading conversion',
      funding:'Deposit & Withdrawal', fundingDesc:'Deposits, withdrawals, net deposits and processing withdrawals',
      trading:'Trading Data', tradingDesc:'Open orders, trading accounts and open lots',
      finance:'Financial Data', financeDesc:'Balance, Equity and Funding Balance EOD snapshots',
      registered:'Registered', kyc:'KYC users', firstDeposit:'First deposit', tradingUsers:'Trading users',
      deposit:'Deposit amount', withdrawal:'Withdrawal amount', net:'Net deposit', pending:'Processing withdrawal',
      orders:'Open orders', tradingAccounts:'Trading accounts', openLots:'Open lots',
      balance:'Balance', equity:'Equity', fundingBalance:'Funding Balance', eod:'Latest EOD',
      range:'Current range'
    }
  };
  var state={period:'7d'};
  function amount(v){return '$'+Math.round(v).toLocaleString('en-US');}
  function metric(label,value){return '<div class="overview-metric"><span>'+label+'</span><strong>'+value+'</strong></div>';}
  function card(icon,color,title,desc,metrics,href){
    return '<article class="data-view-card"><div class="data-view-card-head"><span class="data-view-icon '+color+'"><i class="fas '+icon+'"></i></span><div><h2>'+title+'</h2><p>'+desc+'</p></div></div><div class="overview-metrics">'+metrics+'</div><a class="data-view-link" href="'+href+'">'+copy[currentLang].detail+' <i class="fas fa-arrow-right"></i></a></article>';
  }
  var currentLang='zh';
  function render(){
    var t=copy[currentLang], s=BiData.getSnapshot(state.period,'','',{});
    var c=s.customer,f=s.funding,tr=s.trading,fi=s.financial.latest;
    var html='<div class="base-overview">';
    html+='<div class="overview-hero"><div><h1>'+t.title+'</h1><p>'+t.desc+'</p></div><div class="live-stamp"><i class="fas fa-circle"></i> '+t.updated+' '+BiData.formatDateTime(s.timestamp)+'</div></div>';
    html+='<section class="overview-filter"><div><label>'+t.period+'</label><div class="date-tabs">';
    [['today',t.today],['yesterday',t.yesterday],['7d',t.d7],['30d',t.d30]].forEach(function(x){html+='<button class="date-tab '+(state.period===x[0]?'active':'')+'" data-period="'+x[0]+'">'+x[1]+'</button>';});
    html+='</div></div><div class="filter-actions"><button class="btn-secondary" id="overview-reset"><i class="fas fa-rotate-left"></i> '+t.reset+'</button><button class="btn-primary" id="overview-refresh"><i class="fas fa-arrows-rotate"></i> '+t.refresh+'</button></div><div class="filter-summary">'+t.range+': '+BiData.formatDate(s.range.start)+' — '+BiData.formatDate(s.range.end)+'</div></section>';
    html+='<div class="data-view-grid">';
    html+=card('fa-users','blue',t.user,t.userDesc,metric(t.registered,BiData.formatNumber(c.registeredUsers))+metric(t.kyc,BiData.formatNumber(c.kycUsers))+metric(t.firstDeposit,BiData.formatNumber(c.firstDepositUsers))+metric(t.tradingUsers,BiData.formatNumber(c.tradingUsers)),currentLang==='zh'?'用户数据.html':'customer-data.html');
    html+=card('fa-money-bill-transfer','green',t.funding,t.fundingDesc,metric(t.deposit,amount(f.depositAmount))+metric(t.withdrawal,amount(f.withdrawAmount))+metric(t.net,amount(f.netDeposit))+metric(t.pending,amount(f.pendingWithdraw)),currentLang==='zh'?'出入金数据.html':'funding-data.html');
    html+=card('fa-chart-candlestick','purple',t.trading,t.tradingDesc,metric(t.orders,BiData.formatNumber(tr.openOrders))+metric(t.tradingAccounts,BiData.formatNumber(tr.tradingAccounts))+metric(t.openLots,tr.totalLots.toLocaleString('en-US')+' '+t.lots),currentLang==='zh'?'交易数据.html':'trading-data.html');
    html+=card('fa-coins','orange',t.finance,t.financeDesc,metric(t.balance,amount(fi.balance))+metric(t.equity,amount(fi.equity))+metric(t.fundingBalance,amount(fi.fundingTotal))+metric(t.eod,'23:59:59'),currentLang==='zh'?'财务数据.html':'financial-data.html');
    html+='</div></div>';
    document.getElementById('page-content').innerHTML=html;
    document.querySelectorAll('[data-period]').forEach(function(el){el.onclick=function(){state.period=this.dataset.period;render();};});
    document.getElementById('overview-refresh').onclick=function(){BiData.refresh();render();};
    document.getElementById('overview-reset').onclick=function(){state.period='7d';render();};
  }
  global.BaseOverview={init:function(lang){currentLang=lang;render();}};
})(window);
