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
  imitation: { prompt: '可选：用一句话描述“一个指标上涨，另一个却下降”。', scaffold: 'Our ___ rose, but our ___ fell.', example: 'Our revenue rose, but our profit fell.' }
};
