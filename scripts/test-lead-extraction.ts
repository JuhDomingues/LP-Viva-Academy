#!/usr/bin/env tsx

// Test lead data extraction regex patterns

const testConversations = [
  {
    name: "Teste 1 - Nome direto",
    messages: [
      { role: 'user', content: 'Meu nome é João Silva' },
      { role: 'user', content: 'joao@email.com' },
      { role: 'user', content: '11987654321' },
    ],
  },
  {
    name: "Teste 2 - Nome em linha separada",
    messages: [
      { role: 'user', content: 'João Silva' },
      { role: 'user', content: 'meu email é joao@email.com' },
      { role: 'user', content: 'telefone: (11) 98765-4321' },
    ],
  },
  {
    name: "Teste 3 - Formatação variada",
    messages: [
      { role: 'user', content: 'Me chamo Maria Santos' },
      { role: 'user', content: 'maria.santos@gmail.com' },
      { role: 'user', content: '11 98765-4321' },
    ],
  },
];

function extractLeadData(messages: Array<{ role: string; content: string }>) {
  const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');

  console.log('📝 Conversation text:');
  console.log(conversationText);
  console.log('');

  // Extract name
  const namePatterns = [
    /(?:meu nome (?:é|eh|e)|me chamo|sou (?:o|a)?) ([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ]+)+)/,
    /^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ][a-záàâãéèêíïóôõöúçñ]+)+)$/m,
  ];

  let extractedName: string | undefined;
  for (const pattern of namePatterns) {
    const match = conversationText.match(pattern);
    if (match && match[1]) {
      extractedName = match[1].trim();
      console.log('✅ Nome extraído:', extractedName, '(pattern:', pattern, ')');
      break;
    }
  }

  if (!extractedName) {
    console.log('❌ Nome NÃO extraído');
  }

  // Extract email
  const emailPattern = /\b([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})\b/;
  const emailMatch = conversationText.match(emailPattern);
  const extractedEmail = emailMatch ? emailMatch[1].toLowerCase() : undefined;

  if (extractedEmail) {
    console.log('✅ Email extraído:', extractedEmail);
  } else {
    console.log('❌ Email NÃO extraído');
  }

  // Extract phone
  const phonePatterns = [
    /(?:telefone|celular|whats|número)?\s*(?:\+?55)?\s*\(?(\d{2})\)?\s*(\d{4,5})[-\s]?(\d{4})/i,
    /\b(\d{2})\s*(\d{4,5})[-\s]?(\d{4})\b/,
    /\b(\d{11})\b/,
  ];

  let extractedPhone: string | undefined;
  for (const pattern of phonePatterns) {
    const match = conversationText.match(pattern);
    if (match) {
      if (match.length === 4) {
        extractedPhone = `${match[1]}${match[2]}${match[3]}`;
      } else {
        extractedPhone = match[1].replace(/\D/g, '');
      }
      console.log('✅ Telefone extraído:', extractedPhone, '(pattern:', pattern, ')');
      break;
    }
  }

  if (!extractedPhone) {
    console.log('❌ Telefone NÃO extraído');
  }

  console.log('');
  console.log('📊 Resultado final:');
  console.log({
    name: extractedName,
    email: extractedEmail,
    phone: extractedPhone,
    hasAllData: !!(extractedName && extractedEmail && extractedPhone),
  });

  return {
    name: extractedName,
    email: extractedEmail,
    phone: extractedPhone,
  };
}

console.log('🧪 TESTANDO EXTRAÇÃO DE DADOS\n');
console.log('='.repeat(60));

for (const test of testConversations) {
  console.log('\n' + test.name);
  console.log('-'.repeat(60));
  extractLeadData(test.messages);
  console.log('='.repeat(60));
}

console.log('\n✅ Testes concluídos!\n');
