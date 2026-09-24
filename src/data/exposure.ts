import type { ExposurePack } from '../types';
// Original learning material, not official exam material or company correspondence.
export const timelinePack: ExposurePack = {
  id: 'challenge-timeline-1', title: 'Make room for a realistic timeline.',
  intent: 'Challenge a proposed date while keeping the conversation collaborative.',
  phrases: [
    { phrase: "I'm concerned that the proposed timeline may not be achievable.", category: 'Challenge', context: 'A sponsor asks for a delivery date before the remaining QC work is complete.', tone: 'Measured concern · professional', pattern: "I'm concerned that [proposal] may not be [realistic outcome].", example: "I'm concerned that the current budget may not be sufficient for the planned campaign.", examples: ["I'm concerned that the current staffing level may not be sustainable during peak season."], explanation: 'Name the concern without blaming anyone. “May not” leaves room to examine the evidence together.', zh: '先表达担忧，再讨论依据；may not 给对方保留讨论空间。', tags: ['Speaking', 'Business communication'] },
    { phrase: 'Could we revisit the timeline in light of the outstanding dependencies?', category: 'Challenge', context: 'Vendor approval and data mapping are still pending. Invite the project team to reconsider the date.', tone: 'Collaborative request · neutral to formal', pattern: 'Could we revisit [plan] in light of [new information]?', example: 'Could we revisit the launch date in light of the revised sales forecast?', examples: ['Could we revisit the hiring plan in light of the budget reduction?'], explanation: '“Revisit” invites a second look. “In light of” connects the request to a reason, rather than a personal preference.', zh: 'revisit 表示重新审视；in light of 把建议和新的客观情况联系起来。', tags: ['Writing', 'Reading vocabulary / collocation'] },
    { phrase: 'Given the remaining activities, we may need to reassess the target date.', category: 'Challenge', context: 'You are summarizing the impact of unfinished work at a project meeting.', tone: 'Evidence-led recommendation · professional', pattern: 'Given [constraint], we may need to reassess [commitment].', example: 'Given the increase in material costs, we may need to reassess the pricing strategy.', examples: ['Given the training still required, we may need to reassess the rollout date.'], explanation: 'Lead with the constraint, then suggest a proportionate response. The sentence opens a discussion; it does not announce a final decision.', zh: '先说约束，再提出可能需要的调整；这不是宣布最终决定。', tags: ['Speaking', 'Writing'] },
    { phrase: 'I would suggest reviewing the key dependencies before confirming the timeline.', category: 'Challenge', context: 'A steering committee wants a commitment before the team has checked what must happen first.', tone: 'Constructive next step · politely assertive', pattern: 'I would suggest [checking something] before [making a commitment].', example: 'I would suggest reviewing the support capacity before agreeing to the new service terms.', examples: ['I would suggest consulting the regional managers before confirming the restructuring plan.'], explanation: 'Offer a concrete action and a sensible sequence. You are helping the group reach a decision, rather than simply objecting.', zh: '给出下一步行动和先后顺序，让异议转化为可执行的建议。', tags: ['Business communication', 'Writing'] }
  ],
  notices: [
    { question: 'Which phrases raise a concern without sounding confrontational?', answer: '“I’m concerned”, “may not”, and “may need to” signal uncertainty respectfully. They soften the claim without hiding the underlying risk.' },
    { question: 'How does the speaker leave room for discussion?', answer: '“Could we revisit” invites joint review. “I would suggest” offers a next step instead of issuing an order. Neither guarantees that the deadline will change.' },
    { question: 'Which expression would you use with a sponsor?', answer: 'All four can work. Use the first to flag a risk, then add evidence and a next step. Use the fourth when you want agreement on what to review before committing.' }
  ],
  choice: {
    context: 'A marketing director wants to launch next Monday. Legal approval is still pending, and you do not yet know when it will arrive. Invite a review before committing.',
    options: [
      { text: 'Could we revisit the launch date in light of the pending legal approval?', explanation: 'Best fit here: it names the dependency and invites a review without inventing a new date.' },
      { text: 'We will launch next Monday, provided legal approval comes through.', explanation: 'A conditional commitment. Useful when the group understands and accepts the condition, but it does not explicitly request the review needed here.' },
      { text: 'I recommend moving the launch to next month.', explanation: 'A clear alternative if evidence supports that date. Here, you have not established how much time is needed.' },
      { text: 'Could you confirm when legal approval is expected?', explanation: 'A useful information-gathering step. It clarifies the dependency, but by itself does not ask the director to reconsider the launch commitment.' }
    ], preferred: 0
  },
  imitations: [
    { label: '1 · Replace the key phrases', context: 'The existing system cannot handle the required file format. Suggest revisiting the data transfer approach.', scaffold: 'Could we revisit [approach] in light of [limitation]?', example: 'Could we revisit the data transfer approach in light of the system’s file format limitations?' },
    { label: '2 · Move to another business context', context: 'Recruitment is taking longer than expected. Invite a review of the onboarding schedule.', scaffold: 'Could we revisit [schedule] in light of [new information]?', example: 'Could we revisit the onboarding schedule in light of the recruitment delays?' },
    { label: '3 · Adjust the tone', context: 'Write to a senior client. Recommend checking support capacity before confirming an expanded service agreement.', scaffold: 'I would suggest [reviewing something] before [confirming a commitment].', example: 'I would suggest reviewing our support capacity before confirming the expanded service agreement.' },
    { label: '4 · Transfer the pattern', context: 'Supplier costs have risen. Suggest reassessing a promotional offer while leaving room for discussion.', scaffold: 'Given [constraint], we may need to reassess [plan].', example: 'Given the increase in supplier costs, we may need to reassess the promotional offer.' }
  ],
  recallContext: 'A software rollout depends on staff training that is still incomplete. Invite the team to reconsider the rollout date.',
  recallModel: 'Could we revisit the rollout date in light of the outstanding staff training?',
  produceContext: 'The sponsor requests an earlier delivery date, but the remaining data transfer and QC activities cannot be shortened. Respond in two or three sentences.',
  produceModel: 'I understand the value of an earlier delivery. Given the remaining data transfer and QC activities, I’m concerned that the proposed date may not be achievable. Could we review the dependencies together before confirming a revised timeline?'
};
