// Simple test to verify disposable email domain functionality
// This file demonstrates the disposable email validation logic

// List of disposable domains (simplified version for testing)
const DISPOSABLE_DOMAINS = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.org',
  'yopmail.com',
  'maildrop.cc',
  'sharklasers.com'
]

// Simplified validation function
function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return true;
  return DISPOSABLE_DOMAINS.includes(domain);
}

// Test cases
const testCases = [
  // Regular emails that should be allowed
  { email: 'user@gmail.com', expected: false, description: 'Gmail address' },
  { email: 'user@yahoo.com', expected: false, description: 'Yahoo address' },
  { email: 'user@company.com', expected: false, description: 'Company email' },
  { email: 'user@outlook.com', expected: false, description: 'Outlook address' },

  // Disposable emails that should be blocked
  { email: 'user@10minutemail.com', expected: true, description: '10MinuteMail' },
  { email: 'user@guerrillamail.com', expected: true, description: 'GuerrillaMail' },
  { email: 'user@mailinator.com', expected: true, description: 'Mailinator' },
  { email: 'user@tempmail.org', expected: true, description: 'TempMail' },
  { email: 'user@yopmail.com', expected: true, description: 'YOPmail' },

  // Edge cases
  { email: 'user@10minutemail.com', expected: true, description: '10MinuteMail (case insensitive test)' },
  { email: 'user@10MINUTEMAIL.COM', expected: true, description: '10MinuteMail (uppercase)' },
  { email: 'invalid-email', expected: true, description: 'Invalid email format' },
  { email: 'user@', expected: true, description: 'Email without domain' },
  { email: '', expected: true, description: 'Empty email' },
]

function runTests() {
  console.log('🧪 Testing disposable email domain validation...\n')

  let passed = 0
  let failed = 0

  testCases.forEach((testCase, index) => {
    const result = isDisposableEmail(testCase.email)
    const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL'

    if (result === testCase.expected) {
      passed++
    } else {
      failed++
    }

    console.log(`${status} Test ${index + 1}: ${testCase.description}`)
    console.log(`   Email: "${testCase.email}"`)
    console.log(`   Expected: ${testCase.expected}, Got: ${result}`)
    console.log(`   Status: ${result ? 'BLOCKED (disposable)' : 'ALLOWED (not disposable)'}\n`)
  })

  console.log('📊 Test Results:')
  console.log(`   Passed: ${passed}/${testCases.length}`)
  console.log(`   Failed: ${failed}/${testCases.length}`)
  console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`)

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Disposable email validation is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.')
  }
}

// Run the tests
runTests()