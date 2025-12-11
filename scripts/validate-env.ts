/**
 * Environment Variables Validation Script
 * Run with: npx tsx scripts/validate-env.ts
 */

interface EnvVariable {
  name: string;
  required: boolean;
  description: string;
  category: 'openai' | 'evolution' | 'database' | 'kv' | 'app';
  example?: string;
}

const ENV_VARIABLES: EnvVariable[] = [
  // OpenAI Configuration
  {
    name: 'OPENAI_API_KEY',
    required: true,
    description: 'OpenAI API Key for GPT-4',
    category: 'openai',
    example: 'sk-proj-xxxxx',
  },
  {
    name: 'OPENAI_MODEL',
    required: false,
    description: 'OpenAI model to use',
    category: 'openai',
    example: 'gpt-4-turbo-preview',
  },
  {
    name: 'OPENAI_TEMPERATURE',
    required: false,
    description: 'Temperature for AI responses (0-2)',
    category: 'openai',
    example: '0.7',
  },

  // Evolution API Configuration
  {
    name: 'EVOLUTION_API_URL',
    required: true,
    description: 'Evolution API base URL',
    category: 'evolution',
    example: 'https://your-evolution-instance.com',
  },
  {
    name: 'EVOLUTION_API_KEY',
    required: true,
    description: 'Evolution API authentication key',
    category: 'evolution',
    example: 'your-api-key',
  },
  {
    name: 'EVOLUTION_INSTANCE_NAME',
    required: true,
    description: 'WhatsApp instance name in Evolution API',
    category: 'evolution',
    example: 'viva-academy-bot',
  },
  {
    name: 'WHATSAPP_PHONE_NUMBER',
    required: true,
    description: 'WhatsApp business phone number',
    category: 'evolution',
    example: '5511913321718',
  },
  {
    name: 'WEBHOOK_SECRET',
    required: true,
    description: 'Secret for webhook signature validation',
    category: 'evolution',
    example: 'your-webhook-secret',
  },

  // Vercel Postgres
  {
    name: 'POSTGRES_URL',
    required: true,
    description: 'Vercel Postgres connection URL',
    category: 'database',
    example: 'postgres://default:***@***-pooler.us-east-1.postgres.vercel-storage.com/verceldb',
  },
  {
    name: 'POSTGRES_PRISMA_URL',
    required: true,
    description: 'Vercel Postgres Prisma URL',
    category: 'database',
  },
  {
    name: 'POSTGRES_URL_NON_POOLING',
    required: true,
    description: 'Vercel Postgres non-pooling URL',
    category: 'database',
  },

  // Vercel KV (Redis)
  {
    name: 'KV_URL',
    required: true,
    description: 'Vercel KV connection URL',
    category: 'kv',
    example: 'redis://default:***@***.kv.vercel-storage.com:***',
  },
  {
    name: 'KV_REST_API_URL',
    required: true,
    description: 'Vercel KV REST API URL',
    category: 'kv',
  },
  {
    name: 'KV_REST_API_TOKEN',
    required: true,
    description: 'Vercel KV REST API token',
    category: 'kv',
  },
  {
    name: 'KV_REST_API_READ_ONLY_TOKEN',
    required: true,
    description: 'Vercel KV read-only token',
    category: 'kv',
  },

  // Application Configuration
  {
    name: 'NODE_ENV',
    required: false,
    description: 'Application environment',
    category: 'app',
    example: 'development',
  },
  {
    name: 'ALLOWED_ORIGINS',
    required: false,
    description: 'Allowed CORS origins (comma-separated)',
    category: 'app',
    example: 'https://www.vivaacademy.app,https://vivaacademy.app',
  },
  {
    name: 'RATE_LIMIT_WINDOW_MS',
    required: false,
    description: 'Rate limit window in milliseconds',
    category: 'app',
    example: '60000',
  },
  {
    name: 'RATE_LIMIT_MAX_REQUESTS',
    required: false,
    description: 'Maximum requests per window',
    category: 'app',
    example: '20',
  },
];

