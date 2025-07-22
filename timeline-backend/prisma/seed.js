const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Seed script for Prisma database
 * @description Populates the database with sample data for development and testing
 */

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to preserve data)
  console.log('🧹 Clearing existing data...');
  await prisma.game_moves.deleteMany();
  await prisma.game_sessions.deleteMany();
  await prisma.player_statistics.deleteMany();
  await prisma.category_statistics.deleteMany();
  await prisma.difficulty_statistics.deleteMany();
  await prisma.daily_statistics.deleteMany();
  await prisma.weekly_statistics.deleteMany();
  await prisma.cards.deleteMany();

  // Seed cards with historical events
  console.log('📚 Seeding cards...');
  const cards = await prisma.cards.createMany({
    data: [
      {
        title: 'Invention of the Printing Press',
        date_occurred: new Date('1440-01-01'),
        category: 'Technology',
        difficulty: 3,
        description: 'Johannes Gutenberg invents the movable type printing press in Europe'
      },
      {
        title: 'Discovery of America',
        date_occurred: new Date('1492-10-12'),
        category: 'History',
        difficulty: 2,
        description: 'Christopher Columbus reaches the Americas'
      },
      {
        title: 'French Revolution',
        date_occurred: new Date('1789-07-14'),
        category: 'History',
        difficulty: 4,
        description: 'Storming of the Bastille marks the beginning of the French Revolution'
      },
      {
        title: 'First Moon Landing',
        date_occurred: new Date('1969-07-20'),
        category: 'Science',
        difficulty: 3,
        description: 'Neil Armstrong becomes the first human to walk on the Moon'
      },
      {
        title: 'World Wide Web Invention',
        date_occurred: new Date('1989-03-12'),
        category: 'Technology',
        difficulty: 4,
        description: 'Tim Berners-Lee proposes the World Wide Web at CERN'
      },
      {
        title: 'Fall of the Berlin Wall',
        date_occurred: new Date('1989-11-09'),
        category: 'History',
        difficulty: 3,
        description: 'The Berlin Wall falls, symbolizing the end of the Cold War'
      },
      {
        title: 'First iPhone Release',
        date_occurred: new Date('2007-06-29'),
        category: 'Technology',
        difficulty: 2,
        description: 'Apple releases the first iPhone, revolutionizing mobile technology'
      },
      {
        title: 'Discovery of DNA Structure',
        date_occurred: new Date('1953-04-25'),
        category: 'Science',
        difficulty: 5,
        description: 'Watson and Crick discover the double helix structure of DNA'
      },
      {
        title: 'Declaration of Independence',
        date_occurred: new Date('1776-07-04'),
        category: 'History',
        difficulty: 2,
        description: 'The United States Declaration of Independence is adopted'
      },
      {
        title: 'Theory of Relativity',
        date_occurred: new Date('1905-06-30'),
        category: 'Science',
        difficulty: 5,
        description: 'Einstein publishes his Special Theory of Relativity'
      }
    ]
  });

  console.log(`✅ Created ${cards.count} cards`);

  // Seed sample player statistics
  console.log('👤 Seeding player statistics...');
  const playerStats = await prisma.player_statistics.create({
    data: {
      player_name: 'TestPlayer',
      total_games_played: 10,
      total_games_won: 7,
      total_games_lost: 2,
      total_games_abandoned: 1,
      total_score: 850,
      total_moves: 45,
      total_correct_moves: 38,
      total_incorrect_moves: 7,
      total_play_time_seconds: 1800,
      average_score_per_game: 85.00,
      average_accuracy: 84.44,
      best_score: 95,
      worst_score: 60,
      average_game_duration_seconds: 180,
      favorite_difficulty: 3,
      favorite_categories: ['History', 'Technology'],
      last_played_at: new Date(),
      first_played_at: new Date('2024-01-01'),
      win_rate: 70.00,
      longest_streak: 4
    }
  });

  console.log(`✅ Created player statistics for ${playerStats.player_name}`);

  // Seed sample game session
  console.log('🎮 Seeding game session...');
  const gameSession = await prisma.game_sessions.create({
    data: {
      player_name: 'TestPlayer',
      difficulty_level: 3,
      card_count: 5,
      categories: ['History', 'Technology'],
      status: 'completed',
      score: 85,
      total_moves: 5,
      correct_moves: 4,
      incorrect_moves: 1,
      start_time: new Date('2024-01-15T10:00:00Z'),
      end_time: new Date('2024-01-15T10:05:00Z'),
      duration_seconds: 300
    }
  });

  console.log(`✅ Created game session ${gameSession.id}`);

  // Get some cards for game moves
  const sampleCards = await prisma.cards.findMany({
    take: 5
  });

  // Seed sample game moves
  console.log('🎯 Seeding game moves...');
  const gameMoves = [];
  for (let i = 0; i < sampleCards.length; i++) {
    const move = await prisma.game_moves.create({
      data: {
        session_id: gameSession.id,
        card_id: sampleCards[i].id,
        position_before: i,
        position_after: i + 1,
        is_correct: i < 4, // First 4 moves correct, last one incorrect
        move_number: i + 1,
        time_taken_seconds: 60 + (i * 10)
      }
    });
    gameMoves.push(move);
  }

  console.log(`✅ Created ${gameMoves.length} game moves`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 