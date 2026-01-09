#!/usr/bin/env tsx
/**
 * Test script to verify lead data extraction patterns
 * This simulates a conversation and checks if data is correctly extracted
 */

// Test conversation examples
const testConversations = [
  {
    name: 'Conversa 1 - Formato Natural',
    messages: [
      { role: 'assistant', content: 'Olá! Qual é o seu nome completo?' },
      { role: 'user', content: 'Meu nome é João Silva Santos' },
      { role: 'assistant', content: 'Prazer, João! Qual é o seu email?' },
      { role: 'user', content: 'joao.silva@gmail.com' },
      { role: 'assistant', content: 'Ótimo! E o seu telefone com DDD?' },
      { role: 'user', content: '(11) 98765-4321' },
    ],
    expected: {
      name: 'João Silva Santos',
      email: 'joao.silva@gmail.com',
      phone: '11987654321',
    },
  },
  {
    name: 'Conversa 2 - Formato Direto',
    messages: [
      { role: 'assistant', content: 'Olá! Qual é o seu nome completo?' },
      { role: 'user', content: 'Maria Oliveira Costa' },
      { role: 'assistant', content: 'Prazer! Qual é o seu email?' },
      { role: 'user', content: 'maria.costa@hotmail.com' },
      { role: 'assistant', content: 'E o telefone?' },
      { role: 'user', content: '11987654321' },
    ],
    expected: {
      name: 'Maria Oliveira Costa',
      email: 'maria.costa@hotmail.com',
      phone: '11987654321',
    },
  },
  {
    name: 'Conversa 3 - Me chamo',
    messages: [
      { role: 'assistant', content: 'Olá! Qual é o seu nome?' },
      { role: 'user', content: 'Me chamo Carlos Eduardo Pereira' },
      { role: 'assistant', content: 'Email?' },
      { role: 'user', content: 'carlos.pereira@outlook.com' },
      { role: 'assistant', content: 'Telefone?' },
      { role: 'user', content: '21 99876-5432' },
    ],
    expected: {
      name: 'Carlos Eduardo Pereira',
      email: 'carlos.pereira@outlook.com',
      phone: '21998765432',
    },
  },
  {
    name: 'Conversa 4 - Sou o/a',
    messages: [
      { role: 'assistant', content: 'Qual seu nome?' },
      { role: 'user', content: 'Sou a Ana Paula Rodrigues' },
      { role: 'assistant', content: 'Email?' },
      { role: 'user', content: 'ana.rodrigues@yahoo.com.br' },
      { role: 'assistant', content: 'Telefone?' },
      { role: 'user', content: '+55 47 99123-4567' },
    ],
    expected: {
      name: 'Ana Paula Rodrigues',
      email: 'ana.rodrigues@yahoo.com.br',
      phone: '47991234567',
    },
  },
];

// Extraction patterns (same as in chat-service.ts)
function extractName(messages: Array<{ role: string; content: string }>): string | undefined {
  const namePatterns = [
    // Pattern 1: "Meu nome é João Silva Santos", "Me chamo Maria Costa", "Sou o Carlos Eduardo"
    // Captura APENAS após gatilhos específicos, máximo 50 caracteres
    /(?:meu nome (?:é|eh|e)|me chamo|sou (?:o|a)) +([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑa-záàâãéèêíïóôõöúçñ]+(?: +[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑa-záàâãéèêíïóôõöúçñ]+){1,3})(?:\.|,|!|\?|$)/i,
  ];

  // Extract from user messages only (not assistant responses)
  const userMessages = messages.filter(m => m.role === 'user');

  for (const pattern of namePatterns) {
    for (const msg of userMessages) {
      const match = msg.content.match(pattern);
      if (match && match[1]) {
        const possibleName = match[1].trim();

        // Debug: show what was captured
        console.log(`  [DEBUG] Pattern matched: "${match[0]}"`);
        console.log(`  [DEBUG] Group 1 captured: "${possibleName}"`);

        // Validate it's actually a name
        const words = possibleName.split(/\s+/);
        const triggerWords = ['meu', 'nome', 'chamo', 'sou', 'assistant', 'user', 'qual', 'email', 'telefone', 'perfeito', 'ótimo', 'obrigad'];
        const containsTrigger = triggerWords.some(trigger =>
          possibleName.toLowerCase().includes(trigger)
        );

        // Valid name criteria:
        // - 2 to 4 words (first name + last name(s))
        // - Each word 2-20 characters
        // - No numbers, emails, or trigger words
        // - Total length 4-50 characters
        const isValidName = words.length >= 2 &&
                            words.length <= 4 &&
                            words.every(w => w.length >= 2 && w.length <= 20) &&
                            possibleName.length >= 4 &&
                            possibleName.length <= 50 &&
                            !possibleName.includes('@') &&
                            !/\d/.test(possibleName) &&
                            !containsTrigger;

        if (isValidName) {
          console.log(`  [DEBUG] ✅ Nome válido (com gatilho)`);
          return possibleName;
        } else {
          console.log(`  [DEBUG] Rejected: trigger=${containsTrigger}, words=${words.length}, valid=${isValidName}`);
        }
      }
    }
  }

  // Pattern 2: Direct name response (when assistant asks for name)
  // Fallback for when user responds directly without trigger words
  console.log(`  [DEBUG] Tentando extração direta (sem gatilho)...`);
  for (let i = 0; i < messages.length - 1; i++) {
    const current = messages[i];
    const next = messages[i + 1];

    // Check if assistant asked for name and user responded
    if (
      current.role === 'assistant' &&
      /\b(?:nome|name|chama)\b/i.test(current.content) &&
      next.role === 'user'
    ) {
      const possibleName = next.content.trim();
      const words = possibleName.split(/\s+/);

      console.log(`  [DEBUG] Pergunta sobre nome detectada`);
      console.log(`  [DEBUG] Resposta do usuário: "${possibleName}"`);

      // Negative keywords that indicate this is NOT a name
      const negativeKeywords = [
        'meu', 'nome', 'chamo', 'sou', 'assistant', 'user', 'qual', 'email',
        'telefone', 'perfeito', 'ótimo', 'obrigad', 'sim', 'não', 'ok', 'tudo',
        'bem', 'oi', 'olá', 'quero', 'preciso', 'gostaria', '@', 'http', 'www'
      ];

      const containsNegative = negativeKeywords.some(keyword =>
        possibleName.toLowerCase().includes(keyword)
      );

      // Valid direct name response criteria:
      // - 2 to 4 words (first name + last name(s))
      // - Each word 2-20 characters, starts with letter
      // - No numbers, emails, URLs, or negative keywords
      // - Total length 4-50 characters
      const isValidDirectName = words.length >= 2 &&
                                words.length <= 4 &&
                                words.every(w => w.length >= 2 && w.length <= 20 && /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑa-záàâãéèêíïóôõöúçñ]/.test(w)) &&
                                possibleName.length >= 4 &&
                                possibleName.length <= 50 &&
                                !possibleName.includes('@') &&
                                !/\d/.test(possibleName) &&
                                !containsNegative;

      console.log(`  [DEBUG] Validação: words=${words.length}, containsNegative=${containsNegative}, valid=${isValidDirectName}`);

      if (isValidDirectName) {
        console.log(`  [DEBUG] ✅ Nome válido (resposta direta)`);
        return possibleName;
      }
    }
  }

  console.log(`  [DEBUG] ❌ Nenhum nome extraído`);
  return undefined;
}

