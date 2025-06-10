import { NextResponse } from 'next/server';
import { CloudStorage } from '@/lib/storage';

export async function POST() {
  try {
    // Check if API key is configured
    if (!process.env.JSONBIN_API_KEY) {
      return NextResponse.json(
        { 
          error: 'JSONBin API key not configured',
          message: 'Please add JSONBIN_API_KEY to your environment variables',
          instructions: 'Get your API key from https://jsonbin.io and add it to your .env.local file'
        },
        { status: 400 }
      );
    }

    const binId = await CloudStorage.initializeBin();
    
    if (!binId) {
      return NextResponse.json(
        { 
          error: 'Failed to initialize cloud storage',
          message: 'Could not create JSONBin storage. Please check your API key and try again.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      binId,
      message: 'Cloud storage initialized successfully',
      instructions: `Add this to your .env.local file: JSONBIN_BIN_ID=${binId}`,
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to setup cloud storage',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}