import { getProgramAnalytics } from './server/db.ts';

const result = await getProgramAnalytics(20);
console.log('Mechanical Engineering GA Scores:');
result.gaScores.forEach(ga => {
  console.log(`${ga.gaCode}: ${ga.score}%`);
});
