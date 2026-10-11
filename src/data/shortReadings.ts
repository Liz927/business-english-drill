import type { ShortReading } from '../types';

export const starterReading: ShortReading = {
  id: 'starter-sales-margin', title: 'More sales, less profit?', topic: 'Money & finance',
  source: 'Business English · original supported reading', sourceKind: 'original',
  situation: '一家公司的销售额增加了，经理却发现赚到的钱变少了。先看看钱花到了哪里。',
  paragraphs: [
    'Our sales rose last month, but our profit fell. We offered larger discounts to attract customers. We also paid more for delivery.',
    'Before offering another discount, we need to check our profit margin: how much of each pound in sales remains as profit. Selling more does not always mean earning more. A smaller discount may help us keep customers without giving away too much profit.'
  ],
  hint: '这里的 sales 是销售额，profit 是扣除成本后留下的利润。折扣和配送成本都可能吃掉利润，所以销售额增加不一定代表赚得更多。原文在建议：再打折之前，先检查利润率。',
  words: [
    { term: 'profit', meaning: '利润：收入扣除成本后剩下的钱。', example: 'Our sales rose last month, but our profit fell.', focus: 'keep' },
    { term: 'discount', meaning: '折扣：以低于原价的价格销售。', example: 'Before offering another discount, we need to check our profit margin.', focus: 'keep' },
    { term: 'profit margin', meaning: '利润率：这里指每一英镑销售收入中，有多大比例留下成为利润。', example: 'We need to check our profit margin.', focus: 'keep' },
    { term: 'remains', meaning: '剩下、留下；这里理解为扣除成本后剩下即可。', example: 'How much of each pound in sales remains as profit.', focus: 'recognise' }
  ],
  imitation: { prompt: '可选：用一句话描述“一个指标上涨，另一个却下降”。', scaffold: 'Our ___ rose, but our ___ fell.', example: 'Our revenue rose, but our profit fell.' },
  quiz: { prompt: 'Why does the company want to check its profit margin before offering another discount?', answer:1,
    evidence:'Selling more does not always mean earning more.',
    options:[
      { text:'To find out why fewer customers are buying its products.', explanation:'文中说销售额上涨，并没有说购买产品的顾客减少了。' },
      { text:'To understand whether its sales are leaving enough profit.', explanation:'B 把原文“卖得更多不一定赚得更多”换了一种说法。检查利润率，是为了看销售收入中还能留下多少利润。' },
      { text:'To decide whether to stop offering delivery.', explanation:'配送成本上升是一个原因，但文章没有提出停止配送。' },
      { text:'To confirm that larger discounts always increase profit.', explanation:'always 过于绝对，而且与文中销售上升、利润下降的情况相反。' }
    ] }
};