interface ValidationResult {
  valid: boolean;
  missing: EnvVariable[];
  present: string[];
  warnings: string[];
}

function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    missing: [],
    present: [],
    warnings: [],
  };

  for (const envVar of ENV_VARIABLES) {
    const value = process.env[envVar.name];

    if (!value) {
      if (envVar.required) {
        result.missing.push(envVar);
        result.valid = false;
      } else {
        result.warnings.push(`Optional variable ${envVar.name} not set`);
      }
    } else {
      result.present.push(envVar.name);

      // Validate specific formats
      if (envVar.name === 'OPENAI_TEMPERATURE') {
        const temp = parseFloat(value);
        if (isNaN(temp) || temp < 0 || temp > 2) {
          result.warnings.push(
            `OPENAI_TEMPERATURE should be between 0 and 2 (current: ${value})`
          );
        }
      }

      if (envVar.name === 'WHATSAPP_PHONE_NUMBER' && !/^\d+$/.test(value)) {
        result.warnings.push(
          `WHATSAPP_PHONE_NUMBER should contain only numbers (current: ${value})`
        );
      }
    }
  }

  return result;
}

function printResults(result: ValidationResult): void {
  console.log('\n🔍 Environment Variables Validation\n');
  console.log('='.repeat(60));

  // Group by category
  const categories = ['openai', 'evolution', 'database', 'kv', 'app'];
  const categoryNames = {
    openai: 'OpenAI Configuration',
    evolution: 'Evolution API (WhatsApp)',
    database: 'Vercel Postgres',
    kv: 'Vercel KV (Redis)',
    app: 'Application Config',
  };

  for (const category of categories) {
    const vars = ENV_VARIABLES.filter((v) => v.category === category);
    const present = vars.filter((v) => result.present.includes(v.name));
    const missing = vars.filter((v) => result.missing.some((m) => m.name === v.name));

    console.log(`\n📦 ${categoryNames[category as keyof typeof categoryNames]}`);
    console.log('-'.repeat(60));

    for (const envVar of vars) {
      const isPresent = result.present.includes(envVar.name);
      const isMissing = result.missing.some((m) => m.name === envVar.name);

      const icon = isPresent ? '✅' : isMissing ? '❌' : '⚠️';
      const status = isPresent ? 'SET' : isMissing ? 'MISSING' : 'OPTIONAL';

      console.log(`${icon} ${envVar.name.padEnd(30)} [${status}]`);
      if (!isPresent && envVar.required) {
        console.log(`   ${envVar.description}`);
        if (envVar.example) {
          console.log(`   Example: ${envVar.example}`);
        }
      }
    }
  }

  // Print warnings
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    console.log('-'.repeat(60));
    result.warnings.forEach((warning) => console.log(`   ${warning}`));
  }

  // Print summary
  console.log('\n📊 Summary');
  console.log('='.repeat(60));
  console.log(`Total variables: ${ENV_VARIABLES.length}`);
  console.log(`✅ Present: ${result.present.length}`);
  console.log(`❌ Missing (required): ${result.missing.length}`);
  console.log(`⚠️  Warnings: ${result.warnings.length}`);

  if (result.valid) {
    console.log('\n✅ All required environment variables are set!');
  } else {
    console.log('\n❌ Missing required environment variables!');
    console.log('\n💡 Next steps:');
    console.log('   1. Copy .env.example to .env');
    console.log('   2. Fill in the missing required variables');
    console.log('   3. Run this script again to validate\n');
  }

  console.log('='.repeat(60));
  console.log('');
}

// Main execution
try {
  const result = validateEnvironment();
  printResults(result);
  process.exit(result.valid ? 0 : 1);
} catch (error) {
  console.error('❌ Error validating environment:', error);
  process.exit(1);
}