function extractEmail(conversationText: string): string | undefined {
  const emailPattern = /\b([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})\b/;
  const emailMatch = conversationText.match(emailPattern);
  return emailMatch ? emailMatch[1].toLowerCase() : undefined;
}

function extractPhone(conversationText: string): string | undefined {
  const phonePatterns = [
    /(?:telefone|celular|whats|número)?\s*(?:\+?55)?\s*\(?(\d{2})\)?\s*(\d{4,5})[-\s]?(\d{4})/i,
    /\b(\d{2})\s*(\d{4,5})[-\s]?(\d{4})\b/,
    /\b(\d{11})\b/,
  ];

  for (const pattern of phonePatterns) {
    const match = conversationText.match(pattern);
    if (match) {
      if (match.length === 4) {
        return `${match[1]}${match[2]}${match[3]}`;
      } else {
        return match[1].replace(/\D/g, '');
      }
    }
  }
  return undefined;
}

// Run tests
console.log('🧪 Testing lead data extraction patterns\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

for (const test of testConversations) {
  console.log(`\n📝 ${test.name}`);
  console.log('-'.repeat(80));

  // Build conversation text like in chat-service.ts
  const conversationText = test.messages
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');

  console.log('Conversation:');
  console.log(conversationText);
  console.log();

  // Extract data
  const extractedName = extractName(test.messages);
  const extractedEmail = extractEmail(conversationText);
  const extractedPhone = extractPhone(conversationText);

  // Compare
  const nameMatch = extractedName === test.expected.name;
  const emailMatch = extractedEmail === test.expected.email;
  const phoneMatch = extractedPhone === test.expected.phone;

  console.log('Results:');
  console.log(
    `  Nome:     ${extractedName || '❌ NÃO EXTRAÍDO'} ${nameMatch ? '✅' : '❌'}`
  );
  console.log(
    `  Email:    ${extractedEmail || '❌ NÃO EXTRAÍDO'} ${emailMatch ? '✅' : '❌'}`
  );
  console.log(
    `  Telefone: ${extractedPhone || '❌ NÃO EXTRAÍDO'} ${phoneMatch ? '✅' : '❌'}`
  );

  if (!nameMatch) {
    console.log(`  Expected name: ${test.expected.name}`);
  }
  if (!emailMatch) {
    console.log(`  Expected email: ${test.expected.email}`);
  }
  if (!phoneMatch) {
    console.log(`  Expected phone: ${test.expected.phone}`);
  }

  const allMatch = nameMatch && emailMatch && phoneMatch;
  if (allMatch) {
    console.log(`  ✅ TODOS OS DADOS EXTRAÍDOS CORRETAMENTE`);
    console.log(`  📤 Enviaria para Mautic: SIM`);
    passed++;
  } else {
    console.log(`  ❌ FALHA NA EXTRAÇÃO`);
    console.log(`  📤 Enviaria para Mautic: NÃO`);
    failed++;
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Resultado Final: ${passed}/${testConversations.length} testes passaram`);
if (failed > 0) {
  console.log(`❌ ${failed} testes falharam`);
  process.exit(1);
} else {
  console.log('✅ Todos os testes passaram!');
  process.exit(0);
}