export const shortReadings: ShortReading[] = [starterReading, {
  id:'short-supplier-trial', title:'A cheaper supplier?', topic:'Suppliers & service', source:'Business English · original supported reading', sourceKind:'original',
  situation:'一家家具公司正在考虑换配送服务商。读的时候留意：经理准备怎么做决定？',
  paragraphs:[
    'A small furniture company is considering changing its delivery provider. The new provider charges 15% less per delivery, which could reduce monthly costs. However, it only collects orders twice a week, while the current provider collects them every day.',
    'The sales manager is concerned that customers may have to wait longer. Rather than moving all deliveries immediately, she suggests using the new provider for customers who do not need urgent delivery. After a month, the company will compare costs, delivery times and customer feedback before deciding whether to expand the arrangement.'
  ],
  hint:'新服务商价格更低，但取货频率也更低。经理建议先试一部分不急的订单，再比较成本、配送时间和客户反馈。她没有说一定全面更换，也没有说要用这个办法向原服务商压价。',
  words:[
    {term:'provider',meaning:'服务商；这里是提供配送服务的公司。',example:'The new provider charges 15% less per delivery.',focus:'keep'},
    {term:'urgent',meaning:'紧急的，需要尽快处理的。',example:'Customers who do not need urgent delivery.',focus:'keep'},
    {term:'customer feedback',meaning:'客户反馈，用来了解客户实际体验。',example:'The company will compare costs, delivery times and customer feedback.',focus:'keep'},
    {term:'persuade someone to do something',meaning:'说服某人做某事。persuade 通过劝说让对方愿意；force 才是强迫。这个词也出现在下方题目的选项里。',example:'We persuaded the supplier to lower its prices.',focus:'keep'}
  ],
  imitation:{prompt:'可选：建议先小范围尝试，再决定是否扩大。',scaffold:'Before ___, we could try ___.',example:'Before changing providers, we could try the new service with a few orders.'},
  quiz:{prompt:'Why does the sales manager suggest using the new provider for only some customers at first?',answer:0,evidence:'After a month, the company will compare costs, delivery times and customer feedback before deciding whether to expand the arrangement.',options:[
    {text:'To check whether lower delivery costs come with acceptable service.',explanation:'A 概括了比较成本、配送时间和客户反馈的目的：看价格下降后，服务是否仍然可以接受。'},
    {text:'To find out whether the new provider can collect orders every day.',explanation:'文中已经说明新服务商每周取货两次；试用并不是为了确认它能否每天取货。'},
    {text:'To give urgent orders priority with the new provider.',explanation:'经理建议交给新服务商的是不急的订单，选项把意思反过来了。'},
    {text:'To persuade the current provider to reduce its prices.',explanation:'persuade 是说服，不是强迫。D 说的是劝现有服务商降价，但原文没有提到这个目的。现实中可能发生，不能因此当作文章依据。'}
  ]}
}, {
  id:'short-training-time',title:'Training that fits the working day',topic:'People & training',source:'Business English · original supported reading',sourceKind:'original',
  situation:'公司买了培训课程，但员工很少参加。人事经理调查了原因，准备调整安排。',
  paragraphs:[
    'A company offered its staff a weekly online training session, but attendance remained low. The HR manager initially thought the topics were not useful. However, a staff survey showed that most employees wanted the training. The problem was timing: sessions took place during their busiest hour.',
    'The company decided to offer the same session at two different times and provide a recording afterwards. Managers also agreed to protect a short period for learning each week. The HR team will review attendance after six weeks before considering any changes to the topics.'
  ],
  hint:'人事经理最初以为内容没用，但调查发现员工其实想学，主要问题是时间冲突。所以公司先调整参加方式与学习时间，再观察是否需要改内容。注意 initially 与 however 带来的转折。',
  words:[
    {term:'attendance',meaning:'出席、参加情况；这里指有多少员工来参加培训。',example:'Attendance remained low.',focus:'keep'},
    {term:'a staff survey',meaning:'员工调查，用来了解员工的意见或情况。',example:'A staff survey showed that most employees wanted the training.',focus:'keep'},
    {term:'initially',meaning:'最初、一开始；后面可能出现新的发现或变化。',example:'The HR manager initially thought the topics were not useful.',focus:'recognise'}
  ],
  imitation:{prompt:'可选：说说最初的判断与后来的发现。',scaffold:'Initially, we thought ___. However, we found ___.',example:'Initially, we thought the course was too difficult. However, we found that the timing was the problem.'},
  quiz:{prompt:'What did the staff survey suggest was the main reason for low attendance?',answer:2,evidence:'The problem was timing: sessions took place during their busiest hour.',options:[
    {text:'Employees did not consider the topics useful.',explanation:'这是经理最初的猜测，随后调查结果改变了这个判断。'},
    {text:'Employees preferred a course with more difficult content.',explanation:'原文没有讨论课程难度。'},
    {text:'The sessions conflicted with employees’ work demands.',explanation:'C 用 conflicted with work demands 概括了培训安排在员工最忙的时段，与工作冲突。'},
    {text:'Managers had decided to cancel the training.',explanation:'经理同意留出学习时间，并没有取消培训。'}
  ]}
}, {
  id:'short-customer-research',title:'An idea customers would pay for?',topic:'Marketing & research',source:'Business English · original supported reading',sourceKind:'original',
  situation:'一家软件公司收到很多新增功能的建议。产品经理要判断这些建议是否值得投入。',
  paragraphs:[
    'Several customers asked a software company to add a reporting tool. The sales team believed the feature would attract more buyers and suggested building it immediately. Development would take three months and delay improvements already promised to existing customers.',
    'The product manager asked the team to interview a small group of customers first. She wanted to understand which reporting tasks caused problems and whether customers would pay extra for a solution. She explained that requests showed interest, but did not yet provide enough evidence to justify the investment.'
  ],
  hint:'“有人提出需求”不等于“值得立即花三个月开发”。经理想先弄清实际问题，以及客户是否愿意付费。注意 interest 与 evidence 的区别。',
  words:[
    {term:'feature',meaning:'产品功能；这里指软件的新报表功能。',example:'The sales team believed the feature would attract more buyers.',focus:'keep'},
    {term:'pay extra',meaning:'额外付费。',example:'Whether customers would pay extra for a solution.',focus:'keep'},
    {term:'justify the investment',meaning:'说明这项投入有充分理由、值得做。',example:'Requests did not yet provide enough evidence to justify the investment.',focus:'keep'}
  ],
  imitation:{prompt:'可选：在做决定前，提出需要了解的信息。',scaffold:'Before investing in ___, we need to understand ___.',example:'Before investing in the tool, we need to understand whether customers would pay for it.'},
  quiz:{prompt:'Why does the product manager want customer interviews before development begins?',answer:3,evidence:'She wanted to understand which reporting tasks caused problems and whether customers would pay extra for a solution.',options:[
    {text:'To confirm that the reporting tool has already increased sales.',explanation:'工具尚未开发，文章没有报告任何销售增长。'},
    {text:'To persuade customers to accept a three-month delay.',explanation:'三个月是预计开发时间；访谈的目的不是说服客户接受延期。'},
    {text:'To show that existing customers do not need improvements.',explanation:'原文说已有承诺的改进会被推迟，没有说客户不需要它们。'},
    {text:'To assess the business value behind the requests.',explanation:'D 概括了两项调查内容：实际痛点和付费意愿。经理需要判断需求背后的商业价值，才决定是否投入。'}
  ]}
}];
