/**
 * Setup script to initialize Supabase Storage bucket for resumes
 * Run this once: pnpm tsx src/scripts/setup-storage.ts
 */

import * as dotenv from 'dotenv'
import { initializeResumeBucket } from '../lib/storage/resumes'

// Load environment variables
dotenv.config()

async function main() {
  console.log('🚀 Initializing Supabase Storage...\n')

  try {
    await initializeResumeBucket()
    
    console.log('\n✅ Storage setup complete!')
    console.log('\nNext steps:')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to Storage > resumes bucket')
    console.log('3. Verify the bucket was created successfully')
    console.log('4. Optionally adjust RLS policies if needed')
    
  } catch (error) {
    console.error('\n❌ Storage setup failed:', error)
    console.error('\nTroubleshooting:')
    console.error('1. Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env')
    console.error('2. Check that your Supabase project is active')
    console.error('3. Verify network connectivity to Supabase')
    process.exit(1)
  }
}

main()

