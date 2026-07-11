const { PrismaClient } = require('@prisma/client');
const answerKeys = require('../src/data/answerKeys');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding QuestionPool from answerKeys.js...');
  
  let count = 0;
  for (const [moduleId, questions] of Object.entries(answerKeys)) {
    for (const [questionText, answerText] of Object.entries(questions)) {
      await prisma.questionPool.create({
        data: {
          module_id: moduleId,
          type: 'MCQ', // Legacy questions are mapped as basic MCQ/Trivia
          difficulty: 'medium',
          metadata: JSON.stringify({
            question: questionText,
            expectedAnswer: answerText
          })
        }
      });
      count++;
    }
  }

  console.log(`Seeding completed successfully! Inserted ${count} legacy questions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
